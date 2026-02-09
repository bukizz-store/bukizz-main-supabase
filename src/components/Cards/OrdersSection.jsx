
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  Info,
  Package,
  Share2,
  Truck,
  User,
  X, // Added X
  Star,
  ChevronDown,
  Download,
  Trophy,
  AlertTriangle,
  FileText
} from "lucide-react";
import AddressMapPreview from "../Address/AddressMapPreview";

import useApiRoutesStore from "../../store/apiRoutesStore";

const getVariantDescription = (item) => {
  // 1. If explicit string exists (legacy support)
  if (item.variantDetails && typeof item.variantDetails === 'string') {
    return item.variantDetails;
  }

  const snapshot = item.productSnapshot || {};
  // Sometimes snapshot might contain 'selectedVariant' or be the variant itself + product info
  // We check for option_value_X_ref pattern from productRepository

  // Check if we have the variant part specifically (if snapshot has nested variant)
  const variantData = snapshot.selectedVariant || snapshot.variant || snapshot;

  const parts = [];

  // Iterate through potential 3 options
  [1, 2, 3].forEach(i => {
    const refKey = `option_value_${i} _ref`;
    const ref = variantData[refKey];

    if (ref && ref.value) {
      // If attribute_name exists, use it. Otherwise just Value? 
      // User wants "Option Name: Option Value" ideally, or just dynamic handling.
      const label = ref.attribute_name || ref.attributeName; // Case safety
      if (label) {
        parts.push(`${label}: ${ref.value} `);
      } else {
        parts.push(ref.value);
      }
    }
  });

  if (parts.length > 0) return parts.join(" • ");

  // Fallbacks for flat legacy fields (if any)
  const legacyParts = [];
  if (snapshot.size) legacyParts.push(`Size: ${snapshot.size} `);
  if (snapshot.color) legacyParts.push(`Color: ${snapshot.color} `);

  // If we have nothing, return null so we don't render empty text
  return legacyParts.length > 0 ? legacyParts.join(" • ") : null;
};

const OrderItemRow = ({ item, order, onCancel, onRequest, setSelectedItem, getStatusColor, getStatusText, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = item.status || order.status;

  // Helper for mobile date format "Jan 26"
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white border-b border-gray-100 last:border-0 md:border md:border-gray-200 md:rounded-lg md:mb-4 overflow-hidden hover:shadow-sm transition-shadow">

      {/* MOBILE LAYOUT */}
      <div
        className="md:hidden p-4 flex gap-4 items-start cursor-pointer"
        onClick={() => setSelectedItem({ ...item, order })}
      >
        {/* Image */}
        <div className="w-20 h-20 flex-shrink-0">
          {item.productSnapshot?.image_url ? (
            <img
              src={item.productSnapshot.image_url}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">📦</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Status Line */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-900 font-medium text-sm">
              {getStatusText(status)} on {formatDateShort(order.createdAt)}
            </p>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Title */}
          <p className="text-gray-500 text-sm mb-2 line-clamp-2 leading-snug">
            {item.title}
          </p>

          {/* Rating (Only for delivered) */}
          {status === 'delivered' && (
            <div className="flex flex-col gap-1">
              <div className="flex text-green-500">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-blue-600 text-xs font-medium">Write a Review</p>
            </div>
          )}

          {/* Rating Placeholder (for visual match if not delivered, or just strictly match screenshot) */}
          {/* The screenshot shows stars for delivered. Let's keep it simple. */}
        </div>
      </div>


      {/* DESKTOP LAYOUT (Existing code wrapped) */}
      <div className="hidden md:block">
        <div
          className="p-4 cursor-pointer"
          onClick={() => setSelectedItem({ ...item, order })}
        >
          <div className="flex flex-row gap-4 items-center justify-between">

            {/* Left: Product Image & Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                  Order #{order.id}
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
                  {getVariantDescription(item) && (
                    <p className="text-xs text-gray-500">{getVariantDescription(item)}</p>
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
    </div>
  );
};

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "last30", "2024", "2023", "older"
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [tempFilter, setTempFilter] = useState({ status: "all", time: "all" });

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
        const [isMobileApp, setIsMobileApp] = useState(false);

      useEffect(() => {
          const checkMobile = () => {
              const isApp = localStorage.getItem("isMobileApp") === "true" ||
                  window.location.search.includes("mode=webview");
              const isMobileScreen = window.innerWidth < 768;
              setIsMobileApp(isApp || isMobileScreen);
          };
  
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
      }, []);

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
            Authorization: `Bearer ${token} `,
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
            Authorization: `Bearer ${token} `,
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
        message = `[Regarding Item: ${selectedItemForAction.title}] ${message} `;
      }

      const response = await fetch(useApiRoutesStore.getState().orders.createQuery(selectedOrderForAction.id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token} `,
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
      processed: "Processed",
      shipped: "On the way", // Changed per user request
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
  const allItems = React.useMemo(() => orders.flatMap(order =>
    (order.items || []).map(item => ({
      ...item,
      order: order // Pass full order reference
    }))
  ), [orders]);

  // Compute available filter options dynamically (Restricted to specific statuses)
  const availableStatuses = React.useMemo(() => {
    const allowedStatuses = ['processed', 'shipped', 'delivered', 'cancelled'];
    const statuses = new Set();

    allItems.forEach(item => {
      const s = item.status || item.order.status;
      if (s && allowedStatuses.includes(s)) {
        statuses.add(s);
      }
    });

    // Sort to match the preferred order
    return Array.from(statuses).sort((a, b) => {
      return allowedStatuses.indexOf(a) - allowedStatuses.indexOf(b);
    });
  }, [allItems]);

  const availableYears = React.useMemo(() => {
    const years = new Set();
    orders.forEach(order => {
      if (order.createdAt) {
        years.add(new Date(order.createdAt).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Descending order
  }, [orders]);

  const filteredItems = allItems.filter((item) => {
    // 1. Status Filter
    const effectiveStatus = item.status || item.order.status;
    const statusMatch = activeFilter === "all" || effectiveStatus === activeFilter;

    // 2. Search Filter
    const searchMatch = searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.order.orderNumber && item.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    // 3. Time Filter
    let timeMatch = true;
    if (timeFilter !== "all") {
      const orderDate = new Date(item.order.createdAt);
      const now = new Date();
      if (timeFilter === "last30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        timeMatch = orderDate >= thirtyDaysAgo;
      } else if (timeFilter === "2024") {
        timeMatch = orderDate.getFullYear() === 2024;
      } else if (timeFilter === "2023") {
        timeMatch = orderDate.getFullYear() === 2023;
      } else if (timeFilter === "older") {
        timeMatch = orderDate.getFullYear() < 2023;
      }
    }

    return statusMatch && searchMatch && timeMatch;
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

  // Cancel Order Button Component for OrderDetailView
  const CancelOrderButton = ({ order, item, itemStatus, onCancelSuccess }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("Changed my mind");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const cancelReasons = [
      "Changed my mind",
      "Found a better price elsewhere",
      "Ordered by mistake",
      "Delivery time too long",
      "Want to change the order",
      "Other"
    ];

    const handleCancel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");

        const response = await fetch(
          useApiRoutesStore.getState().orders.cancelItem(order.id, item.id),
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reason: cancelReason
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to cancel item");
        }

        // Success
        setShowConfirmModal(false);
        alert("Item cancelled successfully");
        onCancelSuccess?.();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 mt-3 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel Order
        </button>

        {/* Cancel Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Cancel Item
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex gap-3">
                <div className="w-12 h-12 border rounded overflow-hidden flex-shrink-0">
                  {item.productSnapshot?.image_url ? (
                    <img src={item.productSnapshot.image_url} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">📦</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {cancelReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel this item? This action cannot be undone.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={isLoading}
                >
                  No, Keep
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel Item"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Order Detail View - Redesigned
  const OrderDetailView = ({ item, onBack }) => {
    const { order } = item;
    const itemStatus = item.status || order.status;
    const [variantDetails, setVariantDetails] = useState(null);
    const [trackingData, setTrackingData] = useState(null);
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false); // Modal state
    const [isQuerySheetOpen, setIsQuerySheetOpen] = useState(false); // Sheet state
    const [queries, setQueries] = useState([]);
    const [queriesLoading, setQueriesLoading] = useState(false);
    const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false); // Address Sheet state

    // Fetch queries
    const fetchQueries = async () => {
      if (!order.id) return;
      try {
        setQueriesLoading(true);
        const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");
        const url = useApiRoutesStore.getState().orders.getQueries(order.id);
        const response = await fetch(url, {
          headers: {
            ...(token && { Authorization: `Bearer ${token} ` }),
            "Content-Type": "application/json",
          }
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            setQueries(resData.data.queries || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch queries:", err);
      } finally {
        setQueriesLoading(false);
      }
    };

    useEffect(() => {
      fetchQueries();
    }, [order.id]);

    // Fetch Order Tracking
    useEffect(() => {
      const fetchTracking = async () => {
        if (!order.id) return;
        try {
          const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");
          // Assuming apiRoutesStore has orders.tracking(id)
          // If not, we might need to verify or use a direct path or check the store file again.
          // Based on previous context, it should be available.
          const url = useApiRoutesStore.getState().orders.tracking(order.id);
          const response = await fetch(url, {
            headers: {
              ...(token && { Authorization: `Bearer ${token} ` }),
              "Content-Type": "application/json",
            }
          });
          if (response.ok) {
            const resData = await response.json();
            if (resData.success) {
              setTrackingData(resData.data);
            }
          }
        } catch (err) {
          console.error("Failed to fetch tracking:", err);
        }
      };
      fetchTracking();
    }, [order.id]);

    useEffect(() => {
      const fetchVariantDetails = async () => {
        if (!item.variantId) return;

        try {
          // Get token
          const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");

          const response = await fetch(useApiRoutesStore.getState().products.getVariant(item.variantId), {
            headers: {
              ...(token && { Authorization: `Bearer ${token} ` }),
              "Content-Type": "application/json",
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.variant) {
              setVariantDetails(data.data.variant);
            }
          }
        } catch (err) {
          console.error("Failed to fetch variant details:", err);
        }
      };

      fetchVariantDetails();
    }, [item.variantId]);

    // Construct description from fetched variant or fallback to snapshot
    const getDynamicDescription = () => {
      // 1. Use fetched details from API (New Structure)
      if (variantDetails && variantDetails.optionValues) {
        const parts = [];
        ['value1', 'value2', 'value3'].forEach(key => {
          const val = variantDetails.optionValues[key];
          if (val && val.value) {
            if (val.attributeName) {
              parts.push(`${val.value} `);
            } else {
              parts.push(val.value);
            }
          }
        });
        if (parts.length > 0) return parts.join(" • ");
      }

      // 2. Fallback to snapshot logic (Legacy Structure)
      if (!variantDetails) {
        const snapshot = item.productSnapshot || {};
        const variantData = snapshot.selectedVariant || snapshot.variant || snapshot;

        const parts = [];
        // Iterate through potential 3 options
        [1, 2, 3].forEach(i => {
          const refKey = `option_value_${i}_ref`;
          const ref = variantData[refKey];

          if (ref && ref.value) {
            const label = ref.attribute_name || ref.attributeName;
            if (label) {
              parts.push(`${label}: ${ref.value}`);
            } else {
              parts.push(ref.value);
            }
          }
        });

        if (parts.length > 0) return parts.join(" • ");

        // Final fallback to flat legacy fields
        return getVariantDescription(item);
      }
      return null;
    };

    const variantDescription = getDynamicDescription();

    // Helper for currency format
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Calculate delivery date (Estimated)
    const getDeliveryDate = () => {
      if (order.estimatedDeliveryDate) {
        return new Date(order.estimatedDeliveryDate);
      }
      // Fallback: 7 days from order creation
      const date = new Date(order.createdAt);
      date.setDate(date.getDate() + 7);
      return date;
    };

    const deliveryDate = getDeliveryDate();
    const deliveryDateString = deliveryDate.toLocaleDateString('en-US', { start: 'short', month: 'short', day: 'numeric' }); // "Sat Jan 24"
    const deliveryTimeString = "11 PM"; // Placeholder as per image

    // Date formatter
    const formatDate = (dateInput) => {
      if (!dateInput) return "";
      const date = new Date(dateInput);
      return date.toLocaleDateString('en-US', { start: 'short', month: 'short', day: 'numeric' });
    };

    // Helper to find event date
    const getEventDate = (statusKey) => {
      if (!trackingData?.timeline) return null;
      // Map keys to potential backend statuses
      const statusMap = {
        'confirmed': ['initialized', 'processed'],
        'shipped': ['shipped', 'out_for_delivery'],
        'delivery': ['delivered'],
        'cancelled': ['cancelled']
      };

      const targets = statusMap[statusKey] || [statusKey];
      // Find the LATEST event matching any of the targets
      // Events are likely sorted, but let's be safe
      const events = trackingData.timeline.filter(e => targets.includes(e.status));
      if (events.length === 0) return null;
      return events[events.length - 1].timestamp; // Assuming last is latest
    };

    // Stepper Logic
    const isCancelled = itemStatus === 'cancelled';
    let steps = [];

    if (isCancelled) {
      steps = [
        {
          key: "confirmed",
          label: "Order Confirmed",
          date: getEventDate('confirmed') || order.createdAt,
          subtext: formatDate(getEventDate('confirmed') || order.createdAt)
        },
        {
          key: "cancelled",
          label: "Cancelled",
          date: getEventDate('cancelled') || order.updatedAt,
          subtext: formatDate(getEventDate('cancelled') || order.updatedAt)
        }
      ];
    } else {
      steps = [
        {
          key: "confirmed",
          label: "Order Confirmed",
          date: getEventDate('confirmed') || order.createdAt,
          subtext: formatDate(getEventDate('confirmed') || order.createdAt)
        },
        {
          key: "shipped",
          label: "Shipped",
          date: getEventDate('shipped'),
          subtext: getEventDate('shipped') ? formatDate(getEventDate('shipped')) : ""
        },
        {
          key: "delivery",
          label: "Delivery",
          date: getEventDate('delivery') || deliveryDate,
          // If delivered, show delivered date. If not, show estimated.
          subtext: itemStatus === 'delivered'
            ? formatDate(getEventDate('delivery'))
            : `${deliveryDateString} by ${deliveryTimeString} `
        }
      ];
    }



    const getStepStatus = (stepKey) => {
      if (isCancelled) {
        // Both steps are "completed" in the sense they happened
        return 'completed';
      }

      if (stepKey === 'confirmed') return 'completed';

      if (stepKey === 'shipped') {
        if (['shipped', 'out_for_delivery', 'delivered'].includes(itemStatus)) return 'completed';
        return 'pending';
      }

      if (stepKey === 'delivery') {
        if (itemStatus === 'delivered') return 'completed';
        return 'pending';
      }
      return 'pending';
    };

    // COD Payment Logic
    const isCOD = order.paymentMethod === 'cod';
    const isPayable = isCOD && itemStatus !== 'delivered' && itemStatus !== 'cancelled' && itemStatus !== 'refunded';
    const amountToPay = order.totalAmount; // Assuming full order amount for now

    return (
      <div className="bg-gray-50 md:pb-0">
        {/* Header */}
        <div className="bg-white sticky top-0 px-2 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Order Details</h1>
          </div>
        </div>

        <div className="max-w-3xl md:max-w-full space-y-2 p-2 md:p-4 align-center justify-center">

          {/* Product Card */}
          <div className="bg-white py-2 px-2 md:px-4 flex gap-4 rounded-lg">
            {/* Image */}
            <div className="w-20 h-20 flex-shrink-0 border border-gray-100 rounded overflow-hidden">
              {item.productSnapshot?.image_url ? (
                <img
                  src={item.productSnapshot.image_url}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xl">📦</div>
              )}
            </div>
            {/* Details */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 leading-snug mb-1">{item.title}</h3>
              {variantDescription && (
                <p className="text-xs text-gray-500 mb-1">{variantDescription}</p>
              )}
              <div className="flex items-center gap-2">
                {/* Rating or functionality placeholder */}
              </div>
            </div>
          </div>

          {/* Payment CTA (COD Only) */}
          {isPayable && (
            <div className="py-2">
              <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between border border-blue-100">
                <p className="text-xs text-gray-700 font-medium leading-tight max-w-[60%]">
                  Pay online for a smooth doorstep experience
                </p>
                <button className="px-4 py-1.5 bg-white text-blue-600 text-xs md:text-sm font-bold border border-blue-200 rounded shadow-sm hover:bg-blue-50">
                  Pay {formatCurrency(amountToPay)}
                </button>
              </div>
            </div>
          )}

          {/* Order Info & Tracking */}
          <div className="bg-white py-2 px-2 md:px-4 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <p className="text-xs text-gray-500">Order #{order.id}</p>
              <button
                onClick={() => navigator.clipboard.writeText(order.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="border border-blue-600 rounded-lg p-4">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 mb-1">Order Confirmed</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsQueryModalOpen(true)}
                      className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Raise Query
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Your Order has been placed.</p>
              </div>

              {/* Stepper */}
              <div className="relative flex justify-between items-start mb-8 px-2">
                {/* Progress Bar Background - Always visible light grey track */}
                <div className="absolute top-2.5 left-[8.33%] right-[8.33%] h-1 bg-gray-200 rounded-full"></div>

                {/* Progress Bar Active - Green overlay for completed portion */}
                <div
                  className={`absolute top-2.5 left-[8.33%] h-1 rounded-full transition-all duration-500 ${isCancelled ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{
                    width: isCancelled
                      ? 'calc(83.33%)' // Full width for cancelled (2 steps)
                      : itemStatus === 'delivered'
                        ? 'calc(83.33%)'
                        : ['shipped', 'out_for_delivery'].includes(itemStatus)
                          ? 'calc(41.66%)'
                          : '0%'
                  }}
                ></div>

                {steps.map((step, index) => {
                  const status = getStepStatus(step.key);
                  const isCompleted = status === 'completed';
                  const isPending = status === 'pending';

                  // Determine circle styles based on status
                  let circleColorClass = "bg-white";
                  let borderColorClass = "border-gray-300";
                  let iconContent = null;

                  if (isCompleted) {
                    if (isCancelled && step.key === 'cancelled') {
                      circleColorClass = "bg-red-500";
                      borderColorClass = "border-red-500";
                      iconContent = <span className="text-[10px] text-white font-bold">✕</span>;
                    } else {
                      circleColorClass = "bg-green-500";
                      borderColorClass = "border-green-500";
                      iconContent = <span className="text-[10px] text-white font-bold">✓</span>;
                    }
                  } else {
                    // Pending state - show light grey circle with border
                    circleColorClass = "bg-gray-100";
                    borderColorClass = "border-gray-300";
                  }

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-1 z-10">
                      <div className={`w-6 h-6 rounded-full border-2 ${borderColorClass} ${circleColorClass} flex items-center justify-center shadow-sm`}>
                        {iconContent}
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] mb-0.5 ${isCompleted ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{step.label}</p>
                        <p className={`text-[10px] font-medium whitespace-pre-line leading-tight ${isCancelled && step.key === 'cancelled'
                          ? 'text-red-600'
                          : isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-400'
                          }`}>
                          {step.subtext || (isPending ? 'Pending' : '')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Executive Note */}
              {/* <div className="bg-gray-50 rounded p-3 flex gap-3 mb-4">
                <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-snug">
                  Delivery Executive details will be available once the order is out for delivery
                </p>
              </div> */}

              {/* <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors text-center hidden">
                See all updates
              </button> */}


            </div>
          </div>

          {/* Delivery Details */}
          <div
            className="bg-white px-2 py-2 md:px-4 rounded-lg cursor-pointer active:bg-gray-50 transition-colors"
            onClick={() => setIsAddressSheetOpen(true)}
          >
            <h3 className="text-sm font-medium text-gray-900 mb-4">Delivery details</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="flex gap-3">
                <div className="mt-0.5"><div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center"><span className="text-[10px] text-gray-600">🏠</span></div></div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{order.shippingAddress?.label || "Home"} <span className="font-normal text-gray-600">{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress?.city}</span></p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <div className="mt-0.5"><User className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{order.shippingAddress?.recipientName || "Customer Name"} <span className="font-normal text-gray-600">{order.shippingAddress?.phone || order.contactPhone}</span></p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="bg-white px-2 py-2 md:px-4 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Price details</h3>
            <div className="space-y-2 mb-4">
              {/* Listing Price */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">MRP</span>
                <span className="text-gray-900 line-through">₹{(item.totalPrice * 1.2).toLocaleString('en-IN')}</span> {/* Mock Initial Price */}
              </div>
              {/* Special Price */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  Special price <Info className="w-3 h-3 text-gray-400" />
                </div>
                <span className="text-gray-900">₹{item.totalPrice.toLocaleString('en-IN')}</span>
              </div>

              {/* Fees (Mock) */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  Total fees <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                <span className="text-gray-900">₹{10}</span>
              </div>

              {/* Discount (Mock) */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  Other discount <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                <span className="text-green-600 font-medium">-₹{10}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-3"></div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-bold text-gray-900">Total amount</span>
              <span className="text-base font-bold text-gray-900">₹{item.totalPrice.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-900">Payment method</span>
              <div className="flex items-center gap-2">
                {/* Icon placeholder for UPI/COD */}
                <span className="text-xs font-medium text-gray-600 uppercase">{order.paymentMethod}</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download Invoice
            </button>

            {/* Cancel Order Button - Only show if cancellable */}
            {!['delivered', 'cancelled', 'refunded'].includes(itemStatus) && (
              <CancelOrderButton
                order={order}
                item={item}
                itemStatus={itemStatus}
                onCancelSuccess={() => {
                  // Refresh by going back to list
                  onBack();
                }}
              />
            )}

            <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Info className="w-3 h-3" />
              Contact customer support for the invoice
            </p>
          </div>

          {/* Other Items */}
          {order.items && order.items.length > 1 && (
            <div className="bg-white py-2 ">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Other items in this order</h3>
              <div className="space-y-4">
                {order.items.filter(i => i.id !== item.id).map(otherItem => (
                  <div key={otherItem.id} className="flex gap-4">
                    {/* Simple list view for other items */}
                    <div className="w-16 h-16 border rounded overflow-hidden">
                      <img src={otherItem.productSnapshot?.image_url} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order #{order.id}</p>
                      <p className="text-sm font-medium">{otherItem.title}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium cursor-pointer">
                  <Copy className="w-3 h-3" />
                  <span>{order.orderNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* View Queries Button - Show if queries exist */}
          {queries.length > 0 && (
            <div className="bg-white py-2 px-2 md:px-4 rounded-lg">
              <button
                onClick={() => setIsQuerySheetOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Info className="w-4 h-4" />
                View Support Requests ({queries.length})
              </button>
            </div>
          )}
        </div>

        {/* Queries Bottom Sheet */}
        {isQuerySheetOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto transition-opacity"
              onClick={() => setIsQuerySheetOpen(false)}
            ></div>

            {/* Bottom Sheet Content */}
            <div className="bg-white w-full max-w-md sm:rounded-xl rounded-t-xl shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out animate-fade-up max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Support Requests</h3>
                <button
                  onClick={() => setIsQuerySheetOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 space-y-4 overflow-y-auto">
                {queries.map((query) => (
                  <div key={query.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-gray-900">{query.subject}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${query.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        query.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {query.status ? query.status.charAt(0).toUpperCase() + query.status.slice(1) : 'Open'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 whitespace-pre-line leading-relaxed">
                      {query.message?.split('\n\n[System Info]')[0]}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2 mt-2">
                      <span>{new Date(query.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>ID: {query.queryNumber || query.id.substr(0, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setIsQuerySheetOpen(false)}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Raise Query Modal */}
        {isQueryModalOpen && (
          <RaiseQueryModal
            isOpen={isQueryModalOpen}
            onClose={(success) => {
              setIsQueryModalOpen(false);
              if (success) fetchQueries();
            }}
            order={order}
            item={item}
            itemStatus={itemStatus} // Pass status
          />
        )}

        {/* Queries Bottom Sheet */}
        {isQuerySheetOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto transition-opacity"
              onClick={() => setIsQuerySheetOpen(false)}
            ></div>

            {/* Bottom Sheet Content */}
            <div className="bg-white w-full max-w-md sm:rounded-xl rounded-t-xl shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out animate-fade-up max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Support Requests</h3>
                <button
                  onClick={() => setIsQuerySheetOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 space-y-4 overflow-y-auto">
                {queries.map((query) => (
                  <div key={query.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-gray-900">{query.subject}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${query.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        query.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {query.status ? query.status.charAt(0).toUpperCase() + query.status.slice(1) : 'Open'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 whitespace-pre-line leading-relaxed">
                      {query.message?.split('\n\n[System Info]')[0]}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2 mt-2">
                      <span>{new Date(query.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>ID: {query.queryNumber || query.id.substr(0, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setIsQuerySheetOpen(false)}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address Bottom Sheet */}
        {isAddressSheetOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto transition-opacity"
              onClick={() => setIsAddressSheetOpen(false)}
            ></div>

            {/* Bottom Sheet Content */}
            <div className="bg-white w-full max-w-md sm:rounded-xl rounded-t-xl shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out animate-fade-up max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
                <button
                  onClick={() => setIsAddressSheetOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-6">
                {/* Map/Location Visual (Optional Placeholder) */}
                {/* Map/Location Visual */}
                {order.shippingAddress?.lat && order.shippingAddress?.lng ? (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <AddressMapPreview
                      lat={order.shippingAddress.lat}
                      lng={order.shippingAddress.lng}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">📍</span>
                      </div>
                      <p className="text-xs text-gray-500">Location Preview Not Available</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1"><div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center"><span className="text-sm">🏠</span></div></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{order.shippingAddress?.label || "Home"}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Contact Details</p>
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{order.shippingAddress?.recipientName || "Customer Name"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 flex items-center justify-center text-xs text-gray-400">📞</span>
                      <span className="text-sm text-gray-900">{order.shippingAddress?.phone || order.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setIsAddressSheetOpen(false)}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div >
    );
  };

  



  return (
    <div className="bg-white rounded-lg shadow-sm md:p-4">
      {selectedItem ? (
        <OrderDetailView item={selectedItem} onBack={() => setSelectedItem(null)} />
      ) : (
        <>
          <div className="flex items-center p-4">
            {isMobileApp && (
              <button onClick={() => window.history.back()} className="mr-3">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <h2 className={`${isMobileApp ? "text-lg" : "text-2xl"} font-bold text-gray-900`}>
              {isMobileApp ? "My Orders" : "My Orders"}
            </h2>
          </div>

          {/* Filter Buttons */}
          {/* Filter Buttons - Responsive */}
          {/* Mobile: Search & Filter Row */}
          <div className="md:hidden flex gap-3 mb-6 p-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search your order here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => {
                setTempFilter({ status: activeFilter, time: timeFilter });
                setShowFilterSheet(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>

          {/* Desktop Filter: Dropdown */}
          <div className="hidden md:flex justify-end mb-6">
            <div className="relative inline-block text-left w-52">
              <div className="group">
                <button
                  type="button"
                  className="inline-flex justify-between items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-gray-400 font-normal">Status:</span>
                    <span className="text-gray-900 font-semibold">
                      {activeFilter === "all" ? "All Orders" : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </button>

                <div className="hidden group-hover:block absolute right-0 mt-0 w-full origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-fade-in">
                  <div className="py-1">
                    {["all", "processed", "shipped", "delivered", "cancelled"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setActiveFilter(status)}
                        className={`w - full text - left px - 4 py - 2.5 text - sm transition - colors flex items - center justify - between ${activeFilter === status
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                          } `}
                      >
                        {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
                        {activeFilter === status && (
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
                  : `No items found with status: ${activeFilter} `}
              </p>
              <a href="/" className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Continue Shopping..
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item, index) => (
                <OrderItemRow
                  key={`${item.id} -${index} `} // Composite key in case of id collision (rare but safe)
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
                    className={`flex items - center gap - 1 px - 4 py - 2 text - sm font - medium rounded - lg transition - colors
                      ${!pagination.hasPrev
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      } `}
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
                    className={`flex items - center gap - 1 px - 4 py - 2 text - sm font - medium rounded - lg transition - colors
                      ${!pagination.hasNext
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      } `}
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

      {/* Mobile Filter Bottom Sheet */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto transition-opacity"
            onClick={() => setShowFilterSheet(false)}
          ></div>

          {/* Bottom Sheet Content */}
          <div className="bg-white w-full max-w-md sm:rounded-xl rounded-t-xl shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out animate-fade-up max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setTempFilter({ status: "all", time: "all" })}
                className="text-gray-400 text-sm font-medium hover:text-gray-600"
              >
                Clear Filter
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-6 overflow-y-auto">

              {/* Order Status Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Order Status</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All" },
                    { id: "processed", label: "Processed" },
                    { id: "shipped", label: "Shipped" },
                    { id: "delivered", label: "Delivered" },
                    { id: "cancelled", label: "Cancelled" },
                    { id: "refunded", label: "Returned" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTempFilter(prev => ({ ...prev, status: option.id }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${tempFilter.status === option.id
                        ? "bg-white border-blue-600 text-blue-600 shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {option.label}
                      {tempFilter.status === option.id && <span className="ml-1 text-blue-600">+</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Time Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Order Time</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "last30", label: "Last 30 days" },
                    { id: "2024", label: "2024" },
                    { id: "2023", label: "2023" },
                    { id: "older", label: "Older" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTempFilter(prev => ({ ...prev, time: option.id === tempFilter.time ? "all" : option.id }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${tempFilter.time === option.id
                        ? "bg-white border-blue-600 text-blue-600 shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {option.label}
                      {tempFilter.time === option.id && <span className="ml-1 text-blue-600">+</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-3 bg-white pb-safe">
              <button
                onClick={() => setShowFilterSheet(false)}
                className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveFilter(tempFilter.status);
                  setTimeFilter(tempFilter.time);
                  setShowFilterSheet(false);
                }}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Raise Query Modal Component
const RaiseQueryModal = ({ isOpen, onClose, order, item, itemStatus }) => {
  const [subject, setSubject] = useState("Request a Callback");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryOptions = [
    "Request a Callback",
    "Issue With Order",
    "Order Not Received",
    "Replace / Refund Order",
    "Others"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please describe your issue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("custom_token");
      const url = useApiRoutesStore.getState().orders.createQuery(order.id);

      // Append system info to message
      const systemInfo = `\n\n[System Info]\nOrder Item ID: ${item.id} \nOrder ID: ${order.id} \nCurrent Status: ${itemStatus} `;
      const fullMessage = message + systemInfo;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token} ` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message: fullMessage,
          priority: "normal"
        })
      });

      if (response.ok) {
        alert("Query raised successfully! We will get back to you soon.");
        if (onClose) onClose(true); // Signal success
      } else {
        const data = await response.json();
        alert(data.error || "Failed to raise query. Please try again.");
      }
    } catch (err) {
      console.error("Error raising query:", err);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Raise a Update</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Issue Type
            </label>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-shadow"
              >
                {queryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              rows={4}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 resize-none transition-shadow"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSubmitting ? "Submitting..." : "Submit Query"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdersSection;
