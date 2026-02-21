import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../../components/Common/SearchBar";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import { handleBackNavigation } from "../../utils/navigation";

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setModalOpen } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    validateCartItems,
    loading,
    loadCart,
    getCheckoutSummary,
    setBuyNowItem,
    clearBuyNowItem,
    initiateBuyNowFlow,
    initiateCartFlow,
    restoreCart,
    isBuyNowMode,
  } = useCartStore();

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  const [validationResults, setValidationResults] = useState(null);
  const [expandedFees, setExpandedFees] = useState(false);
  const [expandedDiscounts, setExpandedDiscounts] = useState(false);
  const failedImagesRef = useRef(new Set());

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check for mode mismatch
    // If store is in BuyNowMode but URL doesn't have ?mode=buy_now,
    // it means user navigated away or "back" to standard cart.
    // We should restore the original cart.
    // Intentionally omitting isBuyNowMode from dependencies so it doesn't fire
    // immediately when the user clicks 'Buy Now' before the page unmounts!
    if (isBuyNowMode && mode !== 'buy_now') {
      console.log("Restoring original cart due to mode mismatch");
      restoreCart();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, restoreCart]);

  useEffect(() => {
    if (cart?.items?.length > 0) {
      validateCartItems().then(setValidationResults);
    } else {
      setValidationResults(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

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
    } catch (error) {
      showNotification({
        message: "Failed to update cart. Please try again.",
        type: "error"
      });
    }
  };

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

  const handleImageError = useCallback((e, imageSrc) => {
    if (!imageSrc) return;
    if (failedImagesRef.current.has(imageSrc)) {
      e.target.src = "/no-product-image.svg";
      return;
    }
    failedImagesRef.current.add(imageSrc);
    e.target.src = "/no-product-image.svg";
  }, []);

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

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }
    if (validationResults && !validationResults.isValid) {
      showNotification({
        message: "Please fix cart issues before proceeding to checkout.",
        type: "error"
      });
      return;
    }
    // Explicitly initiate cart flow
    if (mode === 'buy_now') {
      navigate("/checkout", { state: { mode: 'buy_now' } });
    } else {
      initiateCartFlow();
      navigate("/checkout", { state: { mode: 'cart' } });
    }
  };

  const handleBuyNow = (item) => {
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }

    try {
      // Create product and variant objects from cart item for setBuyNowItem
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
      navigate("/checkout", { state: { mode: 'buy_now' } });
    } catch (error) {
      console.error("Error with Buy Now:", error);
      showNotification({
        message: "Failed to proceed with Buy Now. Please try again.",
        type: "error"
      });
    }
  };

  // Helper function to get delivery date (estimating 3-5 days from now)
  const getDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 4));
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return deliveryDate.toLocaleDateString('en-IN', options);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, price) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Get stock status
  const getStockStatus = (item) => {
    const stock = item.variantDetails?.stock || item.stock;
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600" };
    if (stock && stock <= 5) return { text: `Only ${stock} left`, color: "text-orange-500" };
    return null;
  };

  // Use cart totals directly instead of getCheckoutSummary to avoid Buy Now mode conflicts
  const summary = cart;

  // Calculate MRP (total original prices)
  const totalMRP = cart?.items?.reduce((sum, item) => {
    const originalPrice = item.originalPrice || item.price;
    return sum + (originalPrice * item.quantity);
  }, 0) || 0;

  // Calculate total savings (Discount = MRP - Subtotal)
  const totalSavings = totalMRP - (summary.subtotal || 0);
  const fees = (summary.platformFees || 0) + (summary.deliveryCharges || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SearchBar />
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 flex px-4">
        <button onClick={() => handleBackNavigation(navigate)} className="mr-3 md:hidden">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="max-w-2xl py-4">
          <h1 className="text-xl font-semibold text-gray-900">My Cart</h1>
        </div>
      </div>

      {/* Empty Cart State */}
      {!cart?.items || cart.items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
          <div className="mb-6">
            <img
              src="/cart.svg"
              alt="Empty Cart"
              className="w-48 h-48 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#0051A3] mb-8 text-center">
            You Study, We Deliver
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-full border-2 border-[#0051A3] text-[#0051A3] font-semibold text-lg hover:bg-blue-50 transition-colors duration-300"
          >
            Keep Exploring
          </button>
        </div>
      ) : (
        <div className="flex-1 max-w-2xl mx-auto w-full">
          {/* Cart Items */}
          <div className="space-y-3 p-4">
            {cart.items.map((item) => {
              const discountPercent = getDiscountPercentage(item.originalPrice, item.price);
              const stockStatus = getStockStatus(item);
              const variantText = getVariantDisplayText(item);

              return (
                <div
                  key={item.id || `${item.productId}-${item.variantId}`}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  {/* Product Info Row */}
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={getImageSrc(item)}
                        alt={item.title || "Product"}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        onError={(e) => handleImageError(e, item.image)}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                        {item.title || "Product Title"}
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
                      className="w-7 h-7 flex items-center justify-center bg-[#3B82F6] text-white rounded font-medium text-lg"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-sm">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          item.variantId,
                          item.quantity + 1
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center bg-[#3B82F6] text-white rounded font-medium text-lg"
                    >
                      +
                    </button>
                  </div>

                  {/* Delivery Info and Stock Status */}
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-gray-600">
                      Delivery by {getDeliveryDate()}
                    </span>
                    {stockStatus && (
                      <span className={`font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleRemoveItem(item.productId, item.variantId)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                    <button
                      onClick={() => handleBuyNow(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Buy Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Summary Section */}
          <div className="bg-white mx-4 rounded-lg shadow-sm p-4 mt-4">
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
                  <span>₹{(summary.platformFees || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>{summary.deliveryCharges === 0 ? 'FREE' : `₹${summary.deliveryCharges}`}</span>
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
                ₹{(summary.totalAmount || 0).toLocaleString('en-IN')}
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
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-3 mx-4 py-6 text-gray-600 text-sm">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>
              Safe and secure payments. Easy returns.
              <br />
              100% Authentic products.
            </span>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      {cart?.items?.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {/* Price Info */}
            <div className="flex flex-col">
              {totalMRP > summary.totalAmount && (
                <span className="text-gray-400 text-sm line-through">
                  {totalMRP.toLocaleString('en-IN')}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900">
                  ₹{(summary.totalAmount || 0).toLocaleString('en-IN')}
                </span>
                <button className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={validationResults && !validationResults.isValid}
              className={`px-8 py-3 rounded-lg font-semibold text-base transition-colors ${validationResults && !validationResults.isValid
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#3B82F6] hover:bg-[#2563eb] text-white"
                }`}
            >
              Place order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
