/**
 * Bukizz Order Error Taxonomy & Handler
 * 
 * Provides structured error classification, parent-friendly messaging,
 * developer diagnostics logging (console.table/groupCollapsed), and 1-click
 * actionable resolutions for checkout and order lifecycle issues.
 */

export const ORDER_ERROR_CODES = {
  // Inventory & Availability
  PRODUCT_INACTIVE: "PRODUCT_INACTIVE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  MIN_ORDER_QTY: "MIN_ORDER_QTY",
  MAX_ORDER_QTY: "MAX_ORDER_QTY",

  // Pricing
  PRICE_CHANGED: "PRICE_CHANGED",
  PRICING_FAILED: "PRICING_FAILED",

  // Address & Shipping
  ADDRESS_MISSING: "ADDRESS_MISSING",
  ADDRESS_INCOMPLETE: "ADDRESS_INCOMPLETE",
  PINCODE_INVALID: "PINCODE_INVALID",
  PINCODE_UNSERVICEABLE: "PINCODE_UNSERVICEABLE",
  CONTACT_MISSING: "CONTACT_MISSING",

  // Custom Requirements
  STUDENT_NAME_REQUIRED: "STUDENT_NAME_REQUIRED",

  // Payment
  PAYMENT_METHOD_DISALLOWED: "PAYMENT_METHOD_DISALLOWED",
  PAYMENT_INITIATION_FAILED: "PAYMENT_INITIATION_FAILED",
  PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
  PAYMENT_FAILED: "PAYMENT_FAILED",

  // Account & Auth
  AUTH_REQUIRED: "AUTH_REQUIRED",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // System & Network
  NETWORK_OFFLINE: "NETWORK_OFFLINE",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

export const ORDER_ERROR_CATEGORIES = {
  AVAILABILITY: "AVAILABILITY",
  PRICING: "PRICING",
  SHIPPING: "SHIPPING",
  REQUIREMENTS: "REQUIREMENTS",
  PAYMENT: "PAYMENT",
  AUTH: "AUTH",
  SYSTEM: "SYSTEM",
};

/**
 * Truncate long product titles for user-friendly UI presentation
 */
export const truncateTitle = (title, maxLen = 60) => {
  if (!title) return "Item";
  const trimmed = title.trim();
  return trimmed.length > maxLen ? `${trimmed.substring(0, maxLen)}...` : trimmed;
};

/**
 * Structured OrderError class
 */
export class OrderError extends Error {
  constructor({
    code = ORDER_ERROR_CODES.UNKNOWN_ERROR,
    category = ORDER_ERROR_CATEGORIES.SYSTEM,
    title = "Order Issue",
    message = "An unexpected error occurred with your order.",
    technicalDetails = null,
    item = null,
    actions = [],
    rawError = null,
  }) {
    super(message);
    this.name = "OrderError";
    this.code = code;
    this.category = category;
    this.title = title;
    this.technicalDetails = technicalDetails;
    this.item = item;
    this.actions = actions;
    this.rawError = rawError;
  }
}

/**
 * Factory functions for specific order errors
 */

export const createProductInactiveError = (item, reason) => {
  return new OrderError({
    code: ORDER_ERROR_CODES.PRODUCT_INACTIVE,
    category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
    title: "Product Unavailable",
    message: `"${truncateTitle(item.title)}" is currently inactive and cannot be ordered.`,
    item: {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      available: 0,
      reason: reason || "Product is not active",
    },
    technicalDetails: {
      productId: item.productId,
      variantId: item.variantId,
      reason: reason || "Product is marked is_active: false in database",
      requestedQuantity: item.quantity,
    },
    actions: [
      {
        type: "REMOVE_ITEM",
        label: "Remove from Cart",
        primary: true,
      },
    ],
  });
};

export const createOutOfStockError = (item) => {
  return new OrderError({
    code: ORDER_ERROR_CODES.OUT_OF_STOCK,
    category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
    title: "Out of Stock",
    message: `"${truncateTitle(item.title)}" is currently out of stock.`,
    item: {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      available: 0,
    },
    technicalDetails: {
      productId: item.productId,
      variantId: item.variantId,
      requestedQuantity: item.quantity,
      availableStock: 0,
    },
    actions: [
      {
        type: "REMOVE_ITEM",
        label: "Remove from Cart",
        primary: true,
      },
    ],
  });
};

export const createInsufficientStockError = (item, availableStock, requestedQuantity) => {
  return new OrderError({
    code: ORDER_ERROR_CODES.INSUFFICIENT_STOCK,
    category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
    title: "Limited Stock Left",
    message: `Only ${availableStock} unit(s) of "${truncateTitle(item.title)}" remaining in stock, but ${requestedQuantity} requested.`,
    item: {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: requestedQuantity,
      available: availableStock,
    },
    technicalDetails: {
      productId: item.productId,
      variantId: item.variantId,
      requestedQuantity,
      availableStock,
    },
    actions: [
      {
        type: "UPDATE_QUANTITY",
        label: `Update to ${availableStock}`,
        targetQuantity: availableStock,
        primary: true,
      },
      {
        type: "REMOVE_ITEM",
        label: "Remove Item",
        primary: false,
      },
    ],
  });
};

export const createPriceChangedError = (item, oldPrice, newPrice) => {
  return new OrderError({
    code: ORDER_ERROR_CODES.PRICE_CHANGED,
    category: ORDER_ERROR_CATEGORIES.PRICING,
    title: "Price Updated",
    message: `Price for "${truncateTitle(item.title)}" changed from ₹${oldPrice} to ₹${newPrice}.`,
    item: {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      image: item.image,
      oldPrice,
      newPrice,
    },
    technicalDetails: {
      productId: item.productId,
      variantId: item.variantId,
      oldPrice,
      newPrice,
      priceDiff: newPrice - oldPrice,
    },
    actions: [
      {
        type: "REFRESH_PRICING",
        label: `Accept ₹${newPrice}`,
        primary: true,
      },
    ],
  });
};

export const createStudentNameRequiredError = (productTitles = []) => {
  const label = productTitles.length > 0
    ? `Student details are required for ${truncateTitle(productTitles[0])}${productTitles.length > 1 ? ` and ${productTitles.length - 1} other item(s)` : ""}.`
    : "Please provide the student's name for school items in your cart.";

  return new OrderError({
    code: ORDER_ERROR_CODES.STUDENT_NAME_REQUIRED,
    category: ORDER_ERROR_CATEGORIES.REQUIREMENTS,
    title: "Student Details Required",
    message: label,
    technicalDetails: {
      productTitles,
    },
    actions: [
      {
        type: "ENTER_STUDENT_NAME",
        label: "Enter Student Details",
        primary: true,
      },
    ],
  });
};

export const createPincodeUnserviceableError = (pincode) => {
  return new OrderError({
    code: ORDER_ERROR_CODES.PINCODE_UNSERVICEABLE,
    category: ORDER_ERROR_CATEGORIES.SHIPPING,
    title: "Delivery Unavailable",
    message: `Delivery is currently not available to pincode ${pincode || ""}. Please choose another delivery address.`,
    technicalDetails: {
      pincode,
    },
    actions: [
      {
        type: "CHANGE_ADDRESS",
        label: "Select Different Address",
        primary: true,
      },
    ],
  });
};

export const createAddressIncompleteError = (missingDetails = "") => {
  return new OrderError({
    code: ORDER_ERROR_CODES.ADDRESS_INCOMPLETE,
    category: ORDER_ERROR_CATEGORIES.SHIPPING,
    title: "Incomplete Address",
    message: missingDetails
      ? `Please complete your delivery address: ${missingDetails}.`
      : "Please provide complete delivery address details (street, city, state, pin code).",
    actions: [
      {
        type: "EDIT_ADDRESS",
        label: "Update Address",
        primary: true,
      },
    ],
  });
};

export const createPaymentFailedError = (rawMessage = "") => {
  return new OrderError({
    code: ORDER_ERROR_CODES.PAYMENT_FAILED,
    category: ORDER_ERROR_CATEGORIES.PAYMENT,
    title: "Payment Incomplete",
    message: rawMessage || "Online payment could not be processed. If money was debited, it will be refunded by your bank within 3-5 days.",
    technicalDetails: {
      rawMessage,
    },
    actions: [
      {
        type: "SWITCH_TO_COD",
        label: "Pay with Cash on Delivery (COD)",
        primary: true,
      },
      {
        type: "RETRY_PAYMENT",
        label: "Retry Online Payment",
        primary: false,
      },
    ],
  });
};

/**
 * Developer Diagnostics Logger
 * Prints an informative console group with a clean table showing error codes,
 * affected products, technical reasons, and context so developers never have to guess.
 */
export const logOrderErrorsForDeveloper = (errors, context = {}) => {
  if (!Array.isArray(errors) || errors.length === 0) return;

  try {
    console.groupCollapsed(
      `%c🛒 [Bukizz Order Error Diagnostics] - ${errors.length} issue(s) detected`,
      "color: #e11d48; font-weight: bold; font-size: 12px;"
    );

    console.table(
      errors.map((err) => ({
        Code: err.code || "UNKNOWN",
        Category: err.category || "GENERAL",
        Title: err.title || "N/A",
        Item: err.item?.title ? truncateTitle(err.item.title, 35) : "N/A",
        Message: truncateTitle(err.message, 50),
        Technical:
          typeof err.technicalDetails === "object"
            ? JSON.stringify(err.technicalDetails)
            : err.technicalDetails || "N/A",
      }))
    );

    if (Object.keys(context).length > 0) {
      console.log("Context Data:", context);
    }
    console.log("Raw Error Objects:", errors);
    console.groupEnd();
  } catch (e) {
    console.error("Order errors:", errors, context);
  }
};

/**
 * Parses any incoming error or validation result into an array of OrderError instances
 * Handles legacy concatenated strings, raw AppError messages, arrays, and objects.
 */
export const parseOrderErrors = (input, context = {}) => {
  const structured = [];

  if (!input) {
    return [
      new OrderError({
        code: ORDER_ERROR_CODES.UNKNOWN_ERROR,
        category: ORDER_ERROR_CATEGORIES.SYSTEM,
        title: "Order Issue",
        message: "Something went wrong while processing your order. Please try again.",
      }),
    ];
  }

  // If already an array of OrderError instances
  if (Array.isArray(input)) {
    input.forEach((item) => {
      if (item instanceof OrderError) {
        structured.push(item);
      } else if (typeof item === "string") {
        structured.push(...parseStringError(item, context));
      } else if (item && typeof item === "object") {
        structured.push(new OrderError(item));
      }
    });
  } else if (input instanceof OrderError) {
    structured.push(input);
  } else if (typeof input === "string") {
    structured.push(...parseStringError(input, context));
  } else if (input instanceof Error) {
    if (input.structuredErrors && Array.isArray(input.structuredErrors)) {
      structured.push(...input.structuredErrors);
    } else {
      structured.push(...parseStringError(input.message, context));
    }
  } else if (typeof input === "object") {
    if (input.errors && Array.isArray(input.errors)) {
      structured.push(...parseOrderErrors(input.errors, context));
    } else {
      structured.push(new OrderError(input));
    }
  }

  // Fallback if nothing was parsed
  if (structured.length === 0) {
    structured.push(
      new OrderError({
        code: ORDER_ERROR_CODES.UNKNOWN_ERROR,
        category: ORDER_ERROR_CATEGORIES.SYSTEM,
        title: "Order Issue",
        message: "An unexpected error occurred. Please try again.",
        rawError: input,
      })
    );
  }

  // Log developer diagnostics in console
  logOrderErrorsForDeveloper(structured, context);

  return structured;
};

/**
 * Internal parser for raw or legacy string messages
 */
const parseStringError = (rawString, context = {}) => {
  if (!rawString || typeof rawString !== "string") return [];

  // Remove "Order validation failed: " prefix if present
  let cleanStr = rawString.replace(/^Order validation failed:\s*/i, "").trim();

  // Split by comma or semicolon if multiple errors were concatenated
  const segments = cleanStr.split(/;\s*|,\s*(?=[A-Z0-9])/);

  return segments.map((segment) => {
    const s = segment.trim();
    const lower = s.toLowerCase();

    // Match cart item from context.items, or fallback to localStorage cart
    const findItem = () => {
      let candidateItems = context.items;
      if (!candidateItems || !Array.isArray(candidateItems) || candidateItems.length === 0) {
        try {
          const stored = localStorage.getItem("bukizz_cart");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.items)) candidateItems = parsed.items;
          }
        } catch (e) {
          // ignore error reading local storage
        }
      }

      if (!candidateItems || !Array.isArray(candidateItems) || candidateItems.length === 0) {
        return null;
      }

      // 1. Exact or partial title match (case-insensitive)
      const sLower = s.toLowerCase();
      const titleMatch = candidateItems.find((i) => {
        if (!i?.title) return false;
        const iTitle = i.title.toLowerCase().trim();
        return (
          sLower.includes(iTitle) ||
          iTitle.includes(sLower.split(" - ")[0].trim()) ||
          sLower.split(" - ")[0].trim().includes(iTitle)
        );
      });
      if (titleMatch) return titleMatch;

      // 2. ID / Product ID match
      const idMatch = candidateItems.find((i) => {
        if (i.productId && s.includes(i.productId)) return true;
        if (i.id && s.includes(i.id)) return true;
        return false;
      });
      if (idMatch) return idMatch;

      // 3. Fallback: if only 1 item in candidateItems, it's that item
      if (candidateItems.length === 1) return candidateItems[0];

      return null;
    };

    const matchedItem = findItem();
    const itemPayload = matchedItem
      ? {
          id: matchedItem.id,
          productId: matchedItem.productId,
          variantId: matchedItem.variantId,
          title: matchedItem.title,
          image: matchedItem.image,
          price: matchedItem.price,
          quantity: matchedItem.quantity,
        }
      : null;

    // 1. Inactive product
    if (lower.includes("not active") || lower.includes("inactive")) {
      return new OrderError({
        code: ORDER_ERROR_CODES.PRODUCT_INACTIVE,
        category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
        title: "Product Unavailable",
        message: matchedItem
          ? `"${truncateTitle(matchedItem.title)}" is currently inactive and cannot be ordered.`
          : s,
        item: itemPayload,
        technicalDetails: s,
        actions: [{ type: "REMOVE_ITEM", label: "Remove from Cart", primary: true }],
      });
    }

    // 2. Only 0 available or out of stock
    if (
      lower.includes("only 0 available") ||
      lower.includes("out of stock") ||
      lower.includes("no longer available")
    ) {
      return new OrderError({
        code: ORDER_ERROR_CODES.OUT_OF_STOCK,
        category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
        title: "Out of Stock",
        message: matchedItem
          ? `"${truncateTitle(matchedItem.title)}" is currently out of stock.`
          : s,
        item: itemPayload ? { ...itemPayload, available: 0 } : null,
        technicalDetails: s,
        actions: [{ type: "REMOVE_ITEM", label: "Remove from Cart", primary: true }],
      });
    }

    // 3. Limited stock / Insufficient stock (e.g. Only 2 available, but 5 requested)
    const stockMatch = s.match(/only\s+(\d+)\s+available,\s+but\s+(\d+)\s+requested/i);
    if (stockMatch) {
      const available = parseInt(stockMatch[1], 10);
      const requested = parseInt(stockMatch[2], 10);

      if (available === 0) {
        return new OrderError({
          code: ORDER_ERROR_CODES.OUT_OF_STOCK,
          category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
          title: "Out of Stock",
          message: matchedItem
            ? `"${truncateTitle(matchedItem.title)}" is currently out of stock.`
            : s,
          item: itemPayload ? { ...itemPayload, available: 0, requested } : null,
          technicalDetails: { availableStock: 0, requestedQuantity: requested, raw: s },
          actions: [{ type: "REMOVE_ITEM", label: "Remove from Cart", primary: true }],
        });
      }

      return new OrderError({
        code: ORDER_ERROR_CODES.INSUFFICIENT_STOCK,
        category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
        title: "Limited Stock Left",
        message: matchedItem
          ? `Only ${available} unit(s) of "${truncateTitle(matchedItem.title)}" remaining in stock, but ${requested} requested.`
          : s,
        item: itemPayload ? { ...itemPayload, available, requested } : null,
        technicalDetails: { availableStock: available, requestedQuantity: requested, raw: s },
        actions: [
          {
            type: "UPDATE_QUANTITY",
            label: `Update Quantity to ${available}`,
            targetQuantity: available,
            primary: true,
          },
          { type: "REMOVE_ITEM", label: "Remove from Cart", primary: false },
        ],
      });
    }

    // 4. Price changed
    if (lower.includes("price changed") || lower.includes("refresh your cart")) {
      return new OrderError({
        code: ORDER_ERROR_CODES.PRICE_CHANGED,
        category: ORDER_ERROR_CATEGORIES.PRICING,
        title: "Price Updated",
        message: s,
        technicalDetails: s,
        actions: [{ type: "REFRESH_PRICING", label: "Accept New Price", primary: true }],
      });
    }

    // 5. Student details
    if (lower.includes("student name") || lower.includes("student details")) {
      return new OrderError({
        code: ORDER_ERROR_CODES.STUDENT_NAME_REQUIRED,
        category: ORDER_ERROR_CATEGORIES.REQUIREMENTS,
        title: "Student Details Required",
        message: s,
        actions: [{ type: "ENTER_STUDENT_NAME", label: "Enter Student Details", primary: true }],
      });
    }

    // 6. Address / Pincode
    if (lower.includes("pincode") || lower.includes("postal code")) {
      return new OrderError({
        code: ORDER_ERROR_CODES.PINCODE_UNSERVICEABLE,
        category: ORDER_ERROR_CATEGORIES.SHIPPING,
        title: "Pincode Issue",
        message: s,
        actions: [{ type: "CHANGE_ADDRESS", label: "Select Deliverable Address", primary: true }],
      });
    }

    if (lower.includes("address") || lower.includes("recipient name")) {
      return new OrderError({
        code: ORDER_ERROR_CODES.ADDRESS_INCOMPLETE,
        category: ORDER_ERROR_CATEGORIES.SHIPPING,
        title: "Address Required",
        message: s,
        actions: [{ type: "EDIT_ADDRESS", label: "Update Address", primary: true }],
      });
    }

    // 7. Payment
    if (lower.includes("payment") || lower.includes("razorpay") || lower.includes("cash on delivery")) {
      return new OrderError({
        code: ORDER_ERROR_CODES.PAYMENT_FAILED,
        category: ORDER_ERROR_CATEGORIES.PAYMENT,
        title: "Payment Issue",
        message: s,
        actions: [
          { type: "SWITCH_TO_COD", label: "Switch to Cash on Delivery", primary: true },
          { type: "RETRY_PAYMENT", label: "Retry Payment", primary: false },
        ],
      });
    }

    // 8. Auth / Session
    if (lower.includes("authentication") || lower.includes("session") || lower.includes("token")) {
      return new OrderError({
        code: ORDER_ERROR_CODES.SESSION_EXPIRED,
        category: ORDER_ERROR_CATEGORIES.AUTH,
        title: "Session Expired",
        message: "Your session has expired. Please sign in again.",
        actions: [{ type: "LOGIN", label: "Sign In to Continue", primary: true }],
      });
    }

    // 9. Cart Empty
    if (lower.includes("cart is empty") || (lower.includes("cart") && lower.includes("empty"))) {
      return new OrderError({
        code: ORDER_ERROR_CODES.UNKNOWN_ERROR,
        category: ORDER_ERROR_CATEGORIES.AVAILABILITY,
        title: "Cart Empty",
        message: "Your cart is empty. Please add items to place an order.",
        actions: [{ type: "GO_TO_HOME", label: "Browse Products", primary: true }],
      });
    }

    // Generic fallback
    return new OrderError({
      code: ORDER_ERROR_CODES.UNKNOWN_ERROR,
      category: ORDER_ERROR_CATEGORIES.SYSTEM,
      title: "Order Notice",
      message: s,
      technicalDetails: s,
      actions: [{ type: "RETRY", label: "Retry", primary: true }],
    });
  });
};
