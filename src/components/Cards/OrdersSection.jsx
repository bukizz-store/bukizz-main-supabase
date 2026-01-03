import React, { useEffect, useState } from "react";

import useApiRoutesStore from "../../store/apiRoutesStore";

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");

        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await fetch(useApiRoutesStore.getState().orders.getAll, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return { bg: "bg-green-100", text: "text-green-800", icon: "🟢" };
      case "shipped":
      case "out_for_delivery":
        return { bg: "bg-blue-100", text: "text-blue-800", icon: "🔵" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800", icon: "🔴" };
      case "processed":
        return { bg: "bg-yellow-100", text: "text-yellow-800", icon: "🟡" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: "⚪" };
    }
  };

  const getStatusText = (status, date) => {
    const statusMap = {
      initialized: "Your item has been placed",
      processed: "Your item is being processed",
      shipped: "Your item has been shipped",
      out_for_delivery: "Your item is out for delivery",
      delivered: "Your item has been delivered",
      cancelled: "Your item has been cancelled",
      refunded: "Refunded Processed",
    };
    return statusMap[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Order detail view component
  const OrderDetailView = ({ order, onBack }) => {
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const statusTimeline = [
      { status: "initialized", label: "Order Confirmed", completed: true, date: order.createdAt },
      { status: "processed", label: "Order Shipped", completed: ["processed", "shipped", "out_for_delivery", "delivered"].includes(order.status) },
      { status: "shipped", label: "Out of Delivery", completed: ["out_for_delivery", "delivered"].includes(order.status) },
      { status: "delivered", label: "Delivery", completed: order.status === "delivered" },
    ];

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const getTotalPrice = () => {
      return order.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    };

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Order has been {order.status === "delivered" ? "Delivered" : order.status === "cancelled" ? "Cancelled" : "Confirmed"}
          </h2>
          <p className="text-gray-600 mb-4">Order #<span className="font-semibold">{order.id}</span></p>

          {/* Product Card */}
          {firstItem && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                  {firstItem.productSnapshot?.image_url ? (
                    <img
                      src={firstItem.productSnapshot.image_url}
                      alt={firstItem.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{firstItem.title}</h3>
                  {firstItem.productSnapshot?.school_name && (
                    <p className="text-sm text-gray-600 mb-2">{firstItem.productSnapshot.school_name}</p>
                  )}
                  <p className="text-lg font-bold text-gray-900">₹{firstItem.totalPrice?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Contact Us
            </button>
            {order.status === "delivered" && (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <span>⭐</span>
                Add Review
              </button>
            )}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>

          <div className="space-y-0">
            {statusTimeline.map((step, index) => (
              <div key={step.status} className="flex gap-4 pb-6">
                {/* Timeline Dot and Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${step.completed ? "bg-green-500" : "bg-gray-300"} relative z-10`}></div>
                  {index < statusTimeline.length - 1 && (
                    <div className={`w-0.5 h-12 ${step.completed ? "bg-green-500" : "bg-gray-300"} mt-2`}></div>
                  )}
                </div>

                {/* Status Details */}
                <div className="pt-0">
                  <h4 className={`font-semibold ${step.completed ? "text-gray-900" : "text-gray-500"}`}>
                    {step.label}
                  </h4>
                  {step.date && (
                    <p className={`text-sm ${step.completed ? "text-gray-600" : "text-gray-400"}`}>
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    {item.variantDetails && (
                      <p className="text-sm text-gray-600">{item.variantDetails}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{item.totalPrice?.toLocaleString("en-IN")}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-gray-900">₹{getTotalPrice().toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {selectedOrder ? (
        <OrderDetailView order={selectedOrder} onBack={() => setSelectedOrder(null)} />
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors text-sm ${activeFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("processed")}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors text-sm ${activeFilter === "processed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              Processing
            </button>
            <button
              onClick={() => setActiveFilter("shipped")}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors text-sm ${activeFilter === "shipped"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setActiveFilter("delivered")}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors text-sm ${activeFilter === "delivered"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setActiveFilter("cancelled")}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors text-sm ${activeFilter === "cancelled"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              Cancelled
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-lg text-blue-500 mb-8">
                Enjoy New Experience of Shopping School Essentials ...
              </p>
              <div className="mb-6">
                <img src="/cart.svg" alt="Empty Orders" className="w-40 h-40 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold text-blue-600 mb-2">
                You Study, We Deliver
              </h3>

              <p className="text-gray-600 text-base mb-6">
                {activeFilter === "all"
                  ? "No orders found. Place your first order!"
                  : `No ${activeFilter} orders found`}
              </p>
              <a href="/" className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Continue Shopping..
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => {
                      const colors = getStatusColor(order.status);
                      const estimatedDelivery = new Date(order.createdAt);
                      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedOrder(order)}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          {/* Order Row Layout */}
                          <div className="flex gap-0 items-center justify-between">
                            {/* Product Image - Left */}
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                              {item.productSnapshot?.image_url ? (
                                <img
                                  src={item.productSnapshot.image_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  📦
                                </div>
                              )}
                            </div>

                            {/* Product Title - Wrappable */}
                            <div className="flex-1 px-4 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 break-words">
                                {item.title}
                              </h3>
                            </div>

                            {/* Price */}
                            <div className="flex-1 text-center">
                              <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                                ₹{item.totalPrice?.toLocaleString("en-IN")}
                              </p>
                            </div>

                            {/* Status - Right */}
                            <div className="flex-1 text-right">
                              <div className="flex items-center justify-end gap-2 mb-1">
                                {order.status === "delivered" ? (
                                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : order.status === "cancelled" ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-red-50 flex-shrink-0"></div>
                                ) : order.status === "refunded" ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-yellow-500 bg-yellow-50 flex-shrink-0"></div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-green-500 bg-white flex-shrink-0"></div>
                                )}
                                <div
                                  className={`px-0 text-xs font-medium`}
                                >
                                  {order.status === "delivered"
                                    ? `Delivered on ${formatDate(order.updatedAt || order.createdAt)}`
                                    : order.status === "cancelled"
                                      ? `Cancelled on ${formatDate(order.updatedAt || order.createdAt)}`
                                      : order.status === "out_for_delivery"
                                        ? "Out for Delivery"
                                        : `Delivery expected by ${formatDate(estimatedDelivery)}`}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {order.status === "out_for_delivery" || order.status === "shipped"
                                  ? `Your item has been ${order.status === "out_for_delivery" ? "out for delivery" : "shipped"}`
                                  : order.status === "delivered"
                                    ? "Your item has been delivered"
                                    : order.status === "cancelled"
                                      ? "Your item has been cancelled"
                                      : getStatusText(order.status)}
                              </p>

                              {/* Action Buttons */}
                              <div className="mt-1 flex flex-col gap-0.5">
                                {order.status === "delivered" && (
                                  <button className="text-blue-500 hover:text-blue-700 font-medium text-xs">
                                    ⭐ Rate & Review
                                  </button>
                                )}
                                {(order.status === "shipped" ||
                                  order.status === "out_for_delivery") && (
                                    <button className="text-blue-500 hover:text-blue-700 font-medium text-xs">
                                      📍 Track Order
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-gray-600">Order #{order.orderNumber}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersSection;
