import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/Common/SearchBar";
import MobileMapAddressPicker from "../../components/Address/MobileMapAddressPicker";
import AddressList from "../../components/Address/AddressList";
import AddressForm from "../../components/Address/AddressForm";
import useCartStore from "../../store/cartStore";
import useAddressStore from "../../store/addressStore";
import useAuthStore from "../../store/authStore";
import useOrderStore from "../../store/orderStore";
import useNotificationStore from "../../store/notificationStore";
import useApiRoutesStore from "../../store/apiRoutesStore";

// CheckoutPage.js
function CheckoutPage() {
  const navigate = useNavigate();

  // Store integrations
  const {
    cart,
    updateQuantity,
    removeFromCart,
    loadCart,
    clearCart,
    getCheckoutItems,
    getCheckoutSummary,
    isBuyNowMode,
    buyNowItem,
    clearBuyNowItem,
  } = useCartStore();

  // Track images that failed to load to prevent infinite retry loops
  const failedImagesRef = useRef(new Set());

  // Process state management with enhanced validation tracking
  // If Buy Now mode (direct purchase), start at Step 1 (Order Summary/Review)
  // If Cart mode (standard checkout), start at Step 2 (Delivery Address) as Summary is already reviewed in Cart
  const [processState, setProcessState] = useState(isBuyNowMode ? 1 : 2);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showMobileMapPicker, setShowMobileMapPicker] = useState(false);
  const [isMobileApp, setIsMobileApp] = useState(false);

  // Order placement state
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [contactDetails, setContactDetails] = useState({
    phone: "",
    email: "",
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Order Summary UI state (matching Cart Page)
  const [expandedFees, setExpandedFees] = useState(false);
  const [expandedDiscounts, setExpandedDiscounts] = useState(false);




  const {
    addresses,
    loading: addressLoading,
    error: addressError,
    selectedAddressId,
    geoLoading,
    geoError,
    currentLocation,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
    getSelectedAddress,
    clearError,
    clearGeoError,
    getCurrentLocationAndAddress,
  } = useAddressStore();
  const { user, isAuthenticated, setModalOpen } = useAuthStore();
  const {
    orderSummary,
    loading: orderLoading,
    placingOrder,
    orderPlaced,
    paymentProcessing,
    error: orderError,
    orderValidation,
    validateOrderPrerequisites,
    calculateFinalOrderSummary,
    placeOrder,
    resetOrderState,
    syncOrderStatus,
    initiateRazorpayPayment,
    verifyRazorpayPayment,
    reportPaymentFailure,
  } = useOrderStore();
  const { showNotification } = useNotificationStore();

  // Memoized image error handler to prevent infinite requests
  const handleImageError = useCallback((e, imageSrc) => {
    if (!imageSrc) return;

    // Check if image already failed
    if (failedImagesRef.current.has(imageSrc)) {
      e.target.src = "/no-product-image.svg";
      return;
    }

    // Mark as failed
    failedImagesRef.current.add(imageSrc);
    e.target.src = "/no-product-image.svg";
  }, []);

  // Use a ref to store the current order for native callbacks to access
  const currentOrderRef = useRef(null);

  // Effect to handle Native Razorpay Callbacks
  useEffect(() => {
    // Success Callback from Native
    // Success Callback from Native
    window.onNativePaymentSuccess = async (data) => {
      console.log("Native payment success callback received:", data);
      try {
        let response = data;
        if (typeof data === 'string') {
          response = JSON.parse(data);
        }

        const order = currentOrderRef.current;

        if (!order) {
          console.error("No active order found for native payment success");
          return;
        }

        // Verify payment on backend
        await verifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: order.id
        });

        // Success
        if (isBuyNowMode) {
          clearBuyNowItem();
        } else {
          clearCart();
        }
        navigate(`/order-success/${order.id}`, {
          state: {
            order,
            message: "Payment successful! Your order has been placed.",
          },
        });
      } catch (error) {
        console.error("Native Payment verification failed:", error);
        showNotification({
          message: "Payment verification failed. Please contact support.",
          type: "error",
        });

        const order = currentOrderRef.current;
        if (order) {
          if (isBuyNowMode) {
            clearBuyNowItem();
          } else {
            clearCart();
          }
          navigate(`/order-success/${order.id}`, {
            state: {
              order,
              error: "Payment verification failed. Status is pending.",
            },
          });
        }
      }
    };

    // Failure Callback from Native
    window.onNativePaymentFailure = async (data) => {
      console.log("Native payment failure callback received:", data);
      try {
        let response = data;
        if (typeof data === 'string') {
          response = JSON.parse(data);
        }

        const order = currentOrderRef.current;

        if (!order) {
          console.error("No active order found for native payment failure");
          return;
        }

        console.error("Native Payment failed:", response);
        showNotification({
          message: `Payment failed: ${response.description || "Please try again."}`,
          type: "error",
        });

        // Report failure to backend
        await reportPaymentFailure({
          razorpay_order_id: response.metadata?.order_id, // Might need adjustment based on native response structure
          razorpay_payment_id: response.metadata?.payment_id,
          error_code: response.code,
          error_description: response.description,
          orderId: order.id
        });
      } catch (e) {
        console.error("Error handling native payment failure:", e);
      }
    };

    return () => {
      window.onNativePaymentSuccess = null;
      window.onNativePaymentFailure = null;
    };
  }, [navigate, clearCart, clearBuyNowItem, isBuyNowMode, verifyRazorpayPayment, reportPaymentFailure, showNotification]);

  // Load cart and addresses on component mount
  useEffect(() => {
    let mounted = true;

    if (isAuthenticated && mounted) {
      loadCart();
      fetchAddresses();
      resetOrderState();

      // Pre-populate contact details from user profile
      if (user) {
        setContactDetails({
          phone: user.phone || "",
          email: user.email || "",
        });
      }
    } else if (!isAuthenticated) {
      navigate("/");
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Detect mobile app environment or mobile screen size
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

  // Lightweight validation on address/payment changes (no API calls)
  useEffect(() => {
    if (selectedAddressId && paymentMethod && cart?.items?.length > 0) {
      // Just check that address is complete
      const selectedAddress = getSelectedAddress();
      if (!selectedAddress || !selectedAddress.line1 || !selectedAddress.city) {
        setValidationErrors(["Please complete your delivery address"]);
      } else {
        setValidationErrors([]);
      }
    }
  }, [selectedAddressId, paymentMethod, cart?.items?.length, getSelectedAddress]);

  // DO NOT auto-calculate order summary - it makes API requests for every item
  // Users should manually refresh or calculation happens before order placement

  // Handle comprehensive order validation
  const handleValidateOrder = async () => {
    try {
      const selectedAddress = getSelectedAddress();
      const validation = await validateOrderPrerequisites(
        cart.items || [],
        selectedAddress,
        paymentMethod
      );

      if (validation.errors && validation.errors.length > 0) {
        setValidationErrors(validation.errors);
      } else {
        setValidationErrors([]);
      }
    } catch (error) {
      console.error("Order validation failed:", error);
      setValidationErrors([error.message]);
    }
  };

  // Calculate order summary with current pricing
  const handleCalculateOrderSummary = async () => {
    try {
      if (cart?.items?.length > 0) {
        await calculateFinalOrderSummary(cart.items);
      }
    } catch (error) {
      console.error("Failed to calculate order summary:", error);
      showNotification({
        message: "Failed to calculate order summary. Please refresh and try again.",
        type: "error",
      });
    }
  };

  // Handle quantity change for cart items with validation
  const handleQuantityChange = async (productId, variantId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId, variantId);
      return;
    }

    if (newQuantity > 1000) {
      showNotification({
        message: "Maximum quantity limit is 1000 per item",
        type: "error"
      });
      return;
    }

    try {
      await updateQuantity(productId, variantId, newQuantity);
      showNotification({
        message: "Cart updated successfully",
        type: "success"
      });
    } catch (error) {
      showNotification({
        message: "Failed to update cart. Please try again.",
        type: "error"
      });
    }
  };

  // Handle remove item from cart
  const handleRemoveItem = async (productId, variantId) => {
    try {
      await removeFromCart(productId, variantId);
      showNotification({
        message: "Item removed from cart",
        type: "success"
      });
    } catch (error) {
      showNotification({
        message: "Failed to remove item. Please try again.",
        type: "error"
      });
    }
  };

  // Get variant display text
  const getVariantDisplayText = (item) => {
    if (item.variantOptions && item.variantOptions.length > 0) {
      return item.variantOptions
        .map((option) => option.value)
        .join(", ");
    }
    if (!item.variantDetails) return null;
    if (item.variantDetails.variantDescription) {
      return item.variantDetails.variantDescription;
    }
    if (item.variantDetails.optionValues) {
      const options = Object.values(item.variantDetails.optionValues)
        .filter((option) => option && option.value)
        .map((option) => option.value);
      return options.length > 0 ? options.join(", ") : null;
    }
    return null;
  };



  // Handle use current location




  // Handle edit address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  // Handle deliver here (select address and move to next step)
  const handleDeliverHere = async (addressId) => {
    // Find the address object
    const selectedAddr = addresses.find((a) => a.id === addressId);

    if (selectedAddr && selectedAddr.postalCode) {
      try {
        // Check pincode availability
        const response = await fetch(
          useApiRoutesStore.getState().pincodes.check(selectedAddr.postalCode)
        );
        const data = await response.json();

        if (!data.success || !data.serviceable) {
          showNotification({
            message:
              "This address is not deliverable. Kindly change the address and pincode.",
            type: "error",
          });
          return;
        }
      } catch (error) {
        console.error("Pincode check failed:", error);
        showNotification({
          message:
            "Unable to verify delivery availability. Please try again.",
          type: "error",
        });
        return;
      }
    }

    selectAddress(addressId);
    setProcessState(3); // Move to payment step
    showNotification({
      message: "Delivery address selected",
      type: "success",
    });
  };

  // Handle contact details change
  const handleContactChange = (field, value) => {
    setContactDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate final order before placement
  const validateFinalOrder = () => {
    const errors = [];
    // Check cart/checkout items
    const checkoutItems = getCheckoutItems();
    if (!checkoutItems || checkoutItems.length === 0) {
      errors.push("Your cart is empty");
    }

    // Check selected address
    if (!selectedAddressId || !getSelectedAddress()) {
      errors.push("Please select a delivery address");
    }

    // Check contact details
    if (!contactDetails.phone && !getSelectedAddress()?.phone) {
      errors.push("Please provide a contact phone number");
    }

    // Check payment method
    if (!paymentMethod) {
      errors.push("Please select a payment method");
    }

    // Check terms agreement
    if (!agreedToTerms) {
      errors.push("Please agree to terms and conditions");
    }

    // Validate phone format if provided
    if (
      contactDetails.phone &&
      !/^\+?[\d\s\-\(\)]{10,15}$/.test(contactDetails.phone)
    ) {
      errors.push("Please enter a valid contact phone number");
    }

    // Validate email format if provided
    if (
      contactDetails.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails.email)
    ) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  };

  // Handle place order with comprehensive validation and error handling
  const handlePlaceOrder = async () => {
    try {
      // Reset retry count for new attempt
      setRetryCount(0);

      // Final validation
      const errors = validateFinalOrder();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationModal(true);
        return;
      }

      // Clear any previous validation errors
      setValidationErrors([]);

      const selectedAddress = getSelectedAddress();
      const checkoutItems = getCheckoutItems();

      const orderData = {
        cartItems: checkoutItems,
        selectedAddress,
        paymentMethod,
        contactPhone: contactDetails.phone || selectedAddress.phone,
        contactEmail: contactDetails.email,
        notes: orderNotes,
      };

      console.log("🚀 Placing order with data:", orderData);

      const order = await placeOrder(orderData);

      // Handle Payment Flow
      // Hooks moved to top level

      if (paymentMethod === "cod") {
        // COD Order - Success immediately
        if (isBuyNowMode) {
          clearBuyNowItem();
        } else {
          clearCart();
        }
        navigate(`/order-success/${order.id}`, {
          state: {
            order,
            message: "Your order has been placed successfully!",
          },
        });
      } else {
        // Online Payment - Initiate Razorpay
        try {
          const razorpayOrder = await initiateRazorpayPayment(order.id);

          // Store order for native callbacks
          currentOrderRef.current = order;

          const options = {
            key: razorpayOrder.key,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "Bukizz Books", // Or fetch from config
            description: `Order #${order.orderNumber}`,
            order_id: razorpayOrder.id,
            prefill: {
              name: selectedAddress.recipientName,
              email: contactDetails.email,
              contact: contactDetails.phone || selectedAddress.phone,
            },
            theme: {
              color: "#3B82F6", // Blue-500
            },
            handler: async function (response) {
              try {
                // Verify payment on backend
                await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order.id
                });

                // Success
                if (isBuyNowMode) {
                  clearBuyNowItem();
                } else {
                  clearCart();
                }
                navigate(`/order-success/${order.id}`, {
                  state: {
                    order,
                    message: "Payment successful! Your order has been placed.",
                  },
                });
              } catch (verifyError) {
                console.error("Payment verification failed:", verifyError);
                showNotification({
                  message: "Payment verification failed. Please contact support.",
                  type: "error",
                });
                // Navigate to order page anyway, status will be pending/failed
                if (isBuyNowMode) {
                  clearBuyNowItem();
                } else {
                  clearCart();
                }
                navigate(`/order-success/${order.id}`, {
                  state: {
                    order,
                    error: "Payment verification failed. Status is pending.",
                  },
                });
              }
            },
            modal: {
              ondismiss: function () {
                showNotification({
                  message: "Payment process cancelled. Order cancelled.",
                  type: "warning",
                });

                // Report cancellation to backend
                reportPaymentFailure({
                  razorpay_order_id: razorpayOrder.id,
                  error_code: "CANCELLED",
                  error_description: "User closed payment modal",
                  orderId: order.id
                });
              },
            },
          };

          // Check if running in Native App environment
          if (window.RazorpayChannel) {
            console.log("Delegating payment to Native Razorpay SDK");
            window.RazorpayChannel.postMessage(JSON.stringify(options));
          } else {
            // Fallback to Web SDK
            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
              console.error("Payment failed:", response.error);
              showNotification({
                message: `Payment failed: ${response.error.description || "Please try again."}`,
                type: "error",
              });

              // Report failure to backend
              reportPaymentFailure({
                razorpay_order_id: response.error.metadata?.order_id || razorpayOrder.id,
                razorpay_payment_id: response.error.metadata?.payment_id,
                error_code: response.error.code,
                error_description: response.error.description,
                orderId: order.id
              });
            });

            rzp.open();
          }

        } catch (paymentError) {
          console.error("Payment initiation failed:", paymentError);
          showNotification({
            message: `Failed to initiate payment: ${paymentError.message || "Please try again or choose COD."}`,
            type: "error",
          });
          // Also report this initiation failure if we have an order ID
          if (order && order.id) {
            reportPaymentFailure({
              error_code: "INITIATION_FAILED",
              error_description: paymentError.message,
              orderId: order.id
            });
          }
        }
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      // ... (rest of error handling)
      if (
        error.message.includes("stock") ||
        error.message.includes("availability")
      ) {
        showNotification({
          message: "Some items are out of stock. Please update your cart.",
          type: "error",
        });
        setProcessState(1); // Go back to cart review
      } else if (error.message.includes("price")) {
        showNotification({
          message: "Product prices have changed. Please review your order.",
          type: "error",
        });
        handleCalculateOrderSummary(); // Refresh pricing
      } else if (
        error.message.includes("authentication") ||
        error.message.includes("session")
      ) {
        showNotification({
          message: "Session expired. Please log in again.",
          type: "error"
        });
        navigate("/");
      } else if (
        retryCount < maxRetries &&
        !error.message.includes("validation")
      ) {
        // Retry logic for network or temporary errors
        setRetryCount((prev) => prev + 1);
        showNotification({
          message: `Order placement failed. Retrying... (${retryCount + 1}/${maxRetries})`,
          type: "warning",
        });
        setTimeout(() => handlePlaceOrder(), 2000 * (retryCount + 1)); // Exponential backoff
      } else {
        setValidationErrors([error.message]);
        setShowValidationModal(true);
      }
    }
  };

  // Handle retry order placement
  const handleRetryOrder = () => {
    setShowValidationModal(false);
    setValidationErrors([]);
    handlePlaceOrder();
  };

  // Scroll to top when process state changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [processState]);

  // Get checkout items and summary (works for both cart and buy now)
  const checkoutItems = getCheckoutItems();

  // Use direct store values instead of getCheckoutSummary for accuracy
  // This mirrors the logic in CartPage.js to ensure consistency
  const checkoutSummary = isBuyNowMode && buyNowItem
    ? {
      items: [buyNowItem],
      totalItems: buyNowItem.quantity,
      subtotal: buyNowItem.price * buyNowItem.quantity,
      platformFees: 10,
      deliveryCharges: buyNowItem.deliveryCharge || 0,
      // Calculate total for Buy Now
      totalAmount: (buyNowItem.price * buyNowItem.quantity) + 10 + (buyNowItem.deliveryCharge || 0)
    }
    : cart; // When in Cart mode, use the cart store state directly

  // Calculate totals from checkout summary
  const cartSubtotal = checkoutSummary.subtotal || 0;
  const cartItemCount = checkoutSummary.totalItems || 0;

  // Get selected address
  const selectedAddress = getSelectedAddress();

  // Calculate MRP (total original prices) for display - similar to CartPage
  const totalMRP = checkoutItems?.reduce((sum, item) => {
    // If originalPrice exists and is greater than price, use it. Otherwise use price.
    // Note: The cart item structure might differ slightly, checking for originalPrice or compare_at_price
    const originalPrice = item.originalPrice || item.compare_at_price || item.price;
    return sum + (originalPrice * item.quantity);
  }, 0) || 0;

  // Calculate fees and savings for display
  // Use store values for fees to ensure consistency
  const fees = (checkoutSummary.platformFees || checkoutSummary.platformFee || 0) + (checkoutSummary.deliveryCharges || checkoutSummary.deliveryFee || 0);

  // Calculate discount (Strictly MRP - Subtotal)
  const totalSavings = totalMRP - (checkoutSummary.subtotal || 0);

  // Check if order can proceed
  const canProceedToNext = () => {
    switch (processState) {
      case 1:
        return checkoutItems?.length > 0;
      case 2:
        return selectedAddressId && getSelectedAddress();
      case 3:
        return validateFinalOrder().length === 0;
      default:
        return false;
    }
  };

  // Render loading state
  if (orderLoading || addressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Render empty cart state
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className=" bg-[#F3F8FF] flex flex-col">
        <SearchBar />
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center py-4 md:py-8">
            <div className="mb-4 md:mb-6">
              <img
                src="/cart.svg"
                alt="Empty Cart"
                className="w-48 h-48 md:w-64 md:h-64 object-contain"
              />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0051A3] mb-8 md:mb-12 text-center tracking-tight">
              You Study, We Deliver
            </h2>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-full border-2 border-[#0051A3] text-[#0051A3] font-semibold text-lg hover:bg-blue-50 transition-colors duration-300"
            >
              Keep Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Map Address Picker */}
      {showMobileMapPicker && (
        <MobileMapAddressPicker
          onClose={() => setShowMobileMapPicker(false)}
          onAddressSelect={(newAddress) => {
            selectAddress(newAddress.id);
            setShowMobileMapPicker(false);
          }}
        />
      )}

      {/* <SearchBar /> */}

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-nowrap items-start justify-between relative max-w-3xl mx-auto">
            {/* Progress Bar Lines - Absolute Positioned */}
            <div className="absolute top-3 md:top-5 left-0 w-full h-[2px] bg-gray-200 translate-y-[-50%]" />
            <div
              className="absolute top-3 md:top-5 left-0 h-[2px] bg-[#3B82F6] transition-all duration-300 translate-y-[-50%]"
              style={{
                width: processState === 1 ? '0%' : processState === 2 ? '50%' : '100%'
              }}
            />

            {[
              { step: 1, label: "Review Order", icon: "1" },
              { step: 2, label: "Delivery Address", icon: "2" },
              { step: 3, label: "Payment", icon: "3" },
            ].map(({ step, label, icon }) => (
              <div key={step} className="flex flex-col items-center bg-white px-2 relative z-10">
                <div
                  className={`flex items-center justify-center w-6 h-6 md:w-10 md:h-10 rounded-full transition-colors duration-300 border-2 ${processState >= step
                    ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                    : "bg-white border-gray-200 text-gray-400"
                    }`}
                >
                  {processState > step ? (
                    <svg
                      className="w-3 h-3 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-[10px] md:text-base font-medium leading-none">{icon}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] md:text-sm font-medium text-center ${processState >= step ? "text-gray-900" : "text-gray-400"
                    }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Order Summary */}
            {processState === 1 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Review Your Order
                  </h2>
                  <span className="text-sm text-gray-600">
                    {cartItemCount} items
                  </span>
                </div>

                {/* Validation Warnings */}
                {validationErrors.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex">
                      <div className="text-yellow-600 mr-3">⚠️</div>
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          Please address the following issues:
                        </h4>
                        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart Items */}
                <div className="space-y-4">
                  {checkoutItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId || "default"}`}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={item.image || "/no-product-image.svg"}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => handleImageError(e, item.image)}
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">
                          {item.title}
                        </h3>

                        {getVariantDisplayText(item) && (
                          <p className="text-sm text-gray-600 mt-1">
                            {getVariantDisplayText(item)}
                          </p>
                        )}

                        {item.sku && (
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {item.sku}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.variantId,
                                  item.quantity - 1
                                )
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={orderLoading || item.quantity <= 1}
                            >
                              −
                            </button>

                            <span className="font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={orderLoading || item.quantity >= 1000}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              ₹{item.price} each
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleRemoveItem(item.productId, item.variantId)
                        }
                        className="text-red-500 hover:text-red-700 p-2 transition-colors"
                        disabled={orderLoading}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => navigate("/")}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    ← Continue Shopping
                  </button>

                  <button
                    onClick={() => setProcessState(2)}
                    disabled={!canProceedToNext()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Proceed to Delivery →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {processState === 2 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Select Delivery Address
                  </h2>
                  {isMobileApp && (
                    <button
                      onClick={() => setShowMobileMapPicker(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <div className="mb-6">
                    <AddressForm
                      existingAddress={editingAddress}
                      onCancel={handleCancelForm}
                      onSuccess={() => {
                        fetchAddresses();
                        handleCancelForm();
                        showNotification({
                          message: editingAddress ? "Address updated successfully" : "Address added successfully",
                          type: "success"
                        });
                      }}
                    />
                  </div>
                )}

                {/* Desktop Add Address Bar */}
                {!isMobileApp && !showAddressForm && (
                  <div
                    onClick={() => setShowAddressForm(true)}
                    className="mb-6 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center text-blue-600 font-semibold uppercase tracking-wide"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    ADD A NEW ADDRESS
                  </div>
                )}

                {/* Existing Addresses */}
                {addresses.length > 0 ? (
                  <AddressList
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelect={(addr) => selectAddress(addr.id)}
                    onEdit={handleEditAddress}
                    onDelete={(address) => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this address?"
                        )
                      ) {
                        deleteAddress(address.id);
                      }
                    }}
                    isMobile={isMobileApp}
                    onDeliverHere={(addr) => handleDeliverHere(addr.id)}
                  />
                ) : (
                  !showAddressForm && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        No addresses found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Add your first delivery address to continue
                      </p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add Address
                      </button>
                    </div>
                  )
                )}

                {!showAddressForm && addresses.length > 0 && (
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() =>
                        isBuyNowMode ? setProcessState(1) : navigate("/cart")
                      }
                      className="text-gray-600 hover:text-gray-700 font-medium transition-colors"
                    >
                      {isBuyNowMode ? "← Back to Review" : "← Back to Cart"}
                    </button>

                    <button
                      onClick={() => handleDeliverHere(selectedAddressId)}
                      disabled={!selectedAddressId}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment & Place Order */}
            {processState === 3 && (
              <div className="space-y-6">
                {/* Order Summary Review */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Order Review
                  </h3>

                  {/* Selected Address */}
                  {selectedAddress && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">
                          Delivery Address
                        </h4>
                        <button
                          onClick={() => setProcessState(2)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Change
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">
                          {selectedAddress.recipientName}
                        </div>
                        <div>
                          {selectedAddress.line1}
                          {selectedAddress.line2 &&
                            `, ${selectedAddress.line2}`}
                        </div>
                        <div>
                          {selectedAddress.city}, {selectedAddress.state} -{" "}
                          {selectedAddress.postalCode}
                        </div>
                        <div>📞 {selectedAddress.phone}</div>
                      </div>
                    </div>
                  )}

                  {/* Cart Items Summary */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">
                      Items ({cartItemCount})
                    </h4>
                    <div className="space-y-3">
                      {checkoutItems.map((item) => (
                        <div
                          key={`${item.productId}-${item.variantId || "default"
                            }`}
                          className="flex items-center space-x-3 text-sm"
                        >
                          <img
                            src={item.image || "/no-product-image.svg"}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => handleImageError(e, item.image)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            {getVariantDisplayText(item) && (
                              <div className="text-gray-500">
                                {getVariantDisplayText(item)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-gray-500">
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={contactDetails.phone}
                        onChange={(e) =>
                          handleContactChange("phone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Phone number for order updates"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={contactDetails.email}
                        onChange={(e) =>
                          handleContactChange("email", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Email for order confirmation"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Payment Method
                  </h3>

                  <div className="space-y-3">
                    {[
                      {
                        value: "cod",
                        label: "Cash on Delivery",
                        icon: "💵",
                        desc: "Pay when your order is delivered",
                      },
                      {
                        value: "upi",
                        label: "UPI Payment",
                        icon: "📱",
                        desc: "Pay using UPI apps like GPay, PhonePe, Paytm",
                      },
                      {
                        value: "card",
                        label: "Credit/Debit Card",
                        icon: "💳",
                        desc: "Secure payment with your card",
                      },
                      {
                        value: "netbanking",
                        label: "Net Banking",
                        icon: "🏦",
                        desc: "Pay using internet banking",
                      },
                      {
                        value: "wallet",
                        label: "Digital Wallet",
                        icon: "💰",
                        desc: "Pay using digital wallets",
                      },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{method.icon}</span>
                            <span className="font-medium text-gray-800">
                              {method.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {method.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Additional Notes (Optional)
                  </h3>

                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Any special instructions for delivery..."
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {orderNotes.length}/500 characters
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </label>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <div className="text-red-600 mr-3">❌</div>
                      <div>
                        <h4 className="font-medium text-red-800">
                          Please fix the following issues:
                        </h4>
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Place Order Button */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setProcessState(2)}
                    className="text-gray-600 hover:text-gray-700 font-medium transition-colors"
                  >
                    ← Back to Address
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      placingOrder || paymentProcessing || !agreedToTerms
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    {placingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Placing Order...</span>
                      </>
                    ) : paymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>🛒</span>
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>

                {retryCount > 0 && (
                  <div className="text-center text-sm text-gray-600">
                    Retry attempt: {retryCount}/{maxRetries}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h3>

              {/* MRP */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">MRP</span>
                <span className="text-gray-900">₹{totalMRP.toLocaleString('en-IN')}</span>
              </div>

              {/* Fees */}
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <button
                  onClick={() => setExpandedFees(!expandedFees)}
                  className="flex items-center gap-1 text-gray-700"
                >
                  Fees
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedFees ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-gray-900">₹{fees.toLocaleString('en-IN')}</span>
              </div>
              {expandedFees && (
                <div className="pl-4 text-sm text-gray-500 pb-2">
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>₹{(checkoutSummary.platformFees || checkoutSummary.platformFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span>{(checkoutSummary.deliveryCharges || checkoutSummary.deliveryFee || 0) === 0 ? 'FREE' : `₹${(checkoutSummary.deliveryCharges || checkoutSummary.deliveryFee || 0).toLocaleString('en-IN')}`}</span>
                  </div>
                </div>
              )}

              {/* Discounts */}
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <button
                  onClick={() => setExpandedDiscounts(!expandedDiscounts)}
                  className="flex items-center gap-1 text-gray-700"
                >
                  Discounts
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedDiscounts ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-green-600 font-medium">
                  -₹{totalSavings.toLocaleString('en-IN')}
                </span>
              </div>
              {expandedDiscounts && (
                <div className="pl-4 text-sm text-gray-500 pb-2">
                  <div className="flex justify-between">
                    <span>Product Discount</span>
                    <span className="text-green-600">-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-2">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="font-bold text-gray-900 text-lg">
                  ₹{(checkoutSummary.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Savings Banner */}
              {totalSavings > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg py-3 px-4 text-center mt-3">
                  <span className="text-yellow-800 font-medium">
                    You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
                  </span>
                </div>
              )}

              {processState === 3 && paymentMethod === "cod" && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center text-sm text-yellow-800">
                    <span className="mr-2">💵</span>
                    <span>
                      Cash on Delivery selected. Pay ₹
                      {(checkoutSummary.totalAmount || 0).toLocaleString('en-IN')} when
                      your order arrives.
                    </span>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-sm text-green-800">
                  <span className="mr-2">🔒</span>
                  <span>100% secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
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

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="text-red-600 text-2xl mr-3">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Order Issues Found
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Please address the following issues before placing your order:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowValidationModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>

              {!validationErrors.some(
                (error) =>
                  error.includes("cart is empty") ||
                  error.includes("address") ||
                  error.includes("terms")
              ) && (
                  <button
                    onClick={handleRetryOrder}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Retry Order
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
