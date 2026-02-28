# Bukizz Server - Complete API Context Document

> **Generated:** 2026-02-14
> **Purpose:** Comprehensive server context for AI analysis and development

---

## 1. PROJECT OVERVIEW

**Bukizz** is a School E-commerce platform built with **Node.js/Express** backend and **Supabase (PostgreSQL)** as the database. The platform enables:
- Schools to list and manage their product catalogs (books, uniforms, stationery)
- Retailers/Warehouses to manage inventory
- Customers (parents/students) to browse, order, and pay for school supplies
- Razorpay-based payment processing
- Admin dashboard for order/user/product management

---

## 2. TECH STACK

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js >= 18 (ES Modules) |
| Framework | Express 4.18 |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (jsonwebtoken) + Supabase Auth + Google OAuth |
| Payments | Razorpay |
| Validation | Joi |
| File Upload | Multer (memory storage → Supabase Storage) |
| Logging | Winston |
| Security | Helmet, CORS, express-rate-limit, bcryptjs |
| Email | Nodemailer |
| Package Type | ES Modules (`"type": "module"`) |

### package.json dependencies:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.5",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.2",
    "mysql2": "^3.14.5",
    "nodemailer": "^7.0.12",
    "razorpay": "^2.9.6",
    "uuid": "^9.0.1",
    "winston": "^3.11.0"
  }
}
```

---

## 3. FOLDER STRUCTURE

```
server/
├── index.js                          # Main entry point, bootstraps app
├── package.json
├── Dockerfile
├── docker-compose.yml
├── healthcheck.js
├── nodemon.json
├── src/
│   ├── app.js                        # Alternative app factory (CJS, not actively used)
│   ├── config/
│   │   ├── index.js                  # Central config (env vars, DB, JWT, CORS, etc.)
│   │   └── dependencies.js           # DI container factory
│   ├── controllers/                  # HTTP request handlers
│   │   ├── authController.js
│   │   ├── brandController.js
│   │   ├── categoryController.js
│   │   ├── imageController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── pincodeController.js
│   │   ├── productController.js
│   │   ├── retailerController.js
│   │   ├── schoolController.js
│   │   ├── userController.js
│   │   └── warehouseController.js
│   ├── db/
│   │   ├── index.js                  # Supabase client init, query helpers
│   │   ├── schema.sql                # Full PostgreSQL DDL
│   │   ├── init.sql
│   │   ├── functions/                # DB functions
│   │   └── migration_*.sql           # Various migration files
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT auth, role-based access, ownership check
│   │   ├── errorHandler.js           # AppError class, global error handler, asyncHandler
│   │   ├── rateLimiter.js            # Configurable rate limiting
│   │   ├── upload.js                 # Multer config for image uploads
│   │   ├── validator.js              # Joi validation middleware factory
│   │   └── index.js
│   ├── models/
│   │   └── schemas.js                # ALL Joi validation schemas (891 lines)
│   ├── repositories/                 # Data Access Layer (Supabase queries)
│   │   ├── brandRepository.js        (215 lines)
│   │   ├── categoryRepository.js     (300 lines)
│   │   ├── orderEventRepository.js   (365 lines)
│   │   ├── orderQueryRepository.js   (347 lines)
│   │   ├── orderRepository.js        (757 lines)
│   │   ├── otpRepository.js          (81 lines)
│   │   ├── pincodeRepository.js      (29 lines)
│   │   ├── productImageRepository.js (255 lines)
│   │   ├── productOptionRepository.js(345 lines)
│   │   ├── productRepository.js      (1660 lines)
│   │   ├── productVariantRepository.js(330 lines)
│   │   ├── retailerRepository.js     (90 lines)
│   │   ├── schoolRepository.js       (1164 lines)
│   │   ├── userRepository.js         (758 lines)
│   │   └── warehouseRepository.js    (297 lines)
│   ├── routes/                       # Express route definitions
│   │   ├── index.js                  # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── brandRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── imageRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── pincodeRoutes.js
│   │   ├── productRoutes.js
│   │   ├── retailerRoutes.js
│   │   ├── schoolRoutes.js
│   │   ├── userRoutes.js
│   │   └── warehouseRoutes.js
│   ├── services/                     # Business Logic Layer
│   │   ├── authService.js            (751 lines)
│   │   ├── categoryService.js        (164 lines)
│   │   ├── emailService.js           (115 lines)
│   │   ├── imageService.js           (138 lines)
│   │   ├── orderService.js           (1499 lines)
│   │   ├── productService.js         (1743 lines)
│   │   ├── retailerService.js        (84 lines)
│   │   ├── schoolService.js          (717 lines)
│   │   ├── userService.js            (682 lines)
│   │   └── warehouseService.js       (196 lines)
│   └── utils/
│       └── logger.js                 # Winston logger with correlation IDs
└── scripts/
    ├── testCategoryApi.js
    ├── testOrderApi.js
    └── testSchoolApi.js
```

---

## 4. ARCHITECTURE PATTERN

The server uses a **3-Layer Architecture** with Dependency Injection:

```
Routes → Controllers → Services → Repositories → Supabase (PostgreSQL)
```

- **Routes**: Define HTTP endpoints, apply middleware (auth, validation, rate limiting)
- **Controllers**: Handle HTTP request/response, delegate to services
- **Services**: Business logic, orchestration, validation beyond schema
- **Repositories**: Pure data access layer, Supabase queries
- **Middleware**: Auth, validation, error handling, file upload, rate limiting

### Dependency Injection
The `config/dependencies.js` creates a DI container:
```javascript
export function createDependencies(overrides = {}) {
  const db = overrides.db || getDB();
  // Repositories → Services → Controllers
  // All wired up and returned as a container object
}
```

Routes receive `dependencies` object and extract their controller.

---

## 5. DATABASE SCHEMA (PostgreSQL / Supabase)

### Tables & Relationships:

```
users                     ← Core user table (UUID PK)
  ├── user_auths          ← Auth providers (email/google)
  ├── refresh_tokens      ← JWT refresh tokens
  ├── password_resets      ← Password reset tokens
  └── addresses            ← User shipping/billing addresses

schools                   ← School entities
  └── product_schools     ← M:N with products (includes grade, mandatory flag)

retailers                 ← Retailer/supplier entities

categories                ← Self-referencing tree (parent_id)
brands                    ← Product brands

products                  ← Core product table
  ├── product_categories  ← M:N junction
  ├── product_brands      ← M:N junction
  ├── product_schools     ← M:N junction (with grade)
  ├── product_option_attributes ← Option groups (size, color, etc.)
  │   └── product_option_values ← Individual option values
  ├── product_variants    ← SKU variants with option combinations
  └── product_images      ← Product/variant images

orders                    ← Order header
  ├── order_items         ← Line items with product snapshots
  ├── order_events        ← Status change history/tracking
  └── order_queries       ← Customer support tickets
```

### Key Enums:
- `order_status`: initialized → processed → shipped → out_for_delivery → delivered | cancelled | refunded
- `payment_status`: pending → paid | failed | refunded
- `product_type`: bookset, uniform, stationary, general
- `auth_provider`: email, google
- `query_status`: open, pending, resolved, closed

### RPC Functions:
- `increment_variant_stock(variant_id, quantity)`
- `decrement_variant_stock(variant_id, quantity)`

---

## 6. COMPLETE API ROUTE MAP

**Base URL:** `/api/v1`

### 6.1 Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register with email/password |
| POST | `/login` | ❌ | Login with email/password (supports loginAs role) |
| POST | `/google-login` | ❌ | Google OAuth login |
| POST | `/refresh-token` | ❌ | Refresh JWT tokens |
| POST | `/forgot-password` | ❌ | Request password reset |
| POST | `/reset-password` | ❌ | Reset password with token |
| POST | `/verify-token` | ❌ | Verify JWT token validity |
| POST | `/send-otp` | ❌ | Send email OTP for registration |
| POST | `/verify-otp` | ❌ | Verify OTP and complete registration |
| GET | `/me` | ✅ | Get authenticated user profile |
| POST | `/logout` | ✅ | Logout and revoke tokens |

### 6.2 User Routes (`/api/v1/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verify-email/confirm` | ❌ | Confirm email verification (public) |
| GET | `/profile` | ✅ | Get user profile |
| PUT | `/profile` | ✅ | Update user profile |
| GET | `/addresses` | ✅ | List user addresses |
| POST | `/addresses` | ✅ | Add address |
| PUT | `/addresses/:addressId` | ✅ | Update address |
| DELETE | `/addresses/:addressId` | ✅ | Delete address |
| GET | `/preferences` | ✅ | Get user preferences |
| PUT | `/preferences` | ✅ | Update user preferences |
| GET | `/stats` | ✅ | Get user statistics |
| DELETE | `/account` | ✅ | Deactivate account |
| POST | `/verify-email` | ✅ | Initiate email verification |
| POST | `/verify-phone` | ✅ | Verify phone number |
| GET | `/admin/search` | ✅ | Search users (admin) |
| GET | `/admin/export` | ✅ | Export users data (admin) |
| GET | `/admin/:userId` | ✅ | Get user by ID (admin) |
| PUT | `/admin/:userId` | ✅ | Update user (admin) |
| PUT | `/admin/:userId/role` | ✅ | Update user role (admin) |
| POST | `/admin/:userId/reactivate` | ✅ | Reactivate user (admin) |

### 6.3 Product Routes (`/api/v1/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Search/list products (paginated, filtered) |
| GET | `/retailer-search` | ❌ | Search by retailer |
| GET | `/featured` | ❌ | Get featured products |
| GET | `/stats` | ❌ | Get product statistics |
| GET | `/variants/search` | ❌ | Search variants |
| GET | `/variants/:variantId` | ❌ | Get variant by ID |
| GET | `/category/:categorySlug` | ❌ | Products by category slug |
| GET | `/brand/:brandId` | ❌ | Products by brand |
| GET | `/type/:productType` | ❌ | Products by type |
| GET | `/school/:schoolId` | ❌ | Products for a school |
| GET | `/:id` | ❌ | Get product by ID |
| GET | `/:id/complete` | ❌ | Full product details (images, brands, retailer) |
| GET | `/:id/analytics` | ❌ | Product analytics |
| GET | `/:id/availability` | ❌ | Check availability |
| GET | `/:id/options` | ❌ | Product options structure |
| GET | `/:id/variants` | ❌ | Product variants |
| GET | `/:id/images` | ❌ | Product images |
| GET | `/variants/:variantId/images` | ❌ | Variant images |
| GET | `/:id/brands` | ❌ | Product brands |
| GET | `/admin/search` | ✅ | Admin search (flexible filters, includes deleted) |
| POST | `/` | ✅ | Create product |
| POST | `/comprehensive` | ✅ | Create product with all related data atomically |
| PUT | `/:id` | ✅ | Update product |
| PUT | `/:id/comprehensive` | ✅ | Update product with all related data |
| DELETE | `/:id` | ✅ | Soft delete product |
| PATCH | `/:id/activate` | ✅ | Activate product |
| POST | `/:id/options` | ✅ | Add option attribute |
| POST | `/options/:attributeId/values` | ✅ | Add option value |
| PUT | `/options/:attributeId` | ✅ | Update option attribute |
| PUT | `/options/values/:valueId` | ✅ | Update option value |
| DELETE | `/options/:attributeId` | ✅ | Delete option attribute |
| DELETE | `/options/values/:valueId` | ✅ | Delete option value |
| PUT | `/bulk-update` | ✅ | Bulk update products |
| POST | `/:id/variants` | ✅ | Create variant |
| PUT | `/variants/:variantId` | ✅ | Update variant |
| DELETE | `/variants/:variantId` | ✅ | Delete variant |
| PATCH | `/variants/:variantId/stock` | ✅ | Update variant stock |
| PUT | `/variants/bulk-stock-update` | ✅ | Bulk update stocks |
| POST | `/:id/images` | ✅ | Add image (file upload or URL) |
| POST | `/:id/images/bulk` | ✅ | Add multiple images |
| PUT | `/images/:imageId` | ✅ | Update image |
| DELETE | `/images/:imageId` | ✅ | Delete image |
| PATCH | `/:id/images/:imageId/primary` | ✅ | Set primary image |
| POST | `/:id/variants/images/bulk` | ✅ | Bulk upload variant images |
| POST | `/:id/brands` | ✅ | Add brand to product |
| DELETE | `/:id/brands/:brandId` | ✅ | Remove brand from product |
| POST | `/:id/retailer` | ✅ | Add retailer to product |
| PUT | `/:id/retailer` | ✅ | Update retailer details |
| DELETE | `/:id/retailer` | ✅ | Remove retailer from product |

### 6.4 Order Routes (`/api/v1/orders`)

All order routes require authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | ✅ | customer | Place order (rate limited) |
| POST | `/place` | ✅ | customer | Place order (alias) |
| POST | `/calculate-summary` | ✅ | customer | Cart preview/summary calculation |
| GET | `/my-orders` | ✅ | customer | Get current user's orders |
| GET | `/:orderId` | ✅ | customer | Get order details |
| GET | `/:orderId/track` | ✅ | customer | Track order status |
| PUT | `/:orderId/cancel` | ✅ | customer | Cancel order |
| PUT | `/:orderId/items/:itemId/cancel` | ✅ | customer | Cancel specific item |
| POST | `/:orderId/queries` | ✅ | customer | Create support ticket |
| GET | `/:orderId/queries` | ✅ | customer | Get support tickets |
| GET | `/admin/search` | ✅ | admin/retailer | Search/filter orders |
| GET | `/admin/status/:status` | ✅ | admin/retailer | Orders by status |
| PUT | `/:orderId/status` | ✅ | admin/retailer | Update order status |
| PUT | `/:orderId/items/:itemId/status` | ✅ | admin/retailer | Update item status |
| PUT | `/:orderId/payment` | ✅ | admin/system | Update payment status |
| PUT | `/admin/bulk-update` | ✅ | admin | Bulk update orders |
| GET | `/admin/export` | ✅ | admin | Export orders |
| GET | `/admin/statistics` | ✅ | admin/retailer | Order stats/analytics |

### 6.5 School Routes (`/api/v1/schools`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Search schools (paginated, filtered) |
| GET | `/stats` | ❌ | School statistics |
| GET | `/popular` | ❌ | Popular schools |
| GET | `/nearby` | ❌ | Nearby schools (geolocation) |
| POST | `/validate` | ❌ | Validate school data |
| GET | `/city/:city` | ❌ | Schools by city |
| GET | `/:id` | ❌ | Get school by ID |
| GET | `/:id/analytics` | ❌ | School analytics |
| GET | `/:id/catalog` | ❌ | School product catalog |
| POST | `/` | ✅ | Create school (with image upload) |
| PUT | `/:id` | ✅ | Update school (with image upload) |
| DELETE | `/:id` | ✅ | Deactivate school |
| PATCH | `/:id/reactivate` | ✅ | Reactivate school |
| POST | `/bulk-import` | ✅ | Bulk import schools |
| POST | `/upload-image` | ✅ | Upload school image |
| POST | `/:schoolId/products/:productId` | ✅ | Associate product with school |
| PUT | `/:schoolId/products/:productId/:grade` | ✅ | Update association |
| DELETE | `/:schoolId/products/:productId` | ✅ | Remove association |
| POST | `/:id/partnerships` | ✅ | Create partnership |

### 6.6 Category Routes (`/api/v1/categories`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Search/list categories |
| GET | `/:id` | ❌ | Get category by ID |
| POST | `/` | ✅ | Create category (with image) |
| PUT | `/:id` | ✅ | Update category (with image) |
| DELETE | `/:id` | ✅ | Delete category |

### 6.7 Brand Routes (`/api/v1/brands`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Search/list brands |
| GET | `/:id` | ❌ | Get brand by ID |
| POST | `/` | ✅ | Create brand |
| PUT | `/:id` | ✅ | Update brand |
| DELETE | `/:id` | ✅ | Delete brand |

### 6.8 Payment Routes (`/api/v1/payments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/webhook` | ❌ | Razorpay webhook handler |
| POST | `/create-order` | ✅ | Create Razorpay payment order |
| POST | `/verify` | ✅ | Verify payment signature |
| POST | `/failure` | ✅ | Log payment failure |

### 6.9 Warehouse Routes (`/api/v1/warehouses`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create warehouse (retailer) |
| POST | `/admin` | ✅ | Create warehouse (admin) |
| GET | `/` | ✅ | Get my warehouses |
| PUT | `/admin/:id` | ✅ | Update warehouse (admin) |
| DELETE | `/admin/:id` | ✅ | Delete warehouse (admin) |
| GET | `/retailer/:retailerId` | ✅ | Get retailer's warehouses |
| PUT | `/:id` | ✅ | Update warehouse |
| GET | `/:id` | ✅ | Get warehouse by ID |
| DELETE | `/:id` | ✅ | Delete warehouse |

### 6.10 Pincode Routes (`/api/v1/pincodes`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/check/:pincode` | ❌ | Check delivery availability |

### 6.11 Image Routes (`/api/v1/images`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | ✅ | Upload image to Supabase Storage |
| DELETE | `/delete` | ✅ | Delete image |
| PUT | `/replace` | ✅ | Replace existing image |

### 6.12 Retailer Routes (`/api/v1/retailer`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/data` | ✅ | retailer | Create/update retailer profile (with signature) |
| GET | `/data` | ✅ | any | Get retailer profile |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (status, uptime, version) |
| GET | `/api` | API documentation listing |

---

## 7. MIDDLEWARE STACK

### 7.1 Authentication (`authMiddleware.js`)
- `authenticateToken` — Verifies JWT Bearer token, adds `req.user`, `req.token`
- `optionalAuth` — Adds user if token present, doesn't block
- `requireRoles(...roles)` — Role-based access (admin, retailer, customer)
- `requireOwnership(paramName)` — Ensure user owns the resource
- `requireVerification` — Require email verified
- `requireActiveUser` — Require active account

### 7.2 Validation (`validator.js`)
- `validate(schema, property)` — Joi validation with auto JSON parsing for FormData
- `sanitizeMiddleware` — XSS prevention

### 7.3 Error Handling (`errorHandler.js`)
- `AppError` class — Structured errors with status codes
- `errorHandler` — Global Express error handler
- `asyncHandler(fn)` — Wraps async route handlers
- `notFoundHandler` — 404 handler

### 7.4 Rate Limiting (`rateLimiter.js`)
- `createRateLimiter(options)` — Configurable rate limiter
- `createAuthRateLimiter()` — Stricter limiter for auth endpoints

### 7.5 File Upload (`upload.js`)
- Multer with memory storage, 10MB limit, images only

---

## 8. VALIDATION SCHEMAS (Joi)

All schemas are in `src/models/schemas.js` (891 lines). Key schemas:

### User/Auth Schemas
- `register`: fullName, email, password, phone, provider
- `login`: email, password, loginAs (customer/retailer/admin)
- `googleAuth`: provider, providerUserId, email, fullName
- `updateProfile`: fullName, phone, metadata
- `refreshToken`, `forgotPassword`, `resetPassword`

### Product Schemas
- `create`: sku, title, description, productType, basePrice, city, categoryIds, brandIds, warehouseIds
- `update`: All optional version of create
- `query`: Pagination, search, category, brand, productType, price range, schoolId, warehouseId, city, retailerName, sorting
- `adminQuery`: Same + isDeleted visibility

### Product Options/Variants
- Option attributes: name, position (1-3), isRequired
- Option values: value, priceModifier, sortOrder
- Variants: sku, price, compareAtPrice, stock, weight, optionValue1/2/3

### Order Schemas
- `createOrder`: items (productId, variantId, quantity), shippingAddress, billingAddress, paymentMethod
- `calculateSummary`: items array
- `updateOrderStatus`: status, note, metadata
- `cancelOrder`: reason, refundRequested
- `updatePaymentStatus`: paymentStatus, paymentId, transactionId
- `bulkUpdateOrders`: orderIds, status, note

### School Schemas
- `create`: name, image, type, board, address, city, state, postalCode, contact
- `query`: Pagination, city, state, type, board, lat/lng/radius, sorting
- `productAssociation`: grade (Pre-KG through 12th), mandatory
- `partnership`: partnerName, partnerType, contact

### Category/Brand/Warehouse Schemas
- Standard CRUD with pagination, search, sorting

### Address Schemas
- `create`: label, recipientName, phone, line1/2, city, state, postalCode, isDefault, lat/lng, landmark

---

## 9. AUTHENTICATION FLOW

### Email/Password Registration:
1. Client calls `POST /auth/send-otp` with email, fullName, password
2. Server generates OTP, stores hashed in DB, sends email via Nodemailer
3. Client calls `POST /auth/verify-otp` with email, otp
4. Server verifies OTP → creates user in Supabase Auth + users table → returns JWT tokens

### Email/Password Login:
1. Client calls `POST /auth/login` with email, password, loginAs
2. Server authenticates via Supabase Auth
3. Server checks user role matches loginAs (customer/retailer/admin)
4. Returns JWT access token + refresh token

### Google OAuth:
1. Client sends Google token to `POST /auth/google-login`
2. Server verifies with Supabase Auth
3. Creates/retrieves user → returns JWT tokens

### Token Lifecycle:
- Access token: 7d expiry (configurable)
- Refresh token: 30d expiry (configurable)
- Token refresh via `POST /auth/refresh-token`
- Token verification via `POST /auth/verify-token`

---

## 10. ORDER FLOW

### Order Creation:
1. Customer calls `POST /orders/place` with items, shippingAddress, paymentMethod
2. Server validates items, checks stock availability
3. Creates order with status `initialized`, payment_status `pending`
4. Records order event for status tracking
5. Returns order with estimated delivery date

### Payment (Razorpay):
1. Client calls `POST /payments/create-order` with orderId
2. Server creates Razorpay order, logs transaction
3. Client completes payment on Razorpay checkout
4. Client calls `POST /payments/verify` with razorpay signatures
5. Server verifies signature → updates order to `processed`, payment to `paid`
6. Razorpay webhook (`POST /payments/webhook`) as backup verification

### Order Lifecycle:
```
initialized → processed → shipped → out_for_delivery → delivered
     ↓            ↓
  cancelled    cancelled
     ↓
  refunded
```

### Order Summary Calculation:
- `POST /orders/calculate-summary` — Preview cart totals without placing order
- Validates products, calculates subtotals, delivery charges

---

## 11. PRODUCT SYSTEM

### Product Types:
- `bookset` — Book sets for schools
- `uniform` — School uniforms
- `stationary` — Stationery items
- `school` — General school items
- `general` — Other products

### Product Options System:
Products can have up to 3 option attributes (e.g., Size, Color, Material):
```
Product → Option Attributes (max 3 positions)
  └── Option Values (each attribute has multiple values)
       └── Variants (combinations of option values with own price/stock)
```

### Comprehensive Product Creation:
`POST /products/comprehensive` creates product + images + brands + variants + categories + school associations atomically.

### Soft Delete:
Products use `is_deleted` flag. Public queries filter out deleted products automatically. Admin queries can include deleted products.

---

## 12. SCHOOL SYSTEM

### School-Product Association:
- Schools linked to products via `product_schools` junction table
- Each association includes `grade` (Pre-KG through 12th) and `mandatory` flag
- School catalog endpoint returns all products organized by grade

### School Features:
- Geolocation-based nearby school search
- City-based filtering
- Popular schools ranking
- School analytics
- Bulk import from CSV
- Image upload to Supabase Storage
- Partnership management

---

## 13. DATABASE CLIENT SETUP

### Supabase Client Types:
1. **Anon Client** — Default, respects RLS policies
2. **Service Client** — Bypasses RLS (for server-side operations)
3. **Authenticated Client** — Uses user's JWT token for RLS context

```javascript
// From db/index.js
export function getSupabase()              // Returns anon/service client
export function createAuthenticatedClient(token) // User-scoped client
export function createServiceClient()      // Bypasses RLS
export async function executeSupabaseQuery(table, operation, options) // Query helper
export async function executeSupabaseRPC(functionName, params)       // RPC helper
```

---

## 14. KEY CONFIGURATION (Environment Variables)

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email
EMAIL_PROVIDER=supabase

# CORS
FRONTEND_URL=http://localhost:3000
```

### CORS Allowed Origins:
- `http://localhost:3000`
- `https://bukizz.in`
- `https://www.bukizz.in`
- `http://localhost:5173`
- Local network IPs (192.168.x.x, 10.x.x.x)

---

## 15. RESPONSE FORMAT

All API responses follow a consistent format:

### Success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [...],
  "correlationId": "req-xxx"
}
```

---

## 16. LOGGING

Winston-based logging with:
- File transports: `logs/error.log`, `logs/combined.log` (5MB max, 5 rotations)
- Console transport in development (colorized)
- Correlation ID tracking per request
- Structured JSON format

---

## 17. SECURITY MEASURES

1. **Helmet** — HTTP security headers
2. **CORS** — Whitelist-based origin control
3. **Rate Limiting** — Global (1000 req/15min) + per-endpoint
4. **JWT Auth** — Bearer token authentication
5. **Joi Validation** — Input validation on all endpoints
6. **XSS Sanitization** — Input sanitization middleware
7. **bcrypt** — Password hashing (12 rounds)
8. **Supabase RLS** — Row-level security on database
9. **Multer** — File upload restrictions (type, size)
10. **Razorpay Signature Verification** — Payment integrity

---

## 18. KNOWN PATTERNS & NOTES

1. **Dual Entry Points**: `index.js` (ESM, actively used) and `src/app.js` (CJS factory, not actively used)
2. **Mixed DI Patterns**: Some controllers use DI via dependencies object, others (Brand, Category, Payment, Image, Retailer) instantiate directly
3. **Order Controller**: Has both static methods (for route-level usage) and instance methods
4. **Legacy Routes**: `/login` and `/register` endpoints exist directly in `index.js` alongside modern `/api/v1/auth/*` routes
5. **Role System**: Partially implemented — `requireRoles` middleware exists but roles aren't fully enforced on all admin routes
6. **Product Repository**: Largest file (1660 lines) — handles complex queries with joins, filtering, and pagination
7. **Comprehensive Product API**: Atomic creation/update of product + images + brands + variants + categories in single request
8. **School Catalog**: Grade-based product organization for school supply lists
9. **Order Events**: Full audit trail of order status changes with timestamps and metadata

---

## 19. ENTRY POINT FLOW (index.js)

```
1. Load dotenv
2. Import dependencies
3. Setup security middleware (helmet, cors, rate limiter)
4. Setup body parsing (JSON 10MB limit)
5. connectDB() → Initialize Supabase client
6. Initialize Repositories → Services → Controllers
7. Create dependencies container
8. setupRoutes(app, dependencies)
9. Legacy auth routes (/login, /register)
10. Error handler middleware
11. Start listening on PORT
```

---

*This document provides complete context for understanding the Bukizz server API architecture, routes, data models, and business logic.*
