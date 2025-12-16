import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useOrderStore from "../store/orderStore";
import useNotificationStore from "../store/notificationStore";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotificationStore();
  const { getOrderById, trackOrder } = useOrderStore();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Animation states - optimized to prevent flickering
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Memoize confetti elements to prevent re-creation and flickering
  const confettiElements = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color:
        i % 4 === 0
          ? "text-blue-500"
          : i % 4 === 1
          ? "text-green-500"
          : i % 4 === 2
          ? "text-yellow-500"
          : "text-purple-500",
    }));
  }, []); // Empty dependency array - only create once

  // Animation effect - runs only once to prevent flickering
  useEffect(() => {
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
    const animationTimer = setTimeout(() => setAnimationComplete(true), 500);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(animationTimer);
    };
  }, []); // No dependencies to prevent re-runs

  // Separate effect for fetching order details
  useEffect(() => {
    if (!order && orderId) {
      fetchOrderDetails();
    }
  }, [orderId]); // Only depend on orderId, not order

  // Memoized function to prevent re-creation
  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      setError("Failed to load order details");
      showNotification("Failed to load order details", "error");
    } finally {
      setLoading(false);
    }
  }, [orderId, getOrderById, showNotification]);

  // Memoized handlers to prevent re-creation
  const handleCopyOrderNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      showNotification("Order number copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showNotification("Failed to copy order number", "error");
    }
  }, [order?.orderNumber, showNotification]);

  const handleTrackOrder = useCallback(() => {
    navigate(`/orders/${orderId}/track`);
  }, [navigate, orderId]);

  const handleViewAllOrders = useCallback(() => {
    navigate("/orders");
  }, [navigate]);

  const handleContinueShopping = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Memoized utility functions
  const getStatusColor = useCallback((status) => {
    const colors = {
      initialized: "bg-blue-100 text-blue-800",
      processed: "bg-yellow-100 text-yellow-800",
      shipped: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }, []);

  const getPaymentMethodIcon = useCallback((method) => {
    const icons = {
      cod: "💵",
      upi: "📱",
      card: "💳",
      netbanking: "🏦",
      wallet: "💰",
    };
    return icons[method] || "💳";
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getEstimatedDelivery = useCallback(() => {
    if (!order) return "";

    if (order.estimatedDeliveryDate) {
      return new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }

    // Calculate estimated delivery based on order date and payment method
    const orderDate = new Date(order.createdAt);
    const deliveryDays = order.paymentMethod === "cod" ? 3 : 2;
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);

    return estimatedDate.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [order]);

  // Memoize order items to prevent flickering
  const orderItems = useMemo(() => {
    if (!order?.items) return [];

    return order.items.map((item, index) => ({
      ...item,
      // Create stable key using productId and variantId if available
      stableKey: item.productId
        ? `${item.productId}-${item.variantId || "default"}-${index}`
        : `item-${index}`,
      // Pre-calculate display values to prevent recalculation
      displayImage: item.productSnapshot?.image || "/api/placeholder/60/60",
      displaySku: item.sku || null,
      displayTitle: item.title || "Unknown Item",
      displayQuantity: item.quantity || 0,
      displayUnitPrice: item.unitPrice || 0,
      displayTotalPrice: item.totalPrice || 0,
    }));
  }, [order?.items]);

  // Memoize order summary to prevent recalculation flickering
  const orderSummaryDetails = useMemo(() => {
    if (!order?.metadata?.orderSummary) return null;

    const summary = order.metadata.orderSummary;
    return {
      subtotal: summary.subtotal || order.totalAmount,
      deliveryFee: summary.deliveryFee || 0,
      platformFee: summary.platformFee || 0,
      tax: summary.tax || 0,
      savings: summary.savings || 0,
      hasDeliveryFee: summary.deliveryFee > 0,
      hasPlatformFee: summary.platformFee > 0,
      hasTax: summary.tax > 0,
      hasSavings: summary.savings > 0,
    };
  }, [order?.metadata?.orderSummary, order?.totalAmount]);

  // Memoized toggle handler to prevent re-creation
  const handleToggleOrderDetails = useCallback(() => {
    setShowOrderDetails((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Loading your order details...
            </p>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn't find the order you're looking for. Please check your
              order number or try again.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleViewAllOrders}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                View All Orders
              </button>
              <button
                onClick={handleContinueShopping}
                className="w-full text-blue-600 hover:text-blue-700 py-3 px-6 font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}

      {/* Optimized Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiElements.map((confetti) => (
            <div
              key={confetti.id}
              className={`absolute animate-bounce ${confetti.color}`}
              style={{
                left: `${confetti.left}%`,
                top: `${confetti.top}%`,
                animationDelay: `${confetti.delay}s`,
                animationDuration: `${confetti.duration}s`,
                willChange: "transform", // Optimize for animations
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header with optimized animations */}
        <div
          className={`text-center mb-8 transition-all duration-700 ${
            animationComplete
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {/* <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl text-green-600">✅</div>
          </div> */}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Order Placed Successfully! 🎉
          </h1>

          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Thank you for your order! We've received your order and will start
            processing it shortly. You'll receive updates via SMS and email.
          </p>

          {/* Order Number Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-xl font-bold text-gray-800">
                  {order.orderNumber}
                </p>
              </div>
              <button
                onClick={handleCopyOrderNumber}
                className={`p-3 rounded-lg transition-all ${
                  copied
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {copied ? "✅" : "📋"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Order Status
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium text-gray-800">Order Confirmed</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      order.status !== "initialized"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="ml-4 flex-1">
                    <p
                      className={`font-medium ${
                        order.status !== "initialized"
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      Processing
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.status !== "initialized"
                        ? "In progress"
                        : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      ["shipped", "out_for_delivery", "delivered"].includes(
                        order.status
                      )
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="ml-4 flex-1">
                    <p
                      className={`font-medium ${
                        ["shipped", "out_for_delivery", "delivered"].includes(
                          order.status
                        )
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      Shipped
                    </p>
                    <p className="text-sm text-gray-600">
                      {["shipped", "out_for_delivery", "delivered"].includes(
                        order.status
                      )
                        ? "On the way"
                        : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="ml-4 flex-1">
                    <p
                      className={`font-medium ${
                        order.status === "delivered"
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      Delivered
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.status === "delivered"
                        ? "Completed"
                        : `Expected by ${getEstimatedDelivery()}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleTrackOrder}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📍</span>
                  <span>Track Order</span>
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Order Items ({orderItems.length || 0})
                </h3>
                <button
                  onClick={handleToggleOrderDetails}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {showOrderDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.stableKey}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <img
                      src={item.displayImage}
                      alt={item.displayTitle}
                      className="w-15 h-15 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/60/60";
                      }}
                    />

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {item.displayTitle}
                      </h4>
                      {item.displaySku && (
                        <p className="text-sm text-gray-600">
                          SKU: {item.displaySku}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Qty: {item.displayQuantity}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          ₹{item.displayUnitPrice} each
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{item.displayTotalPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {showOrderDetails && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h4 className="font-medium text-gray-800">Order Summary</h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{orderSummaryDetails.subtotal}</span>
                    </div>

                    {orderSummaryDetails.hasDeliveryFee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span>₹{orderSummaryDetails.deliveryFee}</span>
                      </div>
                    )}

                    {orderSummaryDetails.hasPlatformFee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee</span>
                        <span>₹{orderSummaryDetails.platformFee}</span>
                      </div>
                    )}

                    {orderSummaryDetails.hasTax && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span>₹{orderSummaryDetails.tax}</span>
                      </div>
                    )}

                    {orderSummaryDetails.hasSavings && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings</span>
                        <span>-₹{orderSummaryDetails.savings}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                What happens next?
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Order Confirmation
                    </p>
                    <p className="text-sm text-gray-600">
                      You'll receive an SMS and email confirmation shortly
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Processing</p>
                    <p className="text-sm text-gray-600">
                      We'll prepare your items for shipment
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Shipping Updates
                    </p>
                    <p className="text-sm text-gray-600">
                      Track your package in real-time
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Delivery</p>
                    <p className="text-sm text-gray-600">
                      Expected by {getEstimatedDelivery()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Order Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">₹{order.totalAmount}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <div className="flex items-center space-x-2">
                    <span>{getPaymentMethodIcon(order.paymentMethod)}</span>
                    <span className="font-medium capitalize">
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : order.paymentMethod}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-medium">{getEstimatedDelivery()}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📍</span>
                Delivery Address
              </h4>

              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800">
                  {order.shippingAddress?.recipientName}
                </p>
                <p>{order.shippingAddress?.line1}</p>
                {order.shippingAddress?.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  - {order.shippingAddress?.postalCode}
                </p>
                <p className="mt-2">📞 {order.contactPhone}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleTrackOrder}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>📍</span>
                <span>Track Order</span>
              </button>

              <button
                onClick={handleViewAllOrders}
                className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                View All Orders
              </button>

              <button
                onClick={handleContinueShopping}
                className="w-full text-blue-600 hover:text-blue-700 py-3 px-4 font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Need Help */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Need Help?</h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="mr-3">📞</span>
                  <span>Call: +91-XXXXX-XXXXX</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-3">📧</span>
                  <span>Email: support@bukizz.com</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-3">💬</span>
                  <span>Live Chat Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default OrderSuccessPage;
