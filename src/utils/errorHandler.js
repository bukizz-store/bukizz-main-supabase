/**
 * Error Handler & Message Simplifier for Bukizz Web
 *
 * Translates technical developer jargon (e.g., "Please refresh your token",
 * "jwt expired", "Validation error: \"comment\" is required", "Failed to fetch")
 * into clear, parent-friendly English with actionable next steps.
 */

export const ERROR_CATEGORIES = {
  SESSION_EXPIRED: "SESSION_EXPIRED",
  NETWORK: "NETWORK",
  PERMISSION: "PERMISSION",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION",
  SERVER: "SERVER",
  PAYMENT: "PAYMENT",
  DUPLICATE: "DUPLICATE",
  GENERAL: "GENERAL",
};

/**
 * Normalizes any error input (Error object, string, or API response) into a string
 * @param {Error|string|Object} error
 * @returns {string}
 */
const getRawErrorMessage = (error) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return typeof error.error === "string" ? error.error : JSON.stringify(error.error);
  if (error.statusText) return error.statusText;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

/**
 * Simplifies technical error messages into clean, actionable, parent-friendly text.
 * Suitable for inline banners, form errors, and notification descriptions.
 *
 * @param {Error|string|Object} error
 * @returns {string} Friendly error description
 */
export const simplifyErrorMessage = (error) => {
  const raw = getRawErrorMessage(error).trim();
  if (!raw) return "Something went wrong. Please try again.";

  const lower = raw.toLowerCase();

  // 1. Session & Token Expiration
  if (
    lower.includes("refresh your token") ||
    lower.includes("refresh token") ||
    lower.includes("token refresh failed") ||
    lower.includes("token expired") ||
    lower.includes("jwt expired") ||
    lower.includes("jwt malformed") ||
    lower.includes("invalid token") ||
    lower.includes("invalid signature") ||
    lower.includes("authentication token not found") ||
    lower.includes("authentication required") ||
    lower.includes("unauthorized") ||
    lower.includes("user not authenticated") ||
    lower.includes("session expired") ||
    lower === "http 401: unauthorized" ||
    lower.includes("401 unauthorized")
  ) {
    return "Your session has expired. Please sign in again to continue.";
  }

  // 2. Network & Connectivity Issues
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("net::err_") ||
    lower.includes("connection refused") ||
    lower.includes("internet connection appears to be offline") ||
    lower.includes("offline") ||
    lower.includes("econnrefused") ||
    lower.includes("load failed") ||
    lower.includes("aborterror") ||
    lower.includes("timeout")
  ) {
    return "Unable to reach Bukizz servers. Please check your internet connection and try again.";
  }

  // 3. Permission & Forbidden Access (403)
  if (
    lower.includes("forbidden") ||
    lower.includes("insufficient permissions") ||
    lower.includes("access denied") ||
    lower.includes("not authorized") ||
    lower === "http 403: forbidden"
  ) {
    return "You do not have permission to access this. Please sign in with the correct account.";
  }

  // 4. Resource Not Found (404)
  if (lower.includes("product not found")) {
    return "This product is no longer available or may have been moved.";
  }
  if (lower.includes("order not found")) {
    return "Order details could not be found. Please check your order history.";
  }
  if (lower.includes("address not found")) {
    return "The requested address was not found.";
  }
  if (lower === "http 404: not found" || lower.includes("route not found") || lower.includes("not found")) {
    return "The requested information could not be found. It may have been updated or removed.";
  }

  // 5. Duplicate / Already Submitted (409)
  if (
    lower.includes("already submitted a review") ||
    lower.includes("already reviewed")
  ) {
    return "You have already reviewed this product. You can update your existing review from My Orders.";
  }
  if (lower.includes("already exists")) {
    return "This record already exists in our system.";
  }

  // 6. Form Validation & Joi Schemas
  if (lower.includes("validation error") || lower.includes("must be") || lower.includes("is required")) {
    if (lower.includes("productid") && (lower.includes("guid") || lower.includes("uuid"))) {
      return "Invalid product reference. Please reload the page.";
    }
    if (lower.includes("comment") && (lower.includes("least 10") || lower.includes("required"))) {
      return "Please write at least 10 characters in your review comment.";
    }
    if (lower.includes("rating")) {
      return "Please select a star rating from 1 to 5 stars.";
    }
    if (lower.includes("email")) {
      return "Please enter a valid email address.";
    }
    if (lower.includes("phone") || lower.includes("mobile")) {
      return "Please enter a valid 10-digit mobile number.";
    }
    if (lower.includes("pincode")) {
      return "Please enter a valid 6-digit postal pincode.";
    }

    // Clean up generic validation strings by removing quotes and schema prefixes
    let clean = raw
      .replace(/^validation error:\s*/i, "")
      .replace(/["\\]/g, "")
      .trim();

    // Capitalize first letter
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (!clean.endsWith(".")) clean += ".";
    return clean;
  }

  // 7. Payment Failures
  if (lower.includes("payment failed") || lower.includes("razorpay") || lower.includes("transaction failed")) {
    return "Payment could not be completed. If any money was deducted, your bank will refund it within 3-5 working days.";
  }

  // 8. Server & Database Hiccups (500, 502, 503)
  if (
    lower.includes("internal server error") ||
    lower.includes("http 500") ||
    lower.includes("http 502") ||
    lower.includes("http 503") ||
    lower.includes("bad gateway") ||
    lower.includes("service unavailable") ||
    lower.includes("database error") ||
    lower.includes("supabase error")
  ) {
    return "Our servers are experiencing a brief delay. Please wait a moment and try again.";
  }

  // 9. Technical JS Exceptions (Null pointers, type errors)
  if (
    lower.includes("cannot read properties of") ||
    lower.includes("undefined is not an object") ||
    lower.includes("null is not an object") ||
    lower.includes("syntaxerror")
  ) {
    return "A temporary display issue occurred. Please refresh the page.";
  }

  // Fallback: return the original message if it is already clean English
  return raw;
};

/**
 * Formats an error into a structured title, message, category, and optional user action.
 *
 * @param {Error|string|Object} error
 * @returns {{ title: string, message: string, category: string, actionLabel?: string, onAction?: Function }}
 */
export const formatUserError = (error) => {
  const raw = getRawErrorMessage(error).trim();
  const lower = raw.toLowerCase();
  const friendlyMessage = simplifyErrorMessage(error);

  // Session Expired
  if (
    lower.includes("refresh your token") ||
    lower.includes("token refresh failed") ||
    lower.includes("token expired") ||
    lower.includes("jwt expired") ||
    lower.includes("invalid token") ||
    lower.includes("authentication required") ||
    lower.includes("unauthorized") ||
    lower.includes("session expired") ||
    lower.includes("401")
  ) {
    return {
      title: "Session Expired",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.SESSION_EXPIRED,
      actionLabel: "Sign In",
      onAction: async () => {
        try {
          const useAuthStore = (await import("../store/authStore.js")).default;
          useAuthStore.getState().openAuthModal();
        } catch {
          window.location.reload();
        }
      },
    };
  }

  // Network / Offline
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("connection") ||
    lower.includes("offline") ||
    lower.includes("timeout") ||
    lower.includes("econnrefused") ||
    lower.includes("net::") ||
    lower.includes("load failed") ||
    lower.includes("aborterror")
  ) {
    return {
      title: "Connection Problem",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.NETWORK,
      actionLabel: "Try Again",
      onAction: () => {
        window.location.reload();
      },
    };
  }

  // Payment Failures
  if (
    lower.includes("payment") ||
    lower.includes("razorpay") ||
    lower.includes("transaction failed")
  ) {
    return {
      title: "Payment Incomplete",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.PAYMENT,
    };
  }

  // Permission / 403
  if (lower.includes("forbidden") || lower.includes("403") || lower.includes("permission")) {
    return {
      title: "Access Restricted",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.PERMISSION,
    };
  }

  // Not Found / 404
  if (lower.includes("404") || lower.includes("not found")) {
    return {
      title: "Item Not Found",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.NOT_FOUND,
    };
  }

  // Duplicate / 409
  if (lower.includes("already") || lower.includes("409")) {
    return {
      title: "Already Submitted",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.DUPLICATE,
    };
  }

  // Validation
  if (lower.includes("validation error") || lower.includes("must be") || lower.includes("is required")) {
    return {
      title: "Please Check Your Input",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.VALIDATION,
    };
  }

  // Server 500
  if (
    lower.includes("500") ||
    lower.includes("502") ||
    lower.includes("503") ||
    lower.includes("server error") ||
    lower.includes("database")
  ) {
    return {
      title: "Something Went Wrong",
      message: friendlyMessage,
      category: ERROR_CATEGORIES.SERVER,
      actionLabel: "Reload Page",
      onAction: () => {
        window.location.reload();
      },
    };
  }

  // Default
  return {
    title: "Action Could Not Be Completed",
    message: friendlyMessage,
    category: ERROR_CATEGORIES.GENERAL,
  };
};

export default {
  simplifyErrorMessage,
  formatUserError,
  ERROR_CATEGORIES,
};
