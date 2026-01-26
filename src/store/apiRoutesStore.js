import { create } from "zustand";

/**
 * API Routes Store
 * Centralizes all API endpoints and provides utility functions for API calls
 * This makes it easy to manage, find, and update API routes across the application
 */

// Base configuration
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5001";
    }
    return "https://bukizz.in";
  }
  return "https://bukizz.in";
};

// Base configuration
const API_BASE_URL = getBaseUrl();
const API_VERSION = "/api/v1";
const BASE_URL = `${API_BASE_URL}${API_VERSION}`;

// Legacy endpoints (for backward compatibility)
const LEGACY_BASE = `${API_BASE_URL}/api`;

const useApiRoutesStore = create((set, get) => ({
  // ============ CONFIGURATION ============
  baseUrl: BASE_URL,
  legacyUrl: LEGACY_BASE,

  // ============ AUTH ROUTES ============
  auth: {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    refreshToken: `${BASE_URL}/auth/refresh-token`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
    verifyToken: `${BASE_URL}/auth/verify-token`,
    getProfile: `${BASE_URL}/auth/me`,
    googleLogin: `${BASE_URL}/auth/google-login`,
  },

  // ============ USER ROUTES ============
  users: {
    // Profile management
    profile: `${BASE_URL}/users/profile`,

    // Address management
    addresses: `${BASE_URL}/users/addresses`,
    addressById: (addressId) => `${BASE_URL}/users/addresses/${addressId}`,

    // Preferences and settings
    preferences: `${BASE_URL}/users/preferences`,
    stats: `${BASE_URL}/users/stats`,

    // Account verification
    verifyEmail: `${BASE_URL}/users/verify-email`,
    verifyEmailConfirm: `${BASE_URL}/users/verify-email/confirm`,
    verifyPhone: `${BASE_URL}/users/verify-phone`,

    // Account management
    deactivateAccount: `${BASE_URL}/users/account`,

    // Admin routes (if needed)
    admin: {
      search: `${BASE_URL}/users/admin/search`,
      export: `${BASE_URL}/users/admin/export`,
      getUserById: (userId) => `${BASE_URL}/users/admin/${userId}`,
      updateRole: (userId) => `${BASE_URL}/users/admin/${userId}/role`,
      reactivateAccount: (userId) =>
        `${BASE_URL}/users/admin/${userId}/reactivate`,
      bulkUpdate: `${BASE_URL}/users/bulk-update`,
    },

    // Legacy endpoints (for existing code compatibility)
    legacy: {
      profile: `${LEGACY_BASE}/users/profile`,
      addresses: `${LEGACY_BASE}/users/addresses`,
      addressById: (addressId) => `${LEGACY_BASE}/users/addresses/${addressId}`,
      preferences: `${LEGACY_BASE}/users/preferences`,
      stats: `${LEGACY_BASE}/users/stats`,
      verifyEmail: `${LEGACY_BASE}/users/verify-email`,
    },
  },

  // ============ PRODUCT ROUTES ============
  products: {
    // Product search and browsing
    search: `${BASE_URL}/products`,
    featured: `${BASE_URL}/products/featured`,
    stats: `${BASE_URL}/products/stats`,

    // Product details
    getById: (productId) => `${BASE_URL}/products/${productId}`,
    availability: (productId) =>
      `${BASE_URL}/products/${productId}/availability`,
    options: (productId) => `${BASE_URL}/products/${productId}/options`,
    variants: (productId) => `${BASE_URL}/products/${productId}/variants`,

    // Product filtering
    byCategory: (categorySlug) => `${BASE_URL}/products/category/${categorySlug}`,
    byCategoryId: (categoryId) => `${BASE_URL}/products/category/${categoryId}`,
    byBrand: (brandId) => `${BASE_URL}/products/brand/${brandId}`,
    byType: (productType) => `${BASE_URL}/products/type/${productType}`,
    bySchool: (schoolId) => `${BASE_URL}/products/school/${schoolId}`,

    // Product variants
    variantSearch: `${BASE_URL}/products/variants/search`,
    getVariant: (variantId) => `${BASE_URL}/products/variants/${variantId}`,

    // Admin routes (for product management)
    admin: {
      create: `${BASE_URL}/products`,
      update: (productId) => `${BASE_URL}/products/${productId}`,
      updateComprehensive: (productId) =>
        `${BASE_URL}/products/${productId}/comprehensive`,
      delete: (productId) => `${BASE_URL}/products/${productId}`,
      bulkUpdate: `${BASE_URL}/products/bulk-update`,
      addOption: (productId) => `${BASE_URL}/products/${productId}/options`,
      addOptionValue: (attributeId) =>
        `${BASE_URL}/products/options/${attributeId}/values`,
      createVariant: (productId) =>
        `${BASE_URL}/products/${productId}/variants`,
      updateVariant: (variantId) =>
        `${BASE_URL}/products/variants/${variantId}`,
      deleteVariant: (variantId) =>
        `${BASE_URL}/products/variants/${variantId}`,
      updateVariantStock: (variantId) =>
        `${BASE_URL}/products/variants/${variantId}/stock`,
      bulkUpdateVariantStock: `${BASE_URL}/products/variants/bulk-stock-update`,
    },
  },

  // ============ SCHOOL ROUTES ============
  schools: {
    // School search and browsing
    search: `${BASE_URL}/schools`,
    popular: `${BASE_URL}/schools/popular`,
    nearby: `${BASE_URL}/schools/nearby`,
    stats: `${BASE_URL}/schools/stats`,

    // School details
    getById: (schoolId) => `${BASE_URL}/schools/${schoolId}`,
    analytics: (schoolId) => `${BASE_URL}/schools/${schoolId}/analytics`,
    catalog: (schoolId) => `${BASE_URL}/schools/${schoolId}/catalog`,

    // School filtering
    byCity: (city) => `${BASE_URL}/schools/city/${city}`,

    // Utility endpoints
    validate: `${BASE_URL}/schools/validate`,

    // Admin routes (for school management)
    admin: {
      create: `${BASE_URL}/schools`,
      update: (schoolId) => `${BASE_URL}/schools/${schoolId}`,
      delete: (schoolId) => `${BASE_URL}/schools/${schoolId}`,
      reactivate: (schoolId) => `${BASE_URL}/schools/${schoolId}/reactivate`,
      bulkImport: `${BASE_URL}/schools/bulk-import`,

      // Product associations
      associateProduct: (schoolId, productId) =>
        `${BASE_URL}/schools/${schoolId}/products/${productId}`,
      updateProductAssociation: (schoolId, productId, grade) =>
        `${BASE_URL}/schools/${schoolId}/products/${productId}/${grade}`,
      removeProductAssociation: (schoolId, productId) =>
        `${BASE_URL}/schools/${schoolId}/products/${productId}`,

      // Partnerships
      createPartnership: (schoolId) =>
        `${BASE_URL}/schools/${schoolId}/partnerships`,
    },
  },

  // ============ CATEGORY ROUTES ============
  categories: {
    getAll: `${BASE_URL}/categories`,
    getById: (id) => `${BASE_URL}/categories/${id}`,
    getBySlug: (slug) => `${BASE_URL}/categories/slug/${slug}`,

    // Admin routes
    admin: {
      create: `${BASE_URL}/categories`,
      update: (id) => `${BASE_URL}/categories/${id}`,
      delete: (id) => `${BASE_URL}/categories/${id}`,
    }
  },

  // ============ PINCODE ROUTES ============
  pincodes: {
    check: (pincode) => `${BASE_URL}/pincodes/check/${pincode}`,
  },

  // ============ ORDER ROUTES ============
  orders: {
    // Order management
    getAll: `${BASE_URL}/orders`,
    create: `${BASE_URL}/orders`,
    getById: (orderId) => `${BASE_URL}/orders/${orderId}`,
    cancel: (orderId) => `${BASE_URL}/orders/${orderId}/cancel`,

    // Order utilities
    calculate: `${BASE_URL}/orders/calculate`,
    stats: `${BASE_URL}/orders/stats`,

    // Order tracking
    tracking: (orderId) => `${BASE_URL}/orders/${orderId}/tracking`,

    // Order queries/support
    createQuery: (orderId) => `${BASE_URL}/orders/${orderId}/queries`,
    getQueries: (orderId) => `${BASE_URL}/orders/${orderId}/queries`,

    // Cart management
    cart: `${BASE_URL}/orders/cart`,
    addToCart: `${BASE_URL}/orders/cart/items`,

    // Admin routes
    admin: {
      search: `${BASE_URL}/orders/search`,
      updateStatus: (orderId) => `${BASE_URL}/orders/${orderId}/status`,
      updatePayment: (orderId) => `${BASE_URL}/orders/${orderId}/payment`,
      bulkUpdate: `${BASE_URL}/orders/bulk-update`,
    },
  },

  // ============ PAYMENT ROUTES ============
  payments: {
    createOrder: `${BASE_URL}/payments/create-order`,
    verify: `${BASE_URL}/payments/verify`,
    failure: `${BASE_URL}/payments/failure`,
  },

  // ============ UTILITY FUNCTIONS ============

  /**
   * Get basic headers for requests (without authorization)
   * @returns {Object} Headers object with Content-Type
   */
  getBasicHeaders: () => {
    return {
      "Content-Type": "application/json",
    };
  },

  /**
   * Get Authorization headers for authenticated requests
   * @returns {Object} Headers object with Authorization
   */
  getAuthHeaders: () => {
    const token = localStorage.getItem("custom_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },

  /**
   * Enhanced API call function with automatic token refresh
   * @param {string} url - API endpoint URL
   * @param {Object} options - Fetch options
   * @param {boolean} isRetry - Whether this is a retry after token refresh
   * @returns {Promise} API response
   */
  apiCall: async (url, options = {}, isRetry = false) => {
    try {
      const defaultOptions = {
        headers: get().getAuthHeaders(),
        ...options,
      };

      console.log(`Making API call to: ${url}`);
      const response = await fetch(url, defaultOptions);

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && !isRetry) {
        console.log("Received 401, attempting token refresh...");

        try {
          // Import auth store dynamically to avoid circular dependencies
          const useAuthStore = (await import("./authStore.js")).default;
          const authStore = useAuthStore.getState();

          // Attempt to refresh the token
          await authStore.refreshToken();

          console.log(
            "Token refreshed successfully, retrying original request..."
          );

          // Retry the original request with the new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              ...get().getAuthHeaders(), // Get fresh headers with new token
            },
          };

          return get().apiCall(url, newOptions, true); // Mark as retry to prevent infinite loop
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          // If refresh fails, throw the original 401 error with a helpful message
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Please refresh your token");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  },

  /**
   * GET request helper
   * @param {string} url - API endpoint URL
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  get: async (url, params = {}) => {
    const finalUrl =
      Object.keys(params).length > 0
        ? get().buildUrlWithParams(url, params)
        : url;
    return get().apiCall(finalUrl, { method: "GET" });
  },

  /**
   * POST request helper
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request body data
   * @returns {Promise} API response
   */
  post: async (url, data = {}) => {
    return get().apiCall(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request helper
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request body data
   * @returns {Promise} API response
   */
  put: async (url, data = {}) => {
    return get().apiCall(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request helper
   * @param {string} url - API endpoint URL
   * @returns {Promise} API response
   */
  delete: async (url) => {
    return get().apiCall(url, { method: "DELETE" });
  },

  // ============ ROUTE CATEGORIES FOR EASY ACCESS ============

  /**
   * Get all routes by category
   * @returns {Object} All routes organized by category
   */
  getAllRoutes: () => {
    const store = get();
    return {
      auth: store.auth,
      users: store.users,
      products: store.products,
      schools: store.schools,
      orders: store.orders,
    };
  },

  /**
   * Get public routes (no authentication required)
   * @returns {Object} Public routes
   */
  getPublicRoutes: () => {
    const store = get();
    return {
      auth: {
        register: store.auth.register,
        login: store.auth.login,
        forgotPassword: store.auth.forgotPassword,
        resetPassword: store.auth.resetPassword,
        verifyToken: store.auth.verifyToken,
      },
      products: {
        search: store.products.search,
        featured: store.products.featured,
        getById: store.products.getById,
        availability: store.products.availability,
        byCategory: store.products.byCategory,
        byBrand: store.products.byBrand,
        byType: store.products.byType,
        bySchool: store.products.bySchool,
      },
      schools: {
        search: store.schools.search,
        popular: store.schools.popular,
        nearby: store.schools.nearby,
        getById: store.schools.getById,
        catalog: store.schools.catalog,
        byCity: store.schools.byCity,
      },
    };
  },

  /**
   * Get protected routes (authentication required)
   * @returns {Object} Protected routes
   */
  getProtectedRoutes: () => {
    const store = get();
    return {
      auth: {
        logout: store.auth.logout,
        getProfile: store.auth.getProfile,
      },
      users: store.users,
      orders: store.orders,
    };
  },

  // ============ ENVIRONMENT HELPERS ============

  /**
   * Update API base URL (useful for different environments)
   * @param {string} newBaseUrl - New base URL
   */
  updateBaseUrl: (newBaseUrl) => {
    const newApiBase = `${newBaseUrl}${API_VERSION}`;
    set({
      baseUrl: newApiBase,
      auth: {
        register: `${newApiBase}/auth/register`,
        login: `${newApiBase}/auth/login`,
        logout: `${newApiBase}/auth/logout`,
        refreshToken: `${newApiBase}/auth/refresh-token`,
        forgotPassword: `${newApiBase}/auth/forgot-password`,
        resetPassword: `${newApiBase}/auth/reset-password`,
        verifyToken: `${newApiBase}/auth/verify-token`,
        getProfile: `${newApiBase}/auth/me`,
      },
      // Update other route categories...
      // (This would update all routes with the new base URL)
    });
  },

  /**
   * Check if API is available
   * @returns {Promise<boolean>} API availability status
   */
  checkApiHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error("API health check failed:", error);
      return false;
    }
  },
}));

export default useApiRoutesStore;

// Export route categories for direct import if needed
export const {
  auth: authRoutes,
  users: userRoutes,
  products: productRoutes,
  schools: schoolRoutes,
  orders: orderRoutes,
} = useApiRoutesStore.getState();
