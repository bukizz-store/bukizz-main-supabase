import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/Common/SearchBar";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    validateCartItems,
    loading,
    loadCart,
  } = useCartStore();

  const [validationResults, setValidationResults] = useState(null);
  const failedImagesRef = useRef(new Set());

  useEffect(() => {
    // Load cart from localStorage first
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    // Validate cart items when component loads or cart changes
    if (cart?.items?.length > 0) {
      validateCartItems().then(setValidationResults);
    } else {
      setValidationResults(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.items?.length]); // Only validate when items length changes, not entire items array

  const handleQuantityChange = (productId, variantId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId, variantId);
      return;
    }
    updateQuantity(productId, variantId, newQuantity);
  };

  const handleRemoveItem = (productId, variantId) => {
    removeFromCart(productId, variantId);
  };

  // Memoized image error handler to prevent infinite retry loops
  const handleImageError = useCallback((e, imageSrc) => {
    if (!imageSrc) return;
    
    // Check if image already failed
    if (failedImagesRef.current.has(imageSrc)) {
      e.target.src = "/api/placeholder/80/80";
      return;
    }
    
    // Mark as failed
    failedImagesRef.current.add(imageSrc);
    e.target.src = "/api/placeholder/80/80";
  }, []);

  // Get image source with fallback chain
  const getImageSrc = useCallback((item) => {
    // Try multiple image sources
    if (item.image && item.image !== "/placeholder.jpg") {
      return item.image;
    }

    if (item.productDetails?.images?.[0]?.url) {
      return item.productDetails.images[0].url;
    }

    if (item.variantDetails?.image) {
      return item.variantDetails.image;
    }

    return "/api/placeholder/80/80";
  }, []);

  const getVariantDisplayText = (item) => {
    if (!item.variantDetails) return null;

    // Try different ways to get variant description
    if (item.variantDetails.variantDescription) {
      return item.variantDetails.variantDescription;
    }

    if (item.variantDetails.optionValues) {
      const options = Object.values(item.variantDetails.optionValues)
        .filter((option) => option && option.value)
        .map((option) => option.value);
      return options.length > 0 ? options.join(" • ") : null;
    }

    return null;
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Validate cart before proceeding
    if (validationResults && !validationResults.isValid) {
      alert("Please fix cart issues before proceeding to checkout.");
      return;
    }

    navigate("/checkout");
  };

  const formatPrice = (price) => {
    return typeof price === "number" ? price.toFixed(2) : "0.00";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
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
    <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
      <SearchBar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          {cart?.items?.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {!cart?.items || cart.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V5a2 2 0 114 0v1H8zm2 6a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some products to get started!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Cart Items ({cart.totalItems || 0})
                  </h2>

                  {/* Validation Results */}
                  {validationResults && !validationResults.isValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h3 className="font-medium text-yellow-800 mb-2">
                        ⚠️ Cart Issues Found:
                      </h3>
                      {validationResults.results.map((result, idx) =>
                        result.issues.map((issue, issueIdx) => (
                          <p
                            key={`${idx}-${issueIdx}`}
                            className="text-sm text-yellow-700"
                          >
                            • {issue.message}
                          </p>
                        ))
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    {cart.items.map((item) => (
                      <div
                        key={item.id || `${item.productId}-${item.variantId}`}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={getImageSrc(item)}
                              alt={item.title || "Product"}
                              className="w-20 h-20 object-cover rounded-lg border"
                              onError={(e) => handleImageError(e, item.image)}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1">
                              {item.title || "Product Title"}
                            </h3>

                            <p className="text-sm text-gray-600 capitalize mb-2">
                              {item.productType || "Product"}
                            </p>

                            {/* SKU */}
                            {item.sku && (
                              <p className="text-xs text-gray-500 mb-2">
                                SKU: {item.sku}
                              </p>
                            )}

                            {/* Variant Details */}
                            {item.variantDetails && (
                              <div className="mb-3">
                                {getVariantDisplayText(item) && (
                                  <p className="text-sm font-medium text-blue-800 mb-1">
                                    {getVariantDisplayText(item)}
                                  </p>
                                )}

                                {item.variantDetails.optionValues && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {Object.entries(
                                      item.variantDetails.optionValues
                                    ).map(
                                      ([key, option]) =>
                                        option &&
                                        option.value && (
                                          <span
                                            key={key}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                          >
                                            {option.value}
                                          </span>
                                        )
                                    )}
                                  </div>
                                )}

                                {item.variantDetails.stock !== undefined && (
                                  <p className="text-xs text-gray-500">
                                    Stock:{" "}
                                    {item.variantDetails.stock ||
                                      "Out of Stock"}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg text-green-600">
                                ₹{formatPrice(item.price)}
                              </span>
                              {item.originalPrice &&
                                item.originalPrice > item.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{formatPrice(item.originalPrice)}
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Quantity Controls and Actions */}
                          <div className="flex flex-col items-end gap-3">
                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                handleRemoveItem(item.productId, item.variantId)
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove item"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.variantId,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-medium">
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
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                                disabled={
                                  item.variantDetails?.stock &&
                                  item.quantity >= item.variantDetails.stock
                                }
                              >
                                +
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <p className="font-semibold text-lg">
                                ₹{formatPrice(item.price * item.quantity)}
                              </p>
                              <p className="text-xs text-gray-500">
                                ₹{formatPrice(item.price)} each
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.totalItems || 0} items)</span>
                    <span>₹{formatPrice(cart.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{formatPrice(cart.discount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span>
                      {cart.deliveryCharges === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${formatPrice(cart.deliveryCharges)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Platform Fees</span>
                    <span>₹{formatPrice(cart.platformFees)}</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span className="text-green-600">
                        ₹{formatPrice(cart.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={
                    !validationResults?.isValid && validationResults !== null
                  }
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                    !validationResults?.isValid && validationResults !== null
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {!validationResults?.isValid && validationResults !== null
                    ? "Fix Cart Issues First"
                    : "Proceed to Checkout"}
                </button>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate("/")}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
