# Bukizz Order Process API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Order Workflow](#order-workflow)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Implementation Examples](#implementation-examples)
8. [Testing](#testing)

## Overview

The Bukizz order management system provides a comprehensive e-commerce order processing pipeline with atomic transactions, real-time tracking, customer support integration, and advanced inventory management.

### Key Features

- ✅ Atomic order creation with stock reservation
- ✅ Real-time order tracking and status updates
- ✅ Customer support query system
- ✅ Comprehensive order event logging
- ✅ Multi-variant product support
- ✅ Advanced pricing calculations
- ✅ Payment method flexibility
- ✅ Admin dashboard integration

## Database Architecture

### Core Tables

#### 1. `orders` Table (Main Orders)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(100) NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id),
  status order_status DEFAULT 'initialized',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) DEFAULT 'INR',
  shipping_address JSONB,
  billing_address JSONB,
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  payment_method VARCHAR(100),
  payment_status VARCHAR(50),
  retailer_id UUID REFERENCES retailers(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `order_items` Table (Order Line Items)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  sku VARCHAR(150),
  title VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  product_snapshot JSONB,
  retailer_id UUID REFERENCES retailers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `order_events` Table (Status Tracking)

```sql
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. `order_queries` Table (Customer Support)

```sql
CREATE TABLE order_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  status query_status DEFAULT 'open',
  attachments JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Order Status Enum

```sql
CREATE TYPE order_status AS ENUM (
  'initialized',
  'processed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded'
);
```

### Query Status Enum

```sql
CREATE TYPE query_status AS ENUM (
  'open',
  'pending',
  'resolved',
  'closed'
);
```

## Order Workflow

### 1. Order Creation Flow

```
1. User adds items to cart
2. Calculate order summary (pricing, taxes, fees)
3. Validate shipping address & payment method
4. Atomic stock reservation & order creation
5. Create initial order event (status: 'initialized')
6. Send confirmation email/SMS
7. Return order details to frontend
```

### 2. Order Status Progression

```
initialized → processed → shipped → out_for_delivery → delivered
     ↓
  cancelled (from initialized/processed only)
     ↓
  refunded (from delivered only)
```

### 3. Stock Management Flow

```
Order Creation:
- Reserve stock atomically
- Update product/variant stock levels
- Create stock audit trail

Order Cancellation:
- Release reserved stock
- Restore original stock levels
- Log stock restoration
```

## API Endpoints

### Base URL

```
Production: https://api.bukizz.com/api/v1
Development: http://localhost:5000/api/v1
```

### Authentication

All endpoints require Bearer token authentication:

```http
Authorization: Bearer <jwt_token>
```

### Customer Order Endpoints

#### 1. Create Order

```http
POST /api/v1/orders
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid", // optional
      "quantity": 2,
      "unitPrice": 450.0,
      "totalPrice": 900.0
    }
  ],
  "shippingAddress": {
    "recipientName": "John Doe",
    "phone": "+91-9876543210",
    "line1": "123 Main Street",
    "line2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "billingAddress": {
    /* same structure */
  },
  "contactPhone": "+91-9876543210",
  "contactEmail": "user@example.com",
  "paymentMethod": "cod", // cod, upi, card, netbanking, wallet
  "metadata": {
    "source": "web",
    "deviceInfo": {},
    "promocode": "SAVE10"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-20250917-001",
      "status": "initialized",
      "totalAmount": 950.00,
      "currency": "INR",
      "paymentMethod": "cod",
      "paymentStatus": "pending",
      "estimatedDeliveryDate": "2025-09-20",
      "items": [...],
      "shippingAddress": {...},
      "createdAt": "2025-09-17T10:30:00Z"
    },
    "orderSummary": {
      "subtotal": 900.00,
      "deliveryFee": 30.00,
      "platformFee": 10.00,
      "tax": 10.00,
      "total": 950.00,
      "savings": 0.00
    },
    "nextSteps": [
      "Your order is being prepared",
      "You will receive a confirmation SMS/email shortly"
    ]
  },
  "meta": {
    "processingTime": 1234,
    "timestamp": "2025-09-17T10:30:00Z"
  }
}
```

#### 2. Calculate Order Summary

```http
POST /api/v1/orders/calculate
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "subtotal": 900.00,
    "deliveryFee": 30.00,
    "platformFee": 10.00,
    "tax": 10.00,
    "total": 950.00,
    "currency": "INR",
    "retailerCount": 1,
    "savings": 50.00
  }
}
```

#### 3. Get User Orders

```http
GET /api/v1/orders/my-orders?page=1&limit=20&status=delivered
```

**Query Parameters:**

- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `status` (string): Filter by order status
- `startDate` (date): Filter orders from date
- `endDate` (date): Filter orders to date
- `sortBy` (string): Sort field (default: created_at)
- `sortOrder` (string): asc/desc (default: desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 4. Get Order Details

```http
GET /api/v1/orders/{orderId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-20250917-001",
    "status": "shipped",
    "totalAmount": 950.00,
    "items": [...],
    "events": [...],
    "canCancel": false,
    "canReturn": false,
    "trackingInfo": {
      "trackingNumber": "TRK123456789",
      "carrier": "Local Delivery",
      "trackingUrl": "https://track.bukizz.com/TRK123456789"
    }
  }
}
```

#### 5. Track Order

```http
GET /api/v1/orders/{orderId}/track
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "orderNumber": "ORD-20250917-001",
    "status": "shipped",
    "estimatedDeliveryDate": "2025-09-20",
    "trackingNumber": "TRK123456789",
    "timeline": [
      {
        "status": "initialized",
        "timestamp": "2025-09-17T10:30:00Z",
        "note": "Order created successfully",
        "location": "Processing Center"
      },
      {
        "status": "processed",
        "timestamp": "2025-09-17T14:15:00Z",
        "note": "Order ready for shipment",
        "location": "Warehouse Mumbai"
      }
    ],
    "currentLocation": "In Transit",
    "nextUpdate": "2025-09-18T10:00:00Z"
  }
}
```

#### 6. Cancel Order

```http
PUT /api/v1/orders/{orderId}/cancel
```

**Request Body:**

```json
{
  "reason": "Changed mind about purchase",
  "refundRequested": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "refundStatus": "processing",
    "updatedAt": "2025-09-17T15:30:00Z"
  }
}
```

### Customer Support Endpoints

#### 7. Create Order Query

```http
POST /api/v1/orders/{orderId}/queries
```

**Request Body:**

```json
{
  "subject": "Delivery delay inquiry",
  "message": "My order was supposed to be delivered today but hasn't arrived yet.",
  "priority": "normal", // low, normal, high, urgent
  "category": "delivery", // delivery, product, payment, refund, general
  "attachments": [
    {
      "filename": "order_screenshot.jpg",
      "url": "https://uploads.bukizz.com/...",
      "mimeType": "image/jpeg",
      "size": 102400
    }
  ]
}
```

#### 8. Get Order Queries

```http
GET /api/v1/orders/{orderId}/queries
```

### Admin/Retailer Endpoints

#### 9. Search Orders

```http
GET /api/v1/orders/admin/search?status=processed&page=1&limit=50
```

**Query Parameters:**

- `status` (string): Filter by status
- `userId` (uuid): Filter by customer
- `paymentStatus` (string): Filter by payment status
- `startDate` (date): Date range start
- `endDate` (date): Date range end
- `searchTerm` (string): Search in order number, email, phone
- `sortBy` (string): Sort field
- `sortOrder` (string): asc/desc
- `page` (int): Page number
- `limit` (int): Items per page

#### 10. Update Order Status

```http
PUT /api/v1/orders/{orderId}/status
```

**Request Body:**

```json
{
  "status": "shipped",
  "note": "Order shipped via BlueDart",
  "metadata": {
    "trackingNumber": "BD123456789",
    "carrier": "BlueDart",
    "estimatedDelivery": "2025-09-20",
    "location": {
      "lat": 19.076,
      "lng": 72.8777,
      "address": "Mumbai Depot"
    }
  }
}
```

#### 11. Bulk Update Orders

```http
PUT /api/v1/orders/admin/bulk-update
```

**Request Body:**

```json
{
  "updates": [
    {
      "orderId": "uuid1",
      "status": "shipped",
      "note": "Bulk shipment batch #123"
    },
    {
      "orderId": "uuid2",
      "status": "shipped",
      "note": "Bulk shipment batch #123"
    }
  ]
}
```

#### 12. Get Order Statistics

```http
GET /api/v1/orders/admin/statistics?startDate=2025-09-01&endDate=2025-09-30
```

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalOrders": 1250,
      "totalRevenue": 125000.00,
      "averageOrderValue": 100.00,
      "completionRate": 94.5
    },
    "statusBreakdown": {
      "initialized": 45,
      "processed": 120,
      "shipped": 200,
      "delivered": 850,
      "cancelled": 30,
      "refunded": 5
    },
    "revenueByDay": [...],
    "topProducts": [...],
    "customerSegments": {...}
  }
}
```

#### 13. Export Orders

```http
GET /api/v1/orders/admin/export?format=csv&startDate=2025-09-01
```

## Data Models

### Order Model

```typescript
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  contactPhone: string;
  contactEmail: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  retailerId?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  metadata: OrderMetadata;
  items: OrderItem[];
  events: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}
```

### Order Item Model

```typescript
interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: ProductSnapshot;
  retailerId?: string;
  createdAt: string;
}
```

### Order Event Model

```typescript
interface OrderEvent {
  id: string;
  orderId: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  changedBy?: string;
  changedByName?: string;
  note?: string;
  metadata: EventMetadata;
  createdAt: string;
}
```

### Order Query Model

```typescript
interface OrderQuery {
  id: string;
  orderId: string;
  userId: string;
  subject: string;
  message: string;
  priority: QueryPriority;
  status: QueryStatus;
  assignedTo?: string;
  resolutionNote?: string;
  attachments?: Attachment[];
  metadata: QueryMetadata;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

### Common Error Codes

| Code                        | HTTP Status | Description               |
| --------------------------- | ----------- | ------------------------- |
| `VALIDATION_ERROR`          | 400         | Request validation failed |
| `UNAUTHORIZED`              | 401         | Authentication required   |
| `FORBIDDEN`                 | 403         | Access denied             |
| `ORDER_NOT_FOUND`           | 404         | Order doesn't exist       |
| `INSUFFICIENT_STOCK`        | 409         | Not enough inventory      |
| `INVALID_STATUS_TRANSITION` | 400         | Invalid status change     |
| `CANCELLATION_NOT_ALLOWED`  | 400         | Order cannot be cancelled |
| `PAYMENT_FAILED`            | 402         | Payment processing failed |
| `RATE_LIMIT_EXCEEDED`       | 429         | Too many requests         |
| `SERVICE_UNAVAILABLE`       | 503         | Service temporarily down  |

### Error Response Format

```json
{
  "success": false,
  "error": "Insufficient stock for Mathematics Textbook",
  "code": "INSUFFICIENT_STOCK",
  "details": {
    "productId": "uuid",
    "requestedQuantity": 5,
    "availableStock": 2
  },
  "timestamp": "2025-09-17T10:30:00Z"
}
```

## Implementation Examples

### Frontend Order Creation (React)

```javascript
// Store: orderStore.js
const placeOrder = async (orderData) => {
  try {
    // Step 1: Validate cart items
    const validation = await validateCartItems(orderData.items);
    if (!validation.allValid) {
      throw new Error(validation.errors.join("; "));
    }

    // Step 2: Calculate final summary
    const orderSummary = await calculateFinalOrderSummary(orderData.items);

    // Step 3: Submit order
    const response = await fetch("http://localhost:5000/api/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...orderData,
        orderSummary,
        metadata: {
          source: "web",
          deviceInfo: getDeviceInfo(),
          orderPlacedAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Order creation failed");
    }

    const data = await response.json();
    return data.data.order;
  } catch (error) {
    console.error("Order placement failed:", error);
    throw error;
  }
};
```

### Backend Order Service (Node.js)

```javascript
// services/orderService.js
class OrderService {
  async createOrder(orderData) {
    return await this.orderRepository.executeTransaction(async (connection) => {
      // Step 1: Validate and reserve stock
      const validatedItems = await this._validateAndReserveStock(
        connection,
        orderData.items
      );

      // Step 2: Calculate final pricing
      const orderSummary = await this._calculateAtomicOrderSummary(
        connection,
        validatedItems
      );

      // Step 3: Create order record
      const order = await this.orderRepository.createWithConnection(
        connection,
        {
          ...orderData,
          items: validatedItems,
          totalAmount: orderSummary.total,
          status: "initialized",
        }
      );

      // Step 4: Create order event
      await this.orderEventRepository.createWithConnection(connection, {
        orderId: order.id,
        newStatus: "initialized",
        changedBy: orderData.userId,
        note: "Order created successfully",
      });

      // Step 5: Update stock levels
      await this._updateStockLevels(connection, validatedItems);

      return order;
    });
  }
}
```

### Database Queries

#### Get Order with Complete Details

```sql
SELECT
  o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'productId', oi.product_id,
      'variantId', oi.variant_id,
      'sku', oi.sku,
      'title', oi.title,
      'quantity', oi.quantity,
      'unitPrice', oi.unit_price,
      'totalPrice', oi.total_price,
      'productSnapshot', oi.product_snapshot
    )
  ) as items,
  (
    SELECT json_agg(
      json_build_object(
        'id', oe.id,
        'previousStatus', oe.previous_status,
        'newStatus', oe.new_status,
        'changedBy', oe.changed_by,
        'note', oe.note,
        'createdAt', oe.created_at
      ) ORDER BY oe.created_at DESC
    )
    FROM order_events oe
    WHERE oe.order_id = o.id
  ) as events
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = $1
GROUP BY o.id;
```

#### Order Statistics Query

```sql
SELECT
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_order_value,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 / COUNT(*),
    2
  ) as completion_rate
FROM orders
WHERE created_at >= $1 AND created_at <= $2;
```

## Testing

### Unit Tests (Jest)

```javascript
describe("OrderService", () => {
  test("should create order with atomic transaction", async () => {
    const orderData = {
      userId: "user-123",
      items: [{ productId: "prod-123", quantity: 2 }],
      shippingAddress: {
        /* valid address */
      },
      paymentMethod: "cod",
    };

    const order = await orderService.createOrder(orderData);

    expect(order.id).toBeDefined();
    expect(order.status).toBe("initialized");
    expect(order.items).toHaveLength(1);
  });

  test("should handle insufficient stock error", async () => {
    const orderData = {
      items: [{ productId: "prod-123", quantity: 999 }],
    };

    await expect(orderService.createOrder(orderData)).rejects.toThrow(
      "Insufficient stock"
    );
  });
});
```

### API Tests (Postman/Newman)

```json
{
  "name": "Create Order - Success",
  "request": {
    "method": "POST",
    "url": "{{baseUrl}}/api/v1/orders",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{authToken}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"items\": [...],\n  \"shippingAddress\": {...}\n}"
    }
  },
  "tests": [
    "pm.test('Status code is 201', () => {",
    "  pm.response.to.have.status(201);",
    "});",
    "pm.test('Response has order ID', () => {",
    "  const response = pm.response.json();",
    "  pm.expect(response.data.order.id).to.exist;",
    "});"
  ]
}
```

### Load Testing (Artillery)

```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
  headers:
    Authorization: "Bearer {{authToken}}"

scenarios:
  - name: "Create Order Flow"
    flow:
      - post:
          url: "/api/v1/orders/calculate"
          json:
            items: [{ productId: "test-product", quantity: 1 }]
      - post:
          url: "/api/v1/orders"
          json:
            items: [{ productId: "test-product", quantity: 1 }]
            shippingAddress: { /* test address */ }
```

## Rate Limiting

### Order Creation

- **15 minutes window**: 20 orders per user
- **Purpose**: Prevent order spam and abuse

### Order Queries

- **1 minute window**: 60 requests per user
- **Purpose**: Allow reasonable browsing of order data

### Implementation

```javascript
const orderCreationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 orders per 15 minutes per user
  message: {
    success: false,
    error: "Too many order attempts. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});
```

## Performance Considerations

### Database Optimization

- **Indexes**: Created on frequently queried fields (user_id, status, created_at)
- **Transactions**: All order operations use atomic transactions
- **Connection Pooling**: Supabase handles connection management
- **Query Optimization**: Use prepared statements and selective field loading

### Caching Strategy

- **Order Summary**: Cache calculated pricing for 5 minutes
- **Product Data**: Cache product/variant details for stock validation
- **User Data**: Cache user preferences and addresses

### Monitoring

- **Order Processing Time**: Track average order creation time
- **Error Rates**: Monitor failed order attempts and reasons
- **Stock Conflicts**: Track inventory conflicts and resolution
- **Customer Support**: Monitor query response times

---

## Quick Reference

### Order Status Flow

```
initialized → processed → shipped → out_for_delivery → delivered
                ↓              ↓
            cancelled    cancelled
                ↓
            refunded
```

### Critical Endpoints

- **Create Order**: `POST /api/v1/orders`
- **Get Orders**: `GET /api/v1/orders/my-orders`
- **Track Order**: `GET /api/v1/orders/{id}/track`
- **Cancel Order**: `PUT /api/v1/orders/{id}/cancel`
- **Order Support**: `POST /api/v1/orders/{id}/queries`

### Database Tables Relationship

```
orders (1) ←→ (N) order_items     [What was ordered]
   ↓
orders (1) ←→ (N) order_events    [Status history]
   ↓
orders (1) ←→ (N) order_queries   [Customer support]
```

### Key Configuration

- **Base URL**: `http://localhost:5000/api/v1`
- **Auth**: Bearer token required for all endpoints
- **Rate Limits**: 20 orders/15min, 60 queries/1min
- **Max Items**: 1000 per order item
- **Pagination**: Default 20, max 100 per page

This documentation serves as a comprehensive reference for the Bukizz order management system. For specific implementation details, refer to the source code in the respective service and controller files.
