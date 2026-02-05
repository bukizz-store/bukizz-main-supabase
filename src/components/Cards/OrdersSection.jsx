import React, { useEffect, useState } from "react";
import { X, MessageSquare, AlertTriangle, FileText, ChevronDown, ChevronUp } from "lucide-react";

import useApiRoutesStore from "../../store/apiRoutesStore";

const OrderItemRow = ({ item, order, onCancel, onRequest, setSelectedItem, getStatusColor, getStatusText, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
      {/* Main Card Content */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setSelectedItem({ ...item, order })}
      >
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">

          {/* Left: Product Image & Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                Order #{order.orderNumber || order.id.slice(0, 8)}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0">
                {item.productSnapshot?.image_url ? (
                  <img
                    src={item.productSnapshot.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <p className="font-semibold text-gray-900 line-clamp-2">
                  {item.title}
                </p>
                {item.variantDetails && (
                  <p className="text-xs text-gray-500">{item.variantDetails}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-gray-900">₹{item.totalPrice?.toLocaleString("en-IN")}</p>
                  <span className="text-xs text-gray-400">|</span>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status & Actions */}
          <div className="flex flex-col items-end gap-3 min-w-[200px]">
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status || order.status).bg} ${getStatusColor(item.status || order.status).text} ${getStatusColor(item.status || order.status).border || 'border-transparent'}`}>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status || order.status).dotColor}`}></div>
              {getStatusText(item.status || order.status)}
            </div>

            {/* Main Actions */}
            <div className="flex gap-2">
              {((item.status || order.status) === "initialized" || (item.status || order.status) === "processed") && (
                <button
                  onClick={(e) => onCancel(e)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  Cancel Item
                </button>
              )}
              {((item.status || order.status) === "shipped" || (item.status || order.status) === "out_for_delivery" || (item.status || order.status) === "delivered") && (
                <button
                  onClick={(e) => onRequest(e)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  Raise Request
                </button>
              )}

              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({ ...item, order });
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                View Details
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // Previously selectedOrder, now selectedItem (which includes order info)
  const [selectedItem, setSelectedItem] = useState(null);

  // Action States
  const [activeModal, setActiveModal] = useState("none"); // "none", "cancel", "request"
  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);
  const [requestForm, setRequestForm] = useState({ subject: "Delay in Delivery", message: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To force re-fetch after action

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

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

        const url = `${useApiRoutesStore.getState().orders.getAll}?page=${page}&limit=20`;

        const response = await fetch(url, {
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
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshTrigger, page]);

  const handleCancelOrder = async () => {
    if (!selectedOrderForAction) return;

    try {
      setActionLoading(true);
      setActionError(null);
      const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");

      let response;

      if (selectedItemForAction) {
        // Cancel specific item
        // Use new customer-specific cancel endpoint to avoid permission issues
        response = await fetch(useApiRoutesStore.getState().orders.cancelItem(selectedOrderForAction.id, selectedItemForAction.id), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Cancelled by user via app"
          }),
        });
      } else {
        // Fallback if somehow full order cancel is triggered, though we removed UI for it
        response = await fetch(useApiRoutesStore.getState().orders.cancel(selectedOrderForAction.id), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Cancelled by user via app" }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel order");
      }

      // Success
      setActiveModal("none");
      setSelectedOrderForAction(null);
      setSelectedItemForAction(null);
      setRefreshTrigger(prev => prev + 1); // Refresh list
      alert(selectedItemForAction ? "Item cancelled successfully" : "Order cancelled successfully");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseRequest = async () => {
    if (!selectedOrderForAction) return;
    if (!requestForm.message.trim()) {
      setActionError("Please provide a message description");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");

      // Append item info to message
      let message = requestForm.message;
      if (selectedItemForAction) {
        message = `[Regarding Item: ${selectedItemForAction.title}] ${message}`;
      }

      const response = await fetch(useApiRoutesStore.getState().orders.createQuery(selectedOrderForAction.id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...requestForm, message }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to raise request");
      }

      // Success
      setActiveModal("none");
      setSelectedOrderForAction(null);
      setSelectedItemForAction(null);
      setRequestForm({ subject: "Delay in Delivery", message: "" });
      alert("Request raised successfully. Our support team will contact you.");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelModal = (order, e, item = null) => {
    e?.stopPropagation();
    setSelectedOrderForAction(order);
    setSelectedItemForAction(item);
    setActiveModal("cancel");
    setActionError(null);
  };

  const openRequestModal = (order, e, item = null) => {
    e?.stopPropagation();
    setSelectedOrderForAction(order);
    setSelectedItemForAction(item);
    setActiveModal("request");
    setRequestForm({ subject: "Delay in Delivery", message: "" });
    setActionError(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return { bg: "bg-green-100", text: "text-green-800", icon: "🟢", dotColor: "bg-green-600", border: "border-green-200" };
      case "shipped":
      case "out_for_delivery":
        return { bg: "bg-blue-100", text: "text-blue-800", icon: "🔵", dotColor: "bg-blue-600", border: "border-blue-200" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800", icon: "🔴", dotColor: "bg-red-600", border: "border-red-200" };
      case "processed":
        return { bg: "bg-yellow-100", text: "text-yellow-800", icon: "🟡", dotColor: "bg-yellow-600", border: "border-yellow-200" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: "⚪", dotColor: "bg-gray-500", border: "border-gray-200" };
    }
  };

  const getStatusText = (status) => {
    // Simplifying status text for item cards
    const statusMap = {
      initialized: "Ordered",
      processed: "Processing",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
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

  // Flatten orders into items list for display
  const allItems = orders.flatMap(order =>
    (order.items || []).map(item => ({
      ...item,
      order: order // Pass full order reference
    }))
  );

  const filteredItems = allItems.filter((item) => {
    if (activeFilter === "all") return true;
    // Check item status first, fallback to order status
    const effectiveStatus = item.status || item.order.status;
    return effectiveStatus === activeFilter;
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

  // Order Detail View - Now Focused on Item
  const OrderDetailView = ({ item, onBack }) => {
    const { order } = item;
    const itemStatus = item.status || order.status;

    let statusTimeline = [];

    if (itemStatus === "cancelled") {
      statusTimeline = [
        { status: "initialized", label: "Order Confirmed", completed: true, date: order.createdAt, color: "green" },
        { status: "cancelled", label: "Cancelled", completed: true, date: order.updatedAt, color: "red" }
      ];
    } else {
      statusTimeline = [
        { status: "initialized", label: "Order Confirmed", completed: true, date: order.createdAt, color: "green" },
        { status: "processed", label: "Processing", completed: ["processed", "shipped", "out_for_delivery", "delivered"].includes(itemStatus), color: "green" },
        { status: "shipped", label: "Shipped", completed: ["shipped", "out_for_delivery", "delivered"].includes(itemStatus), color: "green" },
        { status: "out_for_delivery", label: "Out for Delivery", completed: ["out_for_delivery", "delivered"].includes(itemStatus), color: "green" },
        { status: "delivered", label: "Delivered", completed: itemStatus === "delivered", color: "green" },
      ];
    }

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

        {/* Item Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Item Status: {getStatusText(itemStatus)}
          </h2>
          <p className="text-gray-600 mb-4">Order #<span className="font-semibold">{order.id}</span></p>

          {/* Product Card */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.productSnapshot?.image_url ? (
                  <img
                    src={item.productSnapshot.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                {item.productSnapshot?.school_name && (
                  <p className="text-sm text-gray-600 mb-2">{item.productSnapshot.school_name}</p>
                )}
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-900">₹{item.totalPrice?.toLocaleString("en-IN")}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {(itemStatus === "initialized" || itemStatus === "processed") && (
              <button
                onClick={(e) => openCancelModal(order, e, item)}
                className="px-6 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Item
              </button>
            )}

            {(itemStatus === "shipped" || itemStatus === "out_for_delivery" || itemStatus === "delivered") && (
              <button
                onClick={(e) => openRequestModal(order, e, item)}
                className="px-6 py-2 border border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Raise Request
              </button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Timeline</h3>

          <div className="space-y-0">
            {statusTimeline.map((step, index) => {
              const isActive = step.completed;
              const bgColor = isActive
                ? (step.color === "red" ? "bg-red-500" : "bg-green-500")
                : "bg-gray-300";

              return (
                <div key={index} className="flex gap-4 pb-6 last:pb-0">
                  {/* Timeline Dot and Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${bgColor} relative z-10 ring-4 ring-white`}></div>
                    {index < statusTimeline.length - 1 && (
                      <div className={`w-0.5 h-12 ${step.status === itemStatus ? "bg-gray-300" : (step.completed ? bgColor : "bg-gray-300")} mt-[-4px] mb-[-4px]`}></div>
                    )}
                  </div>

                  {/* Status Details */}
                  <div className="pt-0 -mt-1">
                    <h4 className={`font-semibold ${isActive ? (step.color === "red" ? "text-red-700" : "text-gray-900") : "text-gray-500"}`}>
                      {step.label}
                    </h4>
                    {step.date && (
                      <p className={`text-sm ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                        {formatDate(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {selectedItem ? (
        <OrderDetailView item={selectedItem} onBack={() => setSelectedItem(null)} />
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {["all", "processed", "shipped", "delivered", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors text-sm ${activeFilter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Orders (Items) List */}
          {filteredItems.length === 0 ? (
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
                  : `No items found with status: ${activeFilter}`}
              </p>
              <a href="/" className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Continue Shopping..
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item, index) => (
                <OrderItemRow
                  key={`${item.id}-${index}`} // Composite key in case of id collision (rare but safe)
                  item={item}
                  order={item.order}
                  onCancel={(e) => openCancelModal(item.order, e, item)}
                  onRequest={(e) => openRequestModal(item.order, e, item)}
                  setSelectedItem={setSelectedItem}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  formatDate={formatDate}
                />
              ))}

              {/* Pagination Controls */}
              {pagination && (pagination.totalPages > 1 || pagination.hasPrev || pagination.hasNext) && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrev}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                      ${!pagination.hasPrev
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    Previous
                  </button>

                  <span className="text-sm text-gray-600 font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={!pagination.hasNext}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                      ${!pagination.hasNext
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                  >
                    Next
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Cancel Modal */}
      {activeModal === "cancel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Cancel Item
              </h3>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel <strong>{selectedItemForAction?.title}</strong>? This action cannot be undone.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal("none")}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={actionLoading}
              >
                No, Keep
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Yes, Cancel Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {activeModal === "request" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Raise a Request
              </h3>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedItemForAction && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
                Requesting support for: <strong>{selectedItemForAction.title}</strong>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Issue</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={requestForm.subject}
                  onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                >
                  <option value="Delay in Delivery">Delay in Delivery</option>
                  <option value="Wrong Item Received">Wrong Item Received</option>
                  <option value="Damaged Item">Damaged Item</option>
                  <option value="Return Request">Return Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Please describe your issue..."
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                ></textarea>
              </div>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal("none")}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseRequest}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
