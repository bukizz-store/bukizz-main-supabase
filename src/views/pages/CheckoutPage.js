import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../../components/Common/SearchBar";
import { isWebViewMode } from "../../utils/navigation";
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
  const location = useLocation(); // Add location hook

  // Store integrations
  const {
    cart,
    updateQuantity,
    removeFromCart,
    loadCart,
    clearCart,
    getCheckoutItems,
    getCheckoutSummary,
    isBuyNowMode, // We'll override this with explicit state
    buyNowItem,
    clearBuyNowItem,
    initiateBuyNowFlow,
    updateBuyNowItemQuantity,
    restoreCart,
  } = useCartStore();

  // Track images that failed to load to prevent infinite retry loops
  const failedImagesRef = useRef(new Set());

  // Track if we are navigating away (to success page) to prevent validation redirects
  const isNavigatingAway = useRef(false);

  // Determine checkout mode explicitly from navigation state
  // This prevents stale store state from causing issues
  const checkoutMode = location.state?.mode; // 'buy_now' or 'cart'

  // Use explicit mode if available, fallback to store state (backward compatibility)
  const isExplicitBuyNow = checkoutMode === 'buy_now';
  const isExplicitCart = checkoutMode === 'cart';

  // Derived state for actual mode
  // If explicit cart, force false. If explicit buy now, force true. Else fallback.
  const isBuyNow = isExplicitCart ? false : (isExplicitBuyNow || isBuyNowMode);

  // Validate generic state on mount
  useEffect(() => {
    // If trying to do Buy Now but no item exists, redirect home
    if (isBuyNow && !buyNowItem && !isNavigatingAway.current) {
      console.warn("Buy Now mode active but no item found. Redirecting to home.");
      navigate("/", { replace: true });
    }
  }, [isBuyNow, buyNowItem, navigate]);

  // Process state management with enhanced validation tracking
  // Process state management with enhanced validation tracking
  // Both Buy Now and Cart modes now start at Step 2 (Delivery Address) 
  // because Buy Now items are reviewed in the Cart page first.
  const [processState, setProcessState] = useState(2);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showMobileMapPicker, setShowMobileMapPicker] = useState(false);
  const [isMobileApp, setIsMobileApp] = useState(false);

  // Order placement state
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [orderNotes, setOrderNotes] = useState("");
  const [studentNameForOrder, setStudentNameForOrder] = useState("");


  // Validation states
  const [studentNameError, setStudentNameError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
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
    reconcilePaymentStatus,
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

  // Use refs to store order data for native callbacks to access
  const currentOrderRef = useRef(null);
  const razorpayOrderIdRef = useRef(null);

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
        isNavigatingAway.current = true;

        if (isBuyNow) {
          restoreCart();
        } else {
          clearCart();
        }
        navigate(`/order-success/${order.id}`, {
          state: {
            order,
            message: "Payment successful! Your order has been placed.",
          },
        });

        // Clean up refs
        currentOrderRef.current = null;
        razorpayOrderIdRef.current = null;
      } catch (error) {
        console.error("Native Payment verification failed:", error);
        showNotification({
          message: "Payment verification failed. Please contact support.",
          type: "error",
        });

        const order = currentOrderRef.current;
        if (order) {

          try {
            // Attempt auto-recovery
            console.log("Attempting auto-recovery for payment...");
            await reconcilePaymentStatus(order.id);
          } catch (recError) {
            console.error("Auto-recovery also failed:", recError);
          }

          isNavigatingAway.current = true;

          if (isBuyNow) {
            restoreCart();
          } else {
            clearCart();
          }
          navigate(`/order-success/${order.id}`, {
            state: {
              order,
              error: "Payment verification failed. Check order details to retry or view status.",
            },
          });

          // Clean up refs
          currentOrderRef.current = null;
          razorpayOrderIdRef.current = null;
        }
      }
    };

    // Failure Callback from Native
    // Flutter sends: { "code": <int>, "description": <string> }
    // code 2 = user cancelled, other codes = actual payment failure
    window.onNativePaymentFailure = async (data) => {
      console.log("Native payment failure callback received:", data);
      try {
        let response = data;
        if (typeof data === 'string') {
          response = JSON.parse(data);
        }

        const order = currentOrderRef.current;
        const razorpayOrderId = razorpayOrderIdRef.current;

        if (!order) {
          console.error("No active order found for native payment failure");
          return;
        }

        // Distinguish cancellation (code 2) from actual payment failure
        const isCancellation = response.code === 2;

        if (isCancellation) {
          console.warn("Native Payment cancelled by user");
          showNotification({
            message: "Payment process cancelled. Order cancelled.",
            type: "warning",
          });
        } else {
          console.error("Native Payment failed:", response);
          showNotification({
            message: `Payment failed: ${response.description || "Please try again."}`,
            type: "error",
          });
        }

        // Report failure/cancellation to backend using the stored Razorpay order ID
        await reportPaymentFailure({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: null,
          error_code: isCancellation ? "CANCELLED" : response.code,
          error_description: isCancellation
            ? "User cancelled payment from native app"
            : (response.description || "Payment failed"),
          orderId: order.id
        });

        // Clean up refs
        currentOrderRef.current = null;
        razorpayOrderIdRef.current = null;
      } catch (e) {
        console.error("Error handling native payment failure:", e);
      }
    };

    return () => {
      window.onNativePaymentSuccess = null;
      window.onNativePaymentFailure = null;
    };
  }, [navigate, clearCart, clearBuyNowItem, isBuyNow, verifyRazorpayPayment, reportPaymentFailure, showNotification]);

  // Load cart and addresses on component mount
  useEffect(() => {
    let mounted = true;

    if (isAuthenticated && mounted) {
      loadCart();
      fetchAddresses();
      resetOrderState();
    } else if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      useAuthStore.getState().setRedirectPath(currentPath);
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
      if (isBuyNow) {
        // Buy Now mode: update single item directly
        // Note: productId/variantId check skipped as there's only one item
        // But strictly we should check
        if (buyNowItem && buyNowItem.productId === productId && buyNowItem.variantId === variantId) {
          updateBuyNowItemQuantity(newQuantity);
        }
      } else {
        // Cart mode
        await updateQuantity(productId, variantId, newQuantity);
      }
      // Removed success notification
    } catch (error) {
      showNotification({
        message: "Failed to update quantity. Please try again.",
        type: "error"
      });
    }
  };

  // Handle remove item from cart
  const handleRemoveItem = async (productId, variantId) => {
    try {
      if (isBuyNow) {
        if (buyNowItem && buyNowItem.productId === productId && buyNowItem.variantId === variantId) {
          clearBuyNowItem();
          // Redirect handled by useEffect
        }
      } else {
        await removeFromCart(productId, variantId);
      }
      // Removed success notification
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

  // Helper functions imported from CartPage design
  const getImageSrc = useCallback((item) => {
    if (item.image && item.image !== "/placeholder.jpg") {
      return item.image;
    }
    if (item.productDetails?.images?.[0]?.url) {
      return item.productDetails.images[0].url;
    }
    if (item.variantDetails?.image) {
      return item.variantDetails.image;
    }
    return "/no-product-image.svg";
  }, []);

  const getDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 4));
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return deliveryDate.toLocaleDateString('en-IN', options);
  };

  const getDiscountPercentage = (originalPrice, price) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const getStockStatus = (item) => {
    const stock = item.variantDetails?.stock || item.stock;
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600" };
    if (stock && stock <= 5) return { text: `Only ${stock} left`, color: "text-orange-500" };
    return null;
  };

  const handleBuyNow = (item) => {
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }

    try {
      // Create product and variant objects from cart item for setBuyNowItem
      // Note: item structure in checkoutItems might be slightly different depending on source (cart vs buyNowItem)
      // But assuming it matches what's used in CartPage for now
      const product = {
        id: item.productId,
        title: item.title,
        sku: item.sku,
        productType: item.productType,
        basePrice: item.price,
        base_price: item.price,
        images: item.image ? [{ url: item.image, isPrimary: true }] : [],
        metadata: item.productDetails?.metadata || {},
        deliveryCharge: item.deliveryCharge || 0,
      };

      const variant = item.variantDetails ? {
        id: item.variantId,
        sku: item.variantDetails.sku,
        price: item.price,
        compare_at_price: item.originalPrice,
        stock: item.variantDetails.stock,
        image: item.variantDetails.image,
        option_value_1_ref: item.variantDetails.optionValues?.option1 ? {
          id: item.variantDetails.optionValues.option1.id,
          value: item.variantDetails.optionValues.option1.value,
          attribute_name: item.variantDetails.optionValues.option1.attributeName,
          price_modifier: item.variantDetails.optionValues.option1.priceModifier || 0,
        } : null,
        option_value_2_ref: item.variantDetails.optionValues?.option2 ? {
          id: item.variantDetails.optionValues.option2.id,
          value: item.variantDetails.optionValues.option2.value,
          attribute_name: item.variantDetails.optionValues.option2.attributeName,
          price_modifier: item.variantDetails.optionValues.option2.priceModifier || 0,
        } : null,
        option_value_3_ref: item.variantDetails.optionValues?.option3 ? {
          id: item.variantDetails.optionValues.option3.id,
          value: item.variantDetails.optionValues.option3.value,
          attribute_name: item.variantDetails.optionValues.option3.attributeName,
          price_modifier: item.variantDetails.optionValues.option3.priceModifier || 0,
        } : null,
      } : null;

      // Set this item as Buy Now item (bypasses rest of cart)
      initiateBuyNowFlow(product, variant, item.quantity);
      // Force reload/re-navigation to same page with new state
      // We might need to handle this carefully to ensure state update is picked up
      // Since we are already on checkout, navigate to self might not trigger remount
      // But passing different state should update location
      navigate("/checkout", { state: { mode: 'buy_now' }, replace: true });
      // Also explicity reload to be safe if sticking to same route? 
      // No, react-router should handle location changes.
      // However, our effect depends on [isBuyNow, buyNowItem, navigate].
      // Changing explicit state mode will change isBuyNow derived state.

    } catch (error) {
      console.error("Error with Buy Now:", error);
      showNotification({
        message: "Failed to proceed with Buy Now. Please try again.",
        type: "error"
      });
    }
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

    // Strict Validation for Selected Address
    if (selectedAddr) {
      const phoneDigits = selectedAddr.phone?.replace(/\D/g, '') || "";
      const pincodeDigits = selectedAddr.postalCode?.replace(/\D/g, '') || "";

      const isNameValid = selectedAddr.recipientName?.trim().length >= 2;
      const isPhoneValid = /^[6-9]\d{9}$/.test(phoneDigits);
      const isPincodeValid = /^\d{6}$/.test(pincodeDigits);
      const isLine1Valid = selectedAddr.line1?.trim().length >= 5;
      const isCityValid = !!selectedAddr.city?.trim();
      const isStateValid = !!selectedAddr.state?.trim();

      if (!isNameValid || !isPhoneValid || !isPincodeValid || !isLine1Valid || !isCityValid || !isStateValid) {
        showNotification({
          message: "Please update this address with correct details (Name, Phone, Pincode)",
          type: "warning",
        });
        handleEditAddress(selectedAddr);
        return;
      }

      // Validate Student Name for Order
      if (!studentNameForOrder?.trim()) {
        setStudentNameError("Student Name is required for this order");
        // Scroll to the student name field or just rely on the red border
        return;
      } else if (studentNameForOrder.trim().length < 2) {
        setStudentNameError("Student Name is too short");
        return;
      }

      setStudentNameError(""); // Clear error on valid input

      // Backend Pincode Serviceability Check
      if (selectedAddr.postalCode) {
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
    }

    selectAddress(addressId);
    setProcessState(3); // Move to payment step
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
    const selectedAddress = getSelectedAddress();
    if (!selectedAddressId || !selectedAddress) {
      errors.push("Please select a delivery address");
    } else {
      // Strict Re-validation of selected address content
      const phoneDigits = selectedAddress.phone?.replace(/\D/g, '') || "";
      const pincodeDigits = selectedAddress.postalCode?.replace(/\D/g, '') || "";

      const isNameValid = selectedAddress.recipientName?.trim().length >= 2;
      const isPhoneValid = /^[6-9]\d{9}$/.test(phoneDigits);
      const isPincodeValid = /^\d{6}$/.test(pincodeDigits);
      const isLine1Valid = selectedAddress.line1?.trim().length >= 5;

      if (!isNameValid || !isPhoneValid || !isPincodeValid || !isLine1Valid) {
        errors.push("Selected address has invalid details. Please update it.");
        // Optionally trigger edit mode here, but might be jarring. Better to just error.
        // We can also try to highlight IT.
        // Force user back to address step if validation fails
        if (processState > 2) setProcessState(2);
      }
    }

    // Validate Student Name for Order
    if (!studentNameForOrder?.trim()) {
      errors.push("Student Name is required");
      if (processState > 2) setProcessState(2);
      setStudentNameError("Student Name is required for this order");
    } else if (studentNameForOrder.trim().length < 2) {
      errors.push("Student Name is too short");
      if (processState > 2) setProcessState(2);
      setStudentNameError("Student Name is too short");
    } else {
      setStudentNameError("");
    }

    // Check payment method
    if (!paymentMethod) {
      errors.push("Please select a payment method");
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
        selectedAddress: {
          ...selectedAddress,
          studentName: studentNameForOrder.trim()
        },
        paymentMethod,
        contactPhone: selectedAddress.phone,
        contactEmail: user?.email || "",
        notes: orderNotes,
      };

      console.log("🚀 Placing order with data:", orderData);

      const order = await placeOrder(orderData);

      // Handle Payment Flow
      // Hooks moved to top level

      if (paymentMethod === "cod") {
        // COD Order - Success immediately
        isNavigatingAway.current = true;

        if (isBuyNow) {
          restoreCart();
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
          setIsRazorpayLoading(true);
          const razorpayOrder = await initiateRazorpayPayment(order.id);

          // Store order and Razorpay order ID for native callbacks
          currentOrderRef.current = order;
          razorpayOrderIdRef.current = razorpayOrder.id;

          const options = {
            key: razorpayOrder.key,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "Bukizz Books", // Or fetch from config
            description: `Order #${order.orderNumber}`,
            order_id: razorpayOrder.id,
            prefill: {
              name: selectedAddress.recipientName,
              email: user?.email || "",
              contact: selectedAddress.phone,
            },
            theme: {
              color: "#3B82F6", // Blue-500
            },
            handler: async function (response) {
              setIsRazorpayLoading(false);
              try {
                // Verify payment on backend
                await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order.id
                });

                // Success
                isNavigatingAway.current = true;

                if (isBuyNow) {
                  restoreCart();
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
                try {
                  // Attempt auto-recovery
                  console.log("Attempting auto-recovery for payment...");
                  await reconcilePaymentStatus(order.id);
                } catch (recError) {
                  console.error("Auto-recovery also failed:", recError);
                }

                // Navigate to order page anyway, status will be pending/failed
                isNavigatingAway.current = true;

                if (isBuyNow) {
                  restoreCart();
                } else {
                  clearCart();
                }
                navigate(`/order-success/${order.id}`, {
                  state: {
                    order,
                    error: "Payment verification failed. Check order details to retry or view status.",
                  },
                });
              }
            },
            modal: {
              ondismiss: function () {
                setIsRazorpayLoading(false);
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
            setIsRazorpayLoading(false);
          } else {
            // Fallback to Web SDK
            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
              setIsRazorpayLoading(false);
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
            setIsRazorpayLoading(false);
          }

        } catch (paymentError) {
          setIsRazorpayLoading(false);
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
      } else {
        // No automatic retry for other errors, just show validation modal or error
        setValidationErrors([error.message || "Something went wrong. Please try again."]);
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


  // Get checkout items based on mode
  const checkoutItems = isBuyNow && buyNowItem ? [buyNowItem] : (cart.items || []);

  // Calculate if COD is allowed for all items
  const isCodAllowed = useMemo(() => {
    return checkoutItems.every((item) => {
      const methods = item.productDetails?.paymentMethods || item.paymentMethods || [];
      if (!methods || methods.length === 0) return true; // Default allow
      return methods.includes("cod");
    });
  }, [checkoutItems]);

  useEffect(() => {
    if (!isCodAllowed && paymentMethod === "cod") {
      setPaymentMethod("upi");
    }
  }, [isCodAllowed, paymentMethod]);

  // Check if we are really in buy now mode (explicitly checked above)
  const activeBuyNowItem = isBuyNow ? buyNowItem : null;

  // Use direct store values instead of getCheckoutSummary for accuracy
  // This mirrors the logic in CartPage.js to ensure consistency
  const checkoutSummary = activeBuyNowItem
    ? {
      items: [activeBuyNowItem],
      totalItems: activeBuyNowItem.quantity,
      subtotal: activeBuyNowItem.price * activeBuyNowItem.quantity,
      platformFees: 10,
      deliveryCharges: activeBuyNowItem.deliveryCharge || 0,
      // Calculate total for Buy Now
      totalAmount: (activeBuyNowItem.price * activeBuyNowItem.quantity) + 10 + (activeBuyNowItem.deliveryCharge || 0)
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Full-screen Loader for Razorpay */}
      {isRazorpayLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 text-xl font-bold">₹</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800">Secure Payment</h3>
              <p className="text-sm text-gray-500 mt-1 pb-2">Connecting to Razorpay...</p>
            </div>
          </div>
        </div>
      )}
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

      <div className="max-w-6xl mx-auto py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Order Summary */}
            {processState === 1 && (
              <div className="bg-white shadow-sm p-4">
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
                  {checkoutItems.map((item) => {
                    const discountPercent = getDiscountPercentage(item.originalPrice, item.price);
                    const stockStatus = getStockStatus(item);
                    const variantText = getVariantDisplayText(item);

                    return (
                      <div
                        key={`${item.productId}-${item.variantId || "default"}`}
                        className="bg-white rounded-lg p-2 shadow-sm border border-gray-200"
                      >
                        {/* Product Info Row */}
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={getImageSrc(item)}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => handleImageError(e, item.image)}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                              {item.title}
                            </h3>

                            {variantText && (
                              <p className="text-xs text-gray-500 mt-1">
                                {variantText}
                              </p>
                            )}

                            {/* Price Row */}
                            <div className="flex items-center gap-2 mt-2">
                              {discountPercent > 0 && (
                                <span className="text-green-600 text-sm font-medium">
                                  ↓{discountPercent}%
                                </span>
                              )}
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-gray-400 text-sm line-through">
                                  ₹{item.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className="font-semibold text-gray-900">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-1 mt-3">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center bg-[#3B82F6] text-white rounded font-medium text-lg disabled:bg-gray-300"
                            disabled={orderLoading || item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium text-sm">
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
                            className="w-7 h-7 flex items-center justify-center bg-[#3B82F6] text-white rounded font-medium text-lg disabled:bg-gray-300"
                            disabled={orderLoading || item.quantity >= 1000}
                          >
                            +
                          </button>
                        </div>

                        {/* Delivery Info and Stock Status */}
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <span className="text-gray-600">
                            Delivery in 1 Day
                          </span>
                          {stockStatus && (
                            <span className={`font-medium ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Sticky Footer for Step 1 - Review Order */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                  <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <button
                      onClick={() => navigate("/")}
                      className="text-gray-600 font-medium flex items-center gap-2 hover:text-gray-900 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back
                    </button>

                    <button
                      onClick={() => setProcessState(2)}
                      disabled={!canProceedToNext()}
                      className="bg-[#3B82F6] hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {processState === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Delivery Address
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                      Choose where you want your order to be delivered.
                    </p>
                  </div>
                  {isMobileApp && (
                    <button
                      onClick={() => {
                        if (isAuthenticated()) {
                          if (isWebViewMode()) {
                            setShowAddressForm(true);
                          } else {
                            setShowMobileMapPicker(true);
                          }
                        } else {
                          setModalOpen(true);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                    >
                      + Add New
                    </button>
                  )}
                  {/* Desktop Add Address Bar */}
                  {!isMobileApp && !showAddressForm && (
                    <button
                      onClick={() => {
                        if (isAuthenticated()) {
                          setShowAddressForm(true);
                        } else {
                          setModalOpen(true);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                    >
                      + Add Address
                    </button>
                  )}
                </div>

                <div className="p-5">

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
                      </div>
                    )
                  )}

                  {/* Sticky Footer for Step 2 */}
                  {!showAddressForm && addresses.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                      <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <button
                          onClick={() =>
                            processState === 2
                              ? isBuyNow ? setProcessState(1) : navigate("/cart")
                              : setProcessState(processState - 1)
                          }
                          className="text-gray-600 font-medium flex items-center gap-2 hover:text-gray-900 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Back
                        </button>

                        <button
                          onClick={() => handleDeliverHere(selectedAddressId)}
                          disabled={!selectedAddressId}
                          className="bg-[#3B82F6] hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Student Name for Order (Appears after an address is selected or while editing) */}
                  {!showAddressForm && addresses.length > 0 && selectedAddressId && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Who is this order for?
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Please provide the student's name for this specific order. This helps us ensure the items are prepared correctly.
                          </p>
                        </div>
                        <div className="relative max-w-md">
                          <input
                            type="text"
                            value={studentNameForOrder}
                            onChange={(e) => {
                              setStudentNameForOrder(e.target.value);
                              if (studentNameError) setStudentNameError("");
                            }}
                            placeholder="Enter Student Name *"
                            className={`w-full px-4 py-3 bg-white border ${studentNameError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} rounded-lg outline-none transition-all placeholder-gray-400`}
                          />
                          {studentNameError && (
                            <div className="absolute -bottom-5 left-1 flex items-center gap-1 text-red-500 text-xs font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{studentNameError}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Order Summary Review */}
                <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Order Details
                  </h3>

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
              </div>
            )}

            {/* Step 3: Payment & Place Order */}
            {processState === 3 && (
              <div className="space-y-6">
                {/* Order Summary Review */}
                {/* <div className="bg-white rounded-lg shadow-sm border p-6"> */}
                {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Order Review
                  </h3> */}

                {/* Selected Address */}
                {/* {selectedAddress && (
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
                  )} */}

                {/* Cart Items Summary */}
                {/* <div className="mb-6">
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
                  </div> */}
                {/* </div> */}


                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-base font-semibold text-gray-900">
                      Payment Options
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      All transactions are secure and encrypted.
                    </p>
                  </div>

                  <div className="p-5 space-y-4">
                    {[
                      {
                        value: "upi",
                        label: "UPI (Google Pay, PhonePe, Paytm)",
                        desc: "Pay seamlessly using your preferred UPI app.",
                      },
                      {
                        value: "card",
                        label: "Credit or Debit Card",
                        desc: "We accept Visa, Mastercard, RuPay, and more.",
                      },
                      ...(isCodAllowed
                        ? [
                          {
                            value: "cod",
                            label: "Cash on Delivery",
                            desc: "Pay when the order is delivered to you.",
                          },
                        ]
                        : []),
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`relative flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === method.value
                          ? "border-blue-600 bg-blue-50/30 shadow-sm ring-1 ring-blue-600"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <span className="font-medium text-gray-900 block">
                            {method.label}
                          </span>
                          <p className="text-sm text-gray-500 mt-0.5">
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

                {/* Terms and Conditions Note */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <p className="text-sm text-gray-600">
                    By placing your order, you agree to our{" "}
                    <a
                      href="/terms-of-use"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </a>.
                  </p>
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

                {/* Sticky Footer for Step 3 - Matching Cart Page Style */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                  <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {/* Price Info */}
                    <div className="flex flex-col">
                      {totalMRP > (checkoutSummary.totalAmount || 0) && (
                        <span className="text-gray-400 text-sm line-through">
                          ₹{totalMRP.toLocaleString('en-IN')}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        {/* <span className="text-gray-600 text-sm font-medium">Total:</span> */}
                        <span className="font-bold text-xl text-gray-900">
                          ₹{(checkoutSummary.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                        {/* Optional: Add chevron for details if not already visible/expanded elsewhere? 
                            For now keeping it simple as per request image style 
                        */}
                      </div>
                      <button
                        onClick={() => setProcessState(2)}
                        className="text-blue-600 text-xs font-medium hover:underline text-left mt-0.5"
                      >
                        Change Address
                      </button>
                    </div>

                    {/* Place Order Button */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder || paymentProcessing}
                      className="bg-[#3B82F6] hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-bold text-base transition-colors shadow-sm flex items-center gap-2"
                    >
                      {placingOrder ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Placing...</span>
                        </>
                      ) : paymentProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        "Place order"
                      )}
                    </button>
                  </div>
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
          <div className="space-y-6 sticky">
            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6 top-4">
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

              {/* {processState === 3 && paymentMethod === "cod" && (
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
              )} */}

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
                  <span className="mr-3">📧</span>
                  <span >Email: bukizzstore@gmail.com</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-3">💬</span>
                  <span>Raise Query Post Order</span>
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
                  error.includes("address")
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
