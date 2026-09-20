import React, { useState } from "react";
import {
  AlertTriangle,
  PackageX,
  Trash2,
  RefreshCw,
  MapPin,
  GraduationCap,
  CreditCard,
  CheckCircle2,
  X,
  ArrowRight,
  ShoppingCart,
  LogIn,
} from "lucide-react";
import { ORDER_ERROR_CODES, truncateTitle } from "../../utils/orderErrors";

/**
 * OrderErrorModal
 * 
 * Replaces cryptic error dumps with structured, parent-friendly cards
 * featuring 1-click actionable resolutions (remove item, update quantity,
 * accept price, add student name, change address, switch payment, sign in).
 */
export default function OrderErrorModal({
  isOpen,
  onClose,
  errors = [],
  onRemoveItem,
  onUpdateQuantity,
  onEnterStudentName,
  onChangeAddress,
  onSelectPaymentMethod,
  onRefreshPricing,
  onSwitchToCod,
  onLogin,
  onGoToCart,
  onRetry,
  isCodAllowed = true,
}) {
  const [actionLoadingId, setActionLoadingId] = useState(null);

  if (!isOpen || !errors || errors.length === 0) return null;

  const handleAction = async (id, actionFn) => {
    if (!actionFn) return;
    try {
      setActionLoadingId(id);
      await actionFn();
    } catch (e) {
      console.error("Error executing modal action:", e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Determine if retry should be available (if there are only retryable errors)
  const hasOnlyAutoFixableErrors = errors.every(
    (e) =>
      e.code === ORDER_ERROR_CODES.PRICE_CHANGED ||
      e.code === ORDER_ERROR_CODES.UNKNOWN_ERROR ||
      e.code === ORDER_ERROR_CODES.NETWORK_OFFLINE ||
      e.code === ORDER_ERROR_CODES.SERVER_ERROR
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Action Required Before Ordering
              </h3>
              <p className="text-xs text-gray-600">
                {errors.length} {errors.length === 1 ? "issue needs" : "issues need"} your attention to place this order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {errors.map((error, idx) => {
            const isItemError = !!error.item;
            const item = error.item || {};
            const targetItem = error.item || {
              id: error.technicalDetails?.productId,
              productId: error.technicalDetails?.productId,
              title: error.title,
              message: error.message,
            };
            const key = item.id || item.productId || idx;
            const isLoading = actionLoadingId === key;

            return (
              <div
                key={key}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Item Image or Icon */}
                  {isItemError ? (
                    <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title || "Product"}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <PackageX className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  ) : error.code === ORDER_ERROR_CODES.STUDENT_NAME_REQUIRED ? (
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  ) : error.code === ORDER_ERROR_CODES.PINCODE_UNSERVICEABLE ||
                    error.code === ORDER_ERROR_CODES.PINCODE_INVALID ||
                    error.code === ORDER_ERROR_CODES.ADDRESS_INCOMPLETE ||
                    error.code === ORDER_ERROR_CODES.ADDRESS_MISSING ||
                    error.code === ORDER_ERROR_CODES.CONTACT_MISSING ? (
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                  ) : error.code === ORDER_ERROR_CODES.PAYMENT_FAILED ||
                    error.code === ORDER_ERROR_CODES.PAYMENT_CANCELLED ||
                    error.code === ORDER_ERROR_CODES.PAYMENT_INITIATION_FAILED ||
                    error.code === ORDER_ERROR_CODES.PAYMENT_METHOD_DISALLOWED ? (
                    <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  ) : error.code === ORDER_ERROR_CODES.SESSION_EXPIRED ||
                    error.code === ORDER_ERROR_CODES.AUTH_REQUIRED ? (
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <LogIn className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}

                  {/* Title & Badge & Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {isItemError ? truncateTitle(item.title, 40) : error.title}
                      </h4>

                      {/* Status Badges */}
                      {error.code === ORDER_ERROR_CODES.PRODUCT_INACTIVE && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Unavailable
                        </span>
                      )}
                      {error.code === ORDER_ERROR_CODES.OUT_OF_STOCK && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                          Out of Stock
                        </span>
                      )}
                      {error.code === ORDER_ERROR_CODES.INSUFFICIENT_STOCK && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          Only {item.available ?? 0} Left
                        </span>
                      )}
                      {error.code === ORDER_ERROR_CODES.PRICE_CHANGED && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          Price Changed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {error.message}
                    </p>
                  </div>
                </div>

                {/* 1-Click Action Buttons for this error */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200/60 flex-wrap">
                  {/* Remove Item Button for inactive or out-of-stock items */}
                  {(error.code === ORDER_ERROR_CODES.PRODUCT_INACTIVE ||
                    error.code === ORDER_ERROR_CODES.OUT_OF_STOCK ||
                    error.code === ORDER_ERROR_CODES.PRODUCT_NOT_FOUND ||
                    error.code === ORDER_ERROR_CODES.MIN_ORDER_QTY ||
                    error.code === ORDER_ERROR_CODES.MAX_ORDER_QTY) &&
                    onRemoveItem && (
                      <button
                        onClick={() =>
                          handleAction(key, () => onRemoveItem(targetItem))
                        }
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Remove from Cart
                      </button>
                    )}

                  {/* Quantity Update Button for insufficient stock */}
                  {error.code === ORDER_ERROR_CODES.INSUFFICIENT_STOCK && (
                    <>
                      {onRemoveItem && (
                        <button
                          onClick={() =>
                            handleAction(key, () => onRemoveItem(targetItem))
                          }
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove from Cart
                        </button>
                      )}
                      {onUpdateQuantity && (
                        <button
                          onClick={() =>
                            handleAction(key, () =>
                              onUpdateQuantity(targetItem, item.available ?? 1)
                            )
                          }
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Update to {item.available ?? 1} Available
                        </button>
                      )}
                    </>
                  )}

                  {/* Price change refresh & review */}
                  {(error.code === ORDER_ERROR_CODES.PRICE_CHANGED ||
                    error.code === ORDER_ERROR_CODES.PRICING_FAILED) && (
                    <>
                      {onGoToCart && (
                        <button
                          onClick={() => {
                            onClose();
                            onGoToCart();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Review in Cart
                        </button>
                      )}
                      {onRefreshPricing && (
                        <button
                          onClick={() => handleAction(key, onRefreshPricing)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Accept Updated Price
                        </button>
                      )}
                    </>
                  )}

                  {/* Student details requirement */}
                  {error.code === ORDER_ERROR_CODES.STUDENT_NAME_REQUIRED &&
                    onEnterStudentName && (
                      <button
                        onClick={() => {
                          onClose();
                          onEnterStudentName();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
                      >
                        Enter Student Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                  {/* Address or pincode issue */}
                  {(error.code === ORDER_ERROR_CODES.PINCODE_UNSERVICEABLE ||
                    error.code === ORDER_ERROR_CODES.PINCODE_INVALID ||
                    error.code === ORDER_ERROR_CODES.ADDRESS_INCOMPLETE ||
                    error.code === ORDER_ERROR_CODES.ADDRESS_MISSING ||
                    error.code === ORDER_ERROR_CODES.CONTACT_MISSING) &&
                    onChangeAddress && (
                      <button
                        onClick={() => {
                          onClose();
                          onChangeAddress();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                      >
                        Select Different Address
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                  {/* Payment issues */}
                  {(error.code === ORDER_ERROR_CODES.PAYMENT_FAILED ||
                    error.code === ORDER_ERROR_CODES.PAYMENT_CANCELLED ||
                    error.code === ORDER_ERROR_CODES.PAYMENT_INITIATION_FAILED ||
                    error.code === ORDER_ERROR_CODES.PAYMENT_METHOD_DISALLOWED) && (
                    <>
                      {isCodAllowed && onSwitchToCod && (
                        <button
                          onClick={() => {
                            onClose();
                            onSwitchToCod();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                        >
                          Pay with Cash on Delivery (COD)
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onSelectPaymentMethod && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectPaymentMethod();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm"
                        >
                          Choose Payment Option
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Auth / Session issue */}
                  {(error.code === ORDER_ERROR_CODES.SESSION_EXPIRED ||
                    error.code === ORDER_ERROR_CODES.AUTH_REQUIRED) &&
                    onLogin && (
                      <button
                        onClick={() => {
                          onClose();
                          onLogin();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In to Continue
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-100/80 border-t border-gray-200 flex items-center justify-between gap-3">
          <div>
            {onGoToCart && (
              <button
                onClick={() => {
                  onClose();
                  onGoToCart();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-gray-500" />
                Back to Cart
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors shadow-sm"
            >
              Close & Review
            </button>

            {hasOnlyAutoFixableErrors && onRetry && (
              <button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
