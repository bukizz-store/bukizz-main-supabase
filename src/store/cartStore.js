import { create } from "zustand";

const useCartStore = create((set, get) => ({
  // Cart state
  cart: {
    items: [],
    totalItems: 0,
    subtotal: 0,
    discount: 0,
    deliveryCharges: 0,
    platformFees: 10,
    totalAmount: 0,
  },
  loading: false,
  error: null,

  // Buy Now state (for direct checkout bypassing cart)
  buyNowItem: null,
  isBuyNowMode: false,
  savedCart: null, // Store original cart during buy now flow

  // Add item to cart
  addToCart: async (product, variant, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      // Self-hydrate: if Zustand cart is empty but localStorage has data,
      // load it first. This handles webview page reloads where Navbar
      // (which normally calls loadCart on mount) is hidden in mobile app mode.
      if (get().cart.items.length === 0) {
        get().loadCart();
      }

      // If we are in Buy Now mode, restore the original cart first
      // This handles the case where user abandoned Buy Now and is now adding items normally
      if (get().isBuyNowMode) {
        get().restoreCart();
      } else {
        // Guard: detect orphaned saved cart after webview page reload
        // isBuyNowMode is false (reset on reload), but bukizz_saved_cart still exists
        const orphanedSavedCart = localStorage.getItem("bukizz_saved_cart");
        if (orphanedSavedCart) {
          console.log("[CartStore] Detected orphaned saved cart during addToCart. Restoring...");
          get().restoreCart();
        }
      }

      const { cart } = get();
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId === product.id && item.variantId === variant?.id
      );

      let updatedItems = [...cart.items];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Get proper image URL with fallback chain
        const getProductImage = () => {
          // Try main product images first
          if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find(
              (img) => img.isPrimary || img.is_primary
            );
            if (primaryImage) return primaryImage.url;
            return product.images[0].url;
          }

          // Try variant-specific image
          if (variant?.image) return variant.image;

          // Try product main image field
          if (product.mainImage) return product.mainImage;

          // Try other image fields
          if (product.image) return product.image;

          // Default placeholder
          return "/api/placeholder/300/300";
        };

        // Build complete variant details for order processing
        const variantDetails = variant
          ? {
            id: variant.id,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice:
              variant.compare_at_price || variant.compareAtPrice,
            stock: variant.stock,
            weight: variant.weight,
            metadata: variant.metadata,
            image: variant.image,
            // Include complete option details for order processing
            optionValues: {
              option1: variant.option_value_1_ref
                ? {
                  id: variant.option_value_1_ref.id,
                  value: variant.option_value_1_ref.value,
                  attributeName:
                    variant.option_value_1_ref.attribute_name || "Set Type",
                  priceModifier:
                    variant.option_value_1_ref.price_modifier || 0,
                }
                : null,
              option2: variant.option_value_2_ref
                ? {
                  id: variant.option_value_2_ref.id,
                  value: variant.option_value_2_ref.value,
                  attributeName:
                    variant.option_value_2_ref.attribute_name || "Branch",
                  priceModifier:
                    variant.option_value_2_ref.price_modifier || 0,
                }
                : null,
              option3: variant.option_value_3_ref
                ? {
                  id: variant.option_value_3_ref.id,
                  value: variant.option_value_3_ref.value,
                  attributeName:
                    variant.option_value_3_ref.attribute_name ||
                    "Optional Subject",
                  priceModifier:
                    variant.option_value_3_ref.price_modifier || 0,
                }
                : null,
            },
            // Store raw option value IDs for backend processing
            optionValueIds: {
              option_value_1: variant.option_value_1_ref?.id || null,
              option_value_2: variant.option_value_2_ref?.id || null,
              option_value_3: variant.option_value_3_ref?.id || null,
            },
            // Human readable variant description
            variantDescription: [
              variant.option_value_1_ref?.value,
              variant.option_value_2_ref?.value,
              variant.option_value_3_ref?.value,
            ]
              .filter(Boolean)
              .join(" • "),
          }
          : null;

        // Calculate proper price with variant modifiers
        const calculateItemPrice = () => {
          let basePrice =
            variant?.price || product.basePrice || product.base_price || 0;

          // Add variant option price modifiers
          if (variant && variantDetails?.optionValues) {
            Object.values(variantDetails.optionValues).forEach((option) => {
              if (option?.priceModifier) {
                basePrice += option.priceModifier;
              }
            });
          }

          return Math.max(0, basePrice); // Ensure price is not negative
        };

        // Add new item with complete details
        const itemPrice = calculateItemPrice();
        const newItem = {
          id: `${product.id}-${variant?.id || "default"}`,
          productId: product.id,
          variantId: variant?.id || null,
          title: product.title || "Product Title",
          sku: variant?.sku || product.sku || "",
          price: itemPrice,
          originalPrice:
            variant?.compare_at_price ||
            variant?.compareAtPrice ||
            itemPrice * 1.2,
          image: getProductImage(),
          quantity,
          // Store complete product details for order processing
          productDetails: {
            id: product.id,
            title: product.title,
            sku: product.sku,
            productType: product.productType || product.product_type,
            basePrice: product.basePrice || product.base_price,
            currency: product.currency || "INR",
            retailerId: product.retailerId || product.retailer_id,
            retailerName: product.retailerName || product.retailer_name,
            metadata: product.metadata || {},
            shortDescription:
              product.shortDescription || product.short_description,
            description: product.description,
            images: product.images || [],
          },
          // Store complete variant details
          variantDetails: variantDetails,
          productType: product.productType || product.product_type || "product",
          // Delivery charge from product - try new column first, fallback to metadata for backward compatibility
          deliveryCharge: product.deliveryCharge || product.delivery_charge || product.metadata?.deliveryCharge || 0,
        };
        updatedItems.push(newItem);
      }

      // Calculate totals
      const totals = calculateCartTotals(updatedItems);

      const updatedCart = {
        items: updatedItems,
        ...totals,
      };

      set({
        cart: updatedCart,
        loading: false,
        error: null,
      });

      // Save to localStorage
      localStorage.setItem("bukizz_cart", JSON.stringify(updatedCart));

      return updatedCart;
    } catch (error) {
      console.error("Error adding to cart:", error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: (productId, variantId = null) => {
    try {
      const { cart } = get();
      const updatedItems = cart.items.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      );

      const totals = calculateCartTotals(updatedItems);
      const updatedCart = {
        items: updatedItems,
        ...totals,
      };

      set({ cart: updatedCart, error: null });
      localStorage.setItem("bukizz_cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error removing from cart:", error);
      set({ error: error.message });
    }
  },

  // Update item quantity
  updateQuantity: (productId, variantId = null, quantity) => {
    try {
      if (quantity <= 0) {
        get().removeFromCart(productId, variantId);
        return;
      }

      const { cart } = get();
      const updatedItems = cart.items.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: Math.max(1, Math.min(1000, quantity)) } // Ensure quantity is between 1-1000
          : item
      );

      const totals = calculateCartTotals(updatedItems);
      const updatedCart = {
        items: updatedItems,
        ...totals,
      };

      set({ cart: updatedCart, error: null });
      localStorage.setItem("bukizz_cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error updating quantity:", error);
      set({ error: error.message });
    }
  },

  // Clear cart
  clearCart: () => {
    try {
      const emptyCart = {
        items: [],
        totalItems: 0,
        subtotal: 0,
        discount: 0,
        deliveryCharges: 0,
        platformFees: 0,
        totalAmount: 0,
      };

      set({ cart: emptyCart, error: null });
      localStorage.removeItem("bukizz_cart");

      // Safety: do NOT remove bukizz_saved_cart here —
      // it's the backup of the real cart during buy-now flow.
      // restoreCart is responsible for cleaning it up.
    } catch (error) {
      console.error("Error clearing cart:", error);
      set({ error: error.message });
    }
  },

  // Load cart from localStorage
  // This reconstructs the full Zustand state from localStorage, including
  // buy-now mode if it was active. It does NOT auto-restore the saved cart —
  // that decision is made by consumers (CartPage mode-mismatch effect, addToCart guard).
  loadCart: () => {
    try {
      const wasBuyNowMode = localStorage.getItem("bukizz_buy_now_mode") === "true";
      const storedSavedCart = localStorage.getItem("bukizz_saved_cart");

      // Load the active cart (could be normal cart or buy-now temp cart)
      const savedCartData = localStorage.getItem("bukizz_cart");
      if (savedCartData) {
        const cart = JSON.parse(savedCartData);
        if (cart && Array.isArray(cart.items)) {
          const totals = calculateCartTotals(cart.items);
          const validatedCart = { ...cart, ...totals };

          if (wasBuyNowMode) {
            // Reconstruct buy-now state: restore isBuyNowMode flag and savedCart backup
            // so CartPage mode-mismatch effect and other guards work correctly
            let parsedSavedCart = null;
            if (storedSavedCart) {
              try { parsedSavedCart = JSON.parse(storedSavedCart); } catch (e) { /* ignore */ }
            }

            // Reconstruct buyNowItem from the single item in the temp cart
            const reconstructedBuyNowItem = validatedCart.items.length === 1 ? validatedCart.items[0] : null;

            set({
              cart: validatedCart,
              isBuyNowMode: true,
              buyNowItem: reconstructedBuyNowItem,
              savedCart: parsedSavedCart,
              error: null,
            });
          } else {
            set({ cart: validatedCart, error: null });
          }
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      set({ error: "Failed to load saved cart" });
      // Clear corrupted cart data
      localStorage.removeItem("bukizz_cart");
      localStorage.removeItem("bukizz_buy_now_mode");
      localStorage.removeItem("bukizz_saved_cart");
    }
  },

  // Get cart item count
  getCartItemCount: () => {
    const { cart } = get();
    return cart.totalItems || 0;
  },

  // Check if item is in cart
  isInCart: (productId, variantId = null) => {
    // Self-hydrate: ensure cart is loaded so badge shows correctly after webview reload
    if (get().cart.items.length === 0 && localStorage.getItem("bukizz_cart")) {
      get().loadCart();
    }
    const { cart } = get();
    return cart.items.some(
      (item) => item.productId === productId && item.variantId === variantId
    );
  },

  // Get cart items formatted for order processing
  getOrderItems: () => {
    const { cart } = get();
    return cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      sku: item.sku,
      title: item.title,
      // Include variant details for order items
      variantDetails: item.variantDetails,
      productDetails: item.productDetails,
      // Snapshot of product/variant data at time of adding to cart
      productSnapshot: {
        title: item.title,
        sku: item.sku,
        price: item.price,
        variantDescription: item.variantDetails?.variantDescription,
        optionValues: item.variantDetails?.optionValues,
      },
    }));
  },

  // Get cart summary for checkout
  getCartSummary: () => {
    const { cart } = get();
    return {
      itemCount: cart.totalItems || 0,
      subtotal: cart.subtotal || 0,
      discount: cart.discount || 0,
      deliveryCharges: cart.deliveryCharges || 0,
      platformFees: cart.platformFees || 0,
      totalAmount: cart.totalAmount || 0,
      items: get().getOrderItems(),
    };
  },

  // Validate cart items (check stock, prices, etc.)
  validateCartItems: async () => {
    const { cart } = get();
    const validationResults = [];

    if (!cart?.items || cart.items.length === 0) {
      return {
        isValid: true,
        results: [],
        totalIssues: 0,
      };
    }

    for (const item of cart.items) {
      // Basic validation
      const validation = {
        itemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        isValid: true,
        issues: [],
        currentStock: item.variantDetails?.stock || 0,
        requestedQuantity: item.quantity || 0,
      };

      // Check if item has required data
      if (!item.title || !item.price) {
        validation.isValid = false;
        validation.issues.push({
          type: "INVALID_DATA",
          message: "Item is missing required data (title or price)",
        });
      }

      // Check if price is valid
      if (item.price <= 0) {
        validation.isValid = false;
        validation.issues.push({
          type: "INVALID_PRICE",
          message: "Item has invalid price",
        });
      }

      // Check if requested quantity exceeds available stock
      if (
        item.variantDetails?.stock !== undefined &&
        item.quantity > item.variantDetails.stock
      ) {
        validation.isValid = false;
        validation.issues.push({
          type: "INSUFFICIENT_STOCK",
          message: `Only ${item.variantDetails.stock} units available, but ${item.quantity} requested`,
          availableStock: item.variantDetails.stock,
        });
      }

      // Check if variant still exists (basic check)
      if (item.variantId && !item.variantDetails) {
        validation.isValid = false;
        validation.issues.push({
          type: "VARIANT_NOT_FOUND",
          message: "Selected variant is no longer available",
        });
      }

      // Check quantity limits
      if (item.quantity > 1000) {
        validation.isValid = false;
        validation.issues.push({
          type: "QUANTITY_LIMIT",
          message: "Quantity exceeds maximum limit of 1000",
        });
      }

      validationResults.push(validation);
    }

    return {
      isValid: validationResults.every((result) => result.isValid),
      results: validationResults,
      totalIssues: validationResults.reduce(
        (sum, result) => sum + result.issues.length,
        0
      ),
    };
  },

  // Set item for Buy Now (bypasses cart, goes directly to checkout)
  setBuyNowItem: (product, variant, quantity = 1) => {
    try {
      // Get proper image URL with fallback chain
      const getProductImage = () => {
        if (product.images && product.images.length > 0) {
          const primaryImage = product.images.find(
            (img) => img.isPrimary || img.is_primary
          );
          if (primaryImage) return primaryImage.url;
          return product.images[0].url;
        }
        if (variant?.image) return variant.image;
        if (product.mainImage) return product.mainImage;
        if (product.image) return product.image;
        return "/api/placeholder/300/300";
      };

      // Build complete variant details for order processing
      const variantDetails = variant
        ? {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compare_at_price || variant.compareAtPrice,
          stock: variant.stock,
          weight: variant.weight,
          metadata: variant.metadata,
          image: variant.image,
          optionValues: {
            option1: variant.option_value_1_ref
              ? {
                id: variant.option_value_1_ref.id,
                value: variant.option_value_1_ref.value,
                attributeName: variant.option_value_1_ref.attribute_name || "Set Type",
                priceModifier: variant.option_value_1_ref.price_modifier || 0,
              }
              : null,
            option2: variant.option_value_2_ref
              ? {
                id: variant.option_value_2_ref.id,
                value: variant.option_value_2_ref.value,
                attributeName: variant.option_value_2_ref.attribute_name || "Branch",
                priceModifier: variant.option_value_2_ref.price_modifier || 0,
              }
              : null,
            option3: variant.option_value_3_ref
              ? {
                id: variant.option_value_3_ref.id,
                value: variant.option_value_3_ref.value,
                attributeName: variant.option_value_3_ref.attribute_name || "Optional Subject",
                priceModifier: variant.option_value_3_ref.price_modifier || 0,
              }
              : null,
          },
          optionValueIds: {
            option_value_1: variant.option_value_1_ref?.id || null,
            option_value_2: variant.option_value_2_ref?.id || null,
            option_value_3: variant.option_value_3_ref?.id || null,
          },
          variantDescription: [
            variant.option_value_1_ref?.value,
            variant.option_value_2_ref?.value,
            variant.option_value_3_ref?.value,
          ]
            .filter(Boolean)
            .join(" • "),
        }
        : null;

      // Calculate proper price with variant modifiers
      let itemPrice = variant?.price || product.basePrice || product.base_price || 0;
      if (variant && variantDetails?.optionValues) {
        Object.values(variantDetails.optionValues).forEach((option) => {
          if (option?.priceModifier) {
            itemPrice += option.priceModifier;
          }
        });
      }
      itemPrice = Math.max(0, itemPrice);

      const buyNowItem = {
        id: `${product.id}-${variant?.id || "default"}`,
        productId: product.id,
        variantId: variant?.id || null,
        title: product.title || "Product Title",
        sku: variant?.sku || product.sku || "",
        price: itemPrice,
        originalPrice:
          variant?.compare_at_price ||
          variant?.compareAtPrice ||
          itemPrice * 1.2,
        image: getProductImage(),
        quantity,
        productDetails: {
          id: product.id,
          title: product.title,
          sku: product.sku,
          productType: product.productType || product.product_type,
          basePrice: product.basePrice || product.base_price,
          currency: product.currency || "INR",
          retailerId: product.retailerId || product.retailer_id,
          retailerName: product.retailerName || product.retailer_name,
          metadata: product.metadata || {},
          shortDescription: product.shortDescription || product.short_description,
          description: product.description,
          images: product.images || [],
        },
        variantDetails: variantDetails,
        productType: product.productType || product.product_type || "product",
        deliveryCharge: product.deliveryCharge || product.delivery_charge || product.metadata?.deliveryCharge || 0,
      };

      set({ buyNowItem, isBuyNowMode: true, error: null });
      return buyNowItem;
    } catch (error) {
      console.error("Error setting buy now item:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Clear Buy Now item (after successful checkout or cancellation)
  clearBuyNowItem: () => {
    set({ buyNowItem: null, isBuyNowMode: false });
    localStorage.removeItem("bukizz_buy_now_mode");
  },

  // Initiate Buy Now Flow - Swaps current cart with buy now item
  initiateBuyNowFlow: (product, variant, quantity = 1) => {
    try {
      // Self-hydrate: ensure cart is loaded from localStorage before backing up.
      // Without this, a webview page reload leaves Zustand cart empty,
      // and we'd back up an empty cart — losing the real one.
      if (get().cart.items.length === 0) {
        // Only hydrate if NOT already in buy-now mode (to avoid restoring during active flow)
        const wasBuyNow = localStorage.getItem("bukizz_buy_now_mode") === "true";
        if (!wasBuyNow) {
          get().loadCart();
        }
      }

      // 1. Backup current cart
      const currentCart = get().cart;

      // Only backup if we're not already in buy now mode (prevent overwriting backup)
      if (!get().isBuyNowMode) {
        set({ savedCart: currentCart });
        localStorage.setItem("bukizz_saved_cart", JSON.stringify(currentCart));
      }

      // Persist buy-now mode flag so it survives webview page reloads
      localStorage.setItem("bukizz_buy_now_mode", "true");

      // 2. Prepare Buy Now Item
      const buyNowItem = get().setBuyNowItem(product, variant, quantity);

      // 3. Create a temporary cart with just this item
      const buyNowCartItems = [{
        ...buyNowItem,
        // Ensure structure matches standard cart items
        variantDetails: buyNowItem.variantDetails,
        productDetails: buyNowItem.productDetails
      }];

      const totals = calculateCartTotals(buyNowCartItems);
      const tempCart = {
        items: buyNowCartItems,
        ...totals
      };

      // 4. Set State
      set({
        cart: tempCart,
        isBuyNowMode: true,
        error: null
      });

      // 5. Update localStorage to reflect this new state 
      // (so page reloads show the buy now item in cart)
      localStorage.setItem("bukizz_cart", JSON.stringify(tempCart));

      return { success: true };
    } catch (error) {
      console.error("Error initiating Buy Now flow:", error);
      return { success: false, error: error.message };
    }
  },

  // Restore Original Cart (Cancel Buy Now or after success)
  restoreCart: () => {
    try {
      // 1. Get saved cart
      let savedCart = get().savedCart;

      // Fallback to local storage if state is lost
      if (!savedCart) {
        const storedSavedCart = localStorage.getItem("bukizz_saved_cart");
        if (storedSavedCart) {
          savedCart = JSON.parse(storedSavedCart);
        }
      }

      // 2. Restore if exists, otherwise empty
      if (savedCart) {
        set({
          cart: savedCart,
          savedCart: null,
          isBuyNowMode: false,
          buyNowItem: null
        });
        localStorage.setItem("bukizz_cart", JSON.stringify(savedCart));
        localStorage.removeItem("bukizz_saved_cart");
        localStorage.removeItem("bukizz_buy_now_mode");
      } else {
        // If no backup, just clear buy now mode and empty cart
        // But we should try to reload from 'standard' storage if possible? 
        // No, 'bukizz_cart' was overwritten. If backup is missing, user loses cart.
        // Initialize empty to be safe.
        const emptyCart = {
          items: [],
          totalItems: 0,
          subtotal: 0,
          discount: 0,
          deliveryCharges: 0,
          platformFees: 0,
          totalAmount: 0,
        };
        set({
          cart: emptyCart,
          isBuyNowMode: false,
          buyNowItem: null
        });
        localStorage.removeItem("bukizz_cart");
        localStorage.removeItem("bukizz_buy_now_mode");
      }

      return { success: true };
    } catch (error) {
      console.error("Error restoring cart:", error);
      return { success: false, error: error.message };
    }
  },

  // Initiate Cart Flow — restores original cart and exits buy-now mode
  initiateCartFlow: () => {
    try {
      // If we were in buy now mode, properly restore the original cart
      // instead of just clearing flags (which would leave bukizz_saved_cart orphaned)
      if (get().isBuyNowMode || localStorage.getItem("bukizz_saved_cart")) {
        get().restoreCart();
      } else {
        // Just clear buy now flags
        set({ buyNowItem: null, isBuyNowMode: false });
        localStorage.removeItem("bukizz_buy_now_mode");
      }
      return { success: true };
    } catch (error) {
      console.error("Error initiating Cart flow:", error);
      return { success: false, error: error.message };
    }
  },

  // Get items for checkout (returns buyNowItem as array or cart items)
  getCheckoutItems: () => {
    const { buyNowItem, isBuyNowMode, cart } = get();
    // Prefer buyNowItem if in Buy Now mode, otherwise fallback to cart
    if (isBuyNowMode && buyNowItem) {
      return [buyNowItem];
    }
    return cart.items || [];
  },

  // Get checkout summary (works for both cart and buy now)
  getCheckoutSummary: () => {
    const { buyNowItem, isBuyNowMode, cart } = get();
    if (isBuyNowMode && buyNowItem) {
      const totals = calculateCartTotals([buyNowItem]);
      return {
        items: [buyNowItem],
        ...totals,
      };
    }
    return {
      items: cart.items || [],
      totalItems: cart.totalItems || 0,
      subtotal: cart.subtotal || 0,
      discount: cart.discount || 0,
      deliveryCharges: cart.deliveryCharges || 0,
      platformFees: cart.platformFees || 0,
      totalAmount: cart.totalAmount || 0,
    };
  },
  // Update Buy Now item quantity
  updateBuyNowItemQuantity: (quantity) => {
    try {
      if (quantity <= 0) {
        get().clearBuyNowItem();
        return;
      }

      const { buyNowItem } = get();
      if (!buyNowItem) return;

      const updatedItem = {
        ...buyNowItem,
        quantity: Math.max(1, Math.min(1000, quantity))
      };

      // Also update the temp cart in Zustand + localStorage so reloads stay consistent
      const buyNowCartItems = [updatedItem];
      const totals = calculateCartTotals(buyNowCartItems);
      const tempCart = { items: buyNowCartItems, ...totals };

      set({ buyNowItem: updatedItem, cart: tempCart, error: null });
      localStorage.setItem("bukizz_cart", JSON.stringify(tempCart));
    } catch (error) {
      console.error("Error updating buy now quantity:", error);
      set({ error: error.message });
    }
  },
}));

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      deliveryCharges: 0,
      platformFees: 0,
      totalAmount: 0,
    };
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // No default discount (coupon logic to be added later)
  const discount = 0;

  // Calculate delivery charges based on product types
  // Items with explicit delivery charges (bookset/uniform/stationary with deliveryCharge in metadata)
  const itemsWithDeliveryCharge = items.filter(item => item.deliveryCharge > 0);

  let deliveryCharges = 0;
  if (itemsWithDeliveryCharge.length > 0) {
    // Sum delivery charges from all items that have them (per item × quantity)
    deliveryCharges = itemsWithDeliveryCharge.reduce(
      (sum, item) => sum + ((item.deliveryCharge || 0) * (item.quantity || 1)),
      0
    );
    // Items without delivery charge get FREE delivery when items with charges are present
  } else {
    // Only general products: apply ₹50 if total < ₹399, else FREE
    deliveryCharges = subtotal < 399 ? 50 : 0;
  }

  // Platform fees only if there are items
  const platformFees = subtotal > 0 ? 10 : 0;

  const totalAmount = Math.max(
    0,
    subtotal - discount + deliveryCharges + platformFees
  );

  return {
    totalItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    deliveryCharges: parseFloat(deliveryCharges.toFixed(2)),
    platformFees: parseFloat(platformFees.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

export default useCartStore;
