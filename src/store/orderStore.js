import { create } from "zustand";
import useApiRoutesStore from "./apiRoutesStore";

const API_BASE_URL = useApiRoutesStore.getState().baseUrl;

const useOrderStore = create((set, get) => ({
  // State
  currentOrder: null,
  orderSummary: null,
  loading: false,
  error: null,
  placingOrder: false,
  orderPlaced: false,
  paymentProcessing: false,

  // Order placement flow state
  orderValidation: {
    cartValid: false,
    addressValid: false,
    stockValid: false,
    priceValid: false,
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setPlacingOrder: (placingOrder) => set({ placingOrder }),
  setPaymentProcessing: (paymentProcessing) => set({ paymentProcessing }),

  // Pre-order validation with comprehensive checks
  validateOrderPrerequisites: async (
    cartItems,
    selectedAddress,
    paymentMethod
  ) => {
    set({ loading: true, error: null });

    try {
      const validation = {
        cartValid: false,
        addressValid: false,
        stockValid: false,
        priceValid: false,
        errors: [],
      };

      // 1. Validate cart items
      if (!cartItems || cartItems.length === 0) {
        validation.errors.push(
          "Cart is empty. Please add items to place an order."
        );
      } else {
        validation.cartValid = true;
      }

      // 2. Validate delivery address
      if (!selectedAddress) {
        validation.errors.push("Please select a delivery address.");
      } else if (
        !selectedAddress.line1 ||
        !selectedAddress.city ||
        !selectedAddress.state ||
        !selectedAddress.postalCode
      ) {
        validation.errors.push(
          "Incomplete delivery address. Please provide complete address details."
        );
      } else {
        validation.addressValid = true;
      }

      // 3. Validate payment method
      if (!paymentMethod) {
        validation.errors.push("Please select a payment method.");
      }

      // 4. Validate stock availability for all items
      if (validation.cartValid) {
        const stockValidation = await get().validateStockAvailability(
          cartItems
        );
        validation.stockValid = stockValidation.allInStock;
        if (!stockValidation.allInStock) {
          validation.errors.push(...stockValidation.errors);
        }
      }

      // 5. Validate current pricing
      if (validation.cartValid) {
        const priceValidation = await get().validateCurrentPricing(cartItems);
        validation.priceValid = priceValidation.allValid;
        if (!priceValidation.allValid) {
          validation.errors.push(...priceValidation.errors);
        }
      }

      set({
        orderValidation: validation,
        loading: false,
      });

      return validation;
    } catch (error) {
      console.error("Error validating order prerequisites:", error);
      set({
        loading: false,
        error: error.message,
        orderValidation: {
          cartValid: false,
          addressValid: false,
          stockValid: false,
          priceValid: false,
          errors: [error.message],
        },
      });

      return {
        cartValid: false,
        addressValid: false,
        stockValid: false,
        priceValid: false,
        errors: [error.message],
      };
    }
  },

  // Validate stock availability for all cart items
  validateStockAvailability: async (cartItems) => {
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const stockChecks = await Promise.allSettled(
        cartItems.map(async (item) => {
          const queryParams = new URLSearchParams({
            quantity: item.quantity.toString(),
          });

          if (item.variantId) {
            queryParams.append("variantId", item.variantId);
          }

          const response = await fetch(
            `${API_BASE_URL}/products/${item.productId}/availability?${queryParams}`,
            {
              cache: 'default',
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to check availability for ${item.title}`);
          }

          const data = await response.json();
          console.log("Stock check response for", item.title, ":", data);

          // Handle the actual response structure from the API
          const availabilityData = data.data;

          return {
            item,
            available: availabilityData.available,
            stock:
              availabilityData.availableQuantity || availabilityData.stock || 0,
            requested: item.quantity,
          };
        })
      );

      const errors = [];
      let allInStock = true;

      stockChecks.forEach((result, index) => {
        if (result.status === "rejected") {
          errors.push(
            `Stock check failed for item ${index + 1}: ${result.reason}`
          );
          allInStock = false;
        } else if (!result.value.available) {
          const { item, stock, requested } = result.value;
          errors.push(
            `${item.title} - Only ${stock || 0
            } available, but ${requested} requested`
          );
          allInStock = false;
        }
      });

      return { allInStock, errors };
    } catch (error) {
      return {
        allInStock: false,
        errors: [`Stock validation failed: ${error.message}`],
      };
    }
  },

  // Validate current pricing for all cart items
  validateCurrentPricing: async (cartItems) => {
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const priceChecks = await Promise.allSettled(
        cartItems.map(async (item) => {
          let url = `${API_BASE_URL}/products/${item.productId}`;

          const response = await fetch(url, {
            cache: 'default',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch current price for ${item.title}`);
          }

          const data = await response.json();
          const product = data.data.product;

          let currentPrice = product.basePrice;

          // Get variant price if applicable
          if (item.variantId && product.variants) {
            const variant = product.variants.find(
              (v) => v.id === item.variantId
            );
            if (variant) {
              currentPrice = variant.price || product.basePrice;
            }
          }

          return {
            item,
            currentPrice: parseFloat(currentPrice),
            cartPrice: parseFloat(item.price),
            priceChanged:
              Math.abs(parseFloat(currentPrice) - parseFloat(item.price)) >
              0.01,
          };
        })
      );

      const errors = [];
      let allValid = true;

      priceChecks.forEach((result, index) => {
        if (result.status === "rejected") {
          errors.push(
            `Price check failed for item ${index + 1}: ${result.reason}`
          );
          allValid = false;
        } else if (result.value.priceChanged) {
          const { item, currentPrice, cartPrice } = result.value;
          errors.push(
            `${item.title} - Price changed from ₹${cartPrice} to ₹${currentPrice}. Please refresh your cart.`
          );
          allValid = false;
        }
      });

      return { allValid, errors };
    } catch (error) {
      return {
        allValid: false,
        errors: [`Price validation failed: ${error.message}`],
      };
    }
  },

  // Calculate final order summary before placement
  calculateFinalOrderSummary: async (cartItems) => {
    try {
      // Use client-side calculation directly - no API calls
      const summary = get().calculateOrderSummaryFallback(cartItems);
      set({ orderSummary: summary });
      return summary;
    } catch (error) {
      console.error("Error calculating order summary:", error);

      // Use fallback calculation as last resort
      try {
        const summary = get().calculateOrderSummaryFallback(cartItems);
        set({ orderSummary: summary });
        return summary;
      } catch (fallbackError) {
        console.error("Fallback calculation also failed:", fallbackError);
        throw new Error("Failed to calculate order summary");
      }
    }
  },

  // Client-side fallback calculation
  calculateOrderSummaryFallback: (cartItems) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return {
        subtotal: 0,
        deliveryFee: 0,
        platformFee: 0,
        tax: 0,
        total: 0,
        savings: 0,
        currency: "INR",
      };
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    // Calculate delivery fee (free delivery for orders above ₹500)
    const deliveryFee = subtotal >= 500 ? 0 : 50;

    // Platform fee (₹10 if there are items)
    const platformFee = subtotal > 0 ? 10 : 0;

    // Calculate tax (18% GST, but simplified calculation)
    const taxRate = 0.18;
    const tax = subtotal * taxRate;

    // Calculate savings (Discount = MRP - Subtotal)
    // Here we approximate MRP as Subtotal * 1.25 (20% discount reversed) if originalPrice is not available
    // But ideally, savings should be calculated based on item-level originalPrice if available
    // For now, keeping the fallback simple as per previous logic, but ensure it's presented correctly
    const discountRate = 0.2;
    const savings = Math.min(subtotal * discountRate, 500);

    const total = subtotal + deliveryFee + platformFee + tax - savings;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(Math.max(0, total).toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      currency: "INR",
    };
  },

  // Place order with comprehensive atomicity and error handling
  placeOrder: async (orderData) => {
    const {
      cartItems,
      selectedAddress,
      paymentMethod = "cod",
      contactPhone,
      contactEmail,
    } = orderData;

    set({
      placingOrder: true,
      error: null,
      orderPlaced: false,
    });

    try {
      // Step 1: Final pre-order validation
      console.log("🔍 Step 1: Validating order prerequisites...");
      const validation = await get().validateOrderPrerequisites(
        cartItems,
        selectedAddress,
        paymentMethod
      );

      if (
        !validation.cartValid ||
        !validation.addressValid ||
        !validation.stockValid ||
        !validation.priceValid
      ) {
        throw new Error(
          `Order validation failed: ${validation.errors.join(", ")}`
        );
      }

      // Step 2: Calculate final order summary
      console.log("💰 Step 2: Calculating final order summary...");
      const orderSummary = await get().calculateFinalOrderSummary(cartItems);

      // Step 3: Prepare order payload with all required data
      console.log("📋 Step 3: Preparing order data...");
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          // Include snapshot data for order record
          productSnapshot: {
            title: item.title,
            sku: item.sku,
            description: item.description || "",
            image: item.image || "",
            category: item.category || "",
            brand: item.brand || "",
          },
        })),
        shippingAddress: {
          recipientName: selectedAddress.recipientName || "",
          studentName: selectedAddress.studentName || "",
          phone: selectedAddress.phone || contactPhone || "",
          line1: selectedAddress.line1,
          line2: selectedAddress.line2 || "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country || "India",
          postalCode: selectedAddress.postalCode,
          // Include precise location data if available
          ...(selectedAddress.lat &&
            selectedAddress.lng && {
            coordinates: {
              lat: parseFloat(selectedAddress.lat),
              lng: parseFloat(selectedAddress.lng),
            },
          }),
          // Include additional delivery metadata
          ...(selectedAddress.landmark && {
            landmark: selectedAddress.landmark,
          }),
          ...(selectedAddress.neighborhood && {
            neighborhood: selectedAddress.neighborhood,
          }),
          ...(selectedAddress.district && {
            district: selectedAddress.district,
          }),
        },
        billingAddress: {
          ...selectedAddress,
          studentName: selectedAddress.studentName || "",
        },
        contactPhone: contactPhone || selectedAddress.phone || "",
        contactEmail: contactEmail || "",
        paymentMethod,
        orderSummary: {
          subtotal: orderSummary.subtotal,
          deliveryFee: orderSummary.deliveryFee,
          platformFee: orderSummary.platformFee,
          tax: orderSummary.tax,
          total: orderSummary.total,
          currency: orderSummary.currency || "INR",
          savings: orderSummary.savings || 0,
        },
        metadata: {
          source: "web",
          userAgent: navigator.userAgent,
          orderPlacedAt: new Date().toISOString(),
          cartSessionId: localStorage.getItem("cart_session_id") || "",
          deviceInfo: {
            // eslint-disable-next-line no-restricted-globals
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      };

      // Step 4: Submit order with atomic transaction
      console.log("🚀 Step 4: Submitting order...");
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        cache: 'default',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific error scenarios
        if (response.status === 400) {
          throw new Error(
            errorData.message ||
            "Invalid order data. Please check your cart and try again."
          );
        } else if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        } else if (response.status === 409) {
          throw new Error(
            "Some items are out of stock. Please refresh your cart and try again."
          );
        } else if (response.status === 422) {
          throw new Error(
            "Order validation failed. Please check all required fields."
          );
        } else {
          throw new Error(
            errorData.message || "Failed to place order. Please try again."
          );
        }
      }

      const data = await response.json();
      const order = data.data.order;

      console.log("✅ Order placed successfully:", order.id);

      // Step 5: Handle payment processing if required
      if (paymentMethod !== "cod") {
        console.log("💳 Step 5: Processing payment...");
        set({ paymentProcessing: true });

        try {
          await get().processPayment(order, paymentMethod);
        } catch (paymentError) {
          console.warn(
            "Payment processing failed, but order was created:",
            paymentError.message
          );
          // Order is created but payment failed - this is handled gracefully
        } finally {
          set({ paymentProcessing: false });
        }
      }

      // Step 6: Clear cart and update state
      console.log("🧹 Step 6: Cleaning up...");
      set({
        currentOrder: order,
        orderPlaced: true,
        placingOrder: false,
        error: null,
      });

      // Clear cart from localStorage and other stores if needed
      localStorage.removeItem("cart_items");
      localStorage.removeItem("cart_session_id");

      return order;
    } catch (error) {
      console.error("❌ Order placement failed:", error);

      set({
        placingOrder: false,
        paymentProcessing: false,
        error: error.message,
      });

      throw error;
    }
  },

  // Initiate Razorpay payment
  initiateRazorpayPayment: async (orderId) => {
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        useApiRoutesStore.getState().payments.createOrder,
        {
          method: "POST",
          cache: 'default',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      return data.data;
    } catch (error) {
      console.error("Razorpay initiation failed:", error);
      throw error;
    }
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentData) => {
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        useApiRoutesStore.getState().payments.verify,
        {
          method: "POST",
          cache: 'default',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      return data;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw error;
    }
  },

  // Report payment failure to backend
  reportPaymentFailure: async (failureData) => {
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) return; // Can't report if not logged in

      const url = useApiRoutesStore.getState().payments.failure;

      await fetch(url, {
        method: "POST",
        cache: 'default',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(failureData),
      });
    } catch (error) {
      console.error("Failed to report payment failure:", error);
      // Non-blocking, just log
    }
  },

  // Reconcile payment status (Layer 3 auto-recovery)
  reconcilePaymentStatus: async (orderId) => {
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) return null;

      const url = useApiRoutesStore.getState().payments.reconcile;

      const response = await fetch(url, {
        method: "POST",
        cache: 'default',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Reconciliation failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to reconcile payment status:", error);
      return null;
    }
  },

  // Process payment (Updated to handle different methods)
  processPayment: async (order, paymentMethod) => {
    // For online payments, this is handled by the component via initiateRazorpayPayment
    // helping to keep the store focused on data and API interactions
    if (paymentMethod === "cod") {
      return { status: "pending", method: "cod" };
    }

    // For other methods, we expect the flow to be handled externally
    // or this function to be extended
    return { status: "pending", method: paymentMethod };
  },

  // Get order details after placement
  getOrderDetails: async (orderId) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}`,
        {
          cache: 'default',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order details");
      }

      const data = await response.json();
      const order = data.data.order;

      set({
        currentOrder: order,
        loading: false,
      });

      return order;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Reset order state (for new order flow)
  resetOrderState: () => {
    set({
      currentOrder: null,
      orderSummary: null,
      loading: false,
      error: null,
      placingOrder: false,
      orderPlaced: false,
      paymentProcessing: false,
      orderValidation: {
        cartValid: false,
        addressValid: false,
        stockValid: false,
        priceValid: false,
      },
    });
  },

  // Retry order placement with same data
  retryOrderPlacement: async () => {
    const { currentOrder } = get();
    if (currentOrder && currentOrder.retryData) {
      return await get().placeOrder(currentOrder.retryData);
    } else {
      throw new Error("No retry data available");
    }
  },

  // Check order status and sync with server
  syncOrderStatus: async (orderId) => {
    try {
      const order = await get().getOrderDetails(orderId);

      // Update local state based on server status
      if (order.status === "cancelled") {
        set({ error: "This order has been cancelled" });
      }

      return order;
    } catch (error) {
      console.error("Failed to sync order status:", error);
      throw error;
    }
  },

  // Clear all order data
  clear: () => {
    set({
      currentOrder: null,
      orderSummary: null,
      loading: false,
      error: null,
      placingOrder: false,
      orderPlaced: false,
      paymentProcessing: false,
      orderValidation: {
        cartValid: false,
        addressValid: false,
        stockValid: false,
        priceValid: false,
      },
    });
  },
}));

export default useOrderStore;
