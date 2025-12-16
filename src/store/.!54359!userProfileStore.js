import { create } from "zustand";

const useUserProfileStore = create((set, get) => ({
  // Existing state
  profile: null,
  addresses: [],
  preferences: null,
  stats: null,
  loading: false,
  error: null,

  // New state for customer functionality
  orders: [],
  orderStats: null,
  cart: { items: [] },
  wishlist: [],
  reviews: [],
  schools: [],
  nearbySchools: [],
  products: [],
  categories: [],
  brands: [],
  orderQueries: [],

  // Cache for preventing duplicate requests
  _requestCache: new Map(),
  _cacheTimeout: 1000, // 1 second cache timeout

  // Add product cache at the store level
  productCache: new Map(),

  // Helper method to create cache key
  _getCacheKey: (method, ...args) => {
    return `${method}:${JSON.stringify(args)}`;
  },

  // Helper method to check and set cache
  _getCachedRequest: (cacheKey) => {
    const cached = get()._requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < get()._cacheTimeout) {
      return cached.promise;
    }
    return null;
  },

  _setCachedRequest: (cacheKey, promise) => {
    get()._requestCache.set(cacheKey, {
      promise,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    setTimeout(() => {
      get()._requestCache.delete(cacheKey);
    }, get()._cacheTimeout);

    return promise;
  },

  // Get user profile
  getProfile: async () => {
    const cacheKey = get()._getCacheKey("getProfile");
    const cachedRequest = get()._getCachedRequest(cacheKey);
    if (cachedRequest) return cachedRequest;

    const promise = (async () => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("custom_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "http://localhost:3001/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const data = await response.json();
        set({
          profile: data.data.user,
          loading: false,
          error: null,
        });

        return data.data.user;
      } catch (error) {
        set({
          loading: false,
          error: error.message,
        });
        throw error;
      }
    })();

    return get()._setCachedRequest(cacheKey, promise);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Validate required fields based on server schema
      const validatedData = {};

      if (profileData.fullName) validatedData.fullName = profileData.fullName;
      if (profileData.phone) validatedData.phone = profileData.phone;
      if (profileData.dateOfBirth)
        validatedData.dateOfBirth = profileData.dateOfBirth;
      if (profileData.gender) validatedData.gender = profileData.gender;
      if (profileData.city) validatedData.city = profileData.city;
      if (profileData.state) validatedData.state = profileData.state;
      if (profileData.schoolId) validatedData.schoolId = profileData.schoolId;
      if (profileData.metadata) validatedData.metadata = profileData.metadata;

      const response = await fetch(
        "http://localhost:3001/api/v1/users/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      set({
        profile: data.data.user,
        loading: false,
        error: null,
      });

      return data.data.user;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get user addresses
  getAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://localhost:3001/api/users/addresses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch addresses");
      }

      const data = await response.json();
      set({
        addresses: data.data.addresses,
        loading: false,
        error: null,
      });

      return data.data.addresses;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Validate address data based on server schema
      const validatedAddress = {
        label: addressData.label || "Home", // Home, Work, School, Office, Other
        recipientName: addressData.recipientName,
        phone: addressData.phone,
        line1: addressData.line1,
        line2: addressData.line2,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country || "India",
        isDefault: addressData.isDefault || false,
        lat: addressData.lat,
        lng: addressData.lng,
      };

      const response = await fetch(
        "http://localhost:3001/api/v1/users/addresses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedAddress),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add address");
      }

      const data = await response.json();
      await get().getAddresses(); // Refresh addresses
      set({ loading: false, error: null });
      return data.data.address;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:3001/api/users/addresses/${addressId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update address");
      }

      const data = await response.json();

      // Refresh addresses
      await get().getAddresses();

      set({ loading: false, error: null });
      return data.data.address;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:3001/api/users/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete address");
      }

      // Refresh addresses
      await get().getAddresses();

      set({ loading: false, error: null });
      return true;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get user preferences
  getPreferences: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://localhost:3001/api/users/preferences",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch preferences");
      }

      const data = await response.json();
      set({
        preferences: data.data.preferences,
        loading: false,
        error: null,
      });

      return data.data.preferences;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Update preferences
  updatePreferences: async (preferencesData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://localhost:3001/api/users/preferences",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferencesData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update preferences");
      }

      const data = await response.json();
      set({
        preferences: data.data.preferences,
        loading: false,
        error: null,
      });

      return data.data.preferences;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get user statistics
  getStats: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:3001/api/users/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stats");
      }

      const data = await response.json();
      set({
        stats: data.data,
        loading: false,
        error: null,
      });

      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Verify email
  verifyEmail: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://localhost:3001/api/users/verify-email",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify email");
      }

      const data = await response.json();

      // Refresh profile to get updated verification status
      await get().getProfile();

      set({ loading: false, error: null });
      return data.message;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Clear profile data
  clearProfile: () => {
    set({
      profile: null,
      addresses: [],
      preferences: null,
      stats: null,
      loading: false,
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // ============ ORDER MANAGEMENT ============

  // Get user orders
  getOrders: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const url = `http://localhost:3001/api/v1/orders${
        queryParams.toString() ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }

      const data = await response.json();
      set({
        orders: data.data.orders || data.data,
        loading: false,
        error: null,
      });

      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Create order
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Validate order data based on server schema
      const validatedOrder = {
        items: orderData.items, // Array of { productId, variantId?, quantity }
        shippingAddress: {
          recipientName: orderData.shippingAddress.recipientName,
          phone: orderData.shippingAddress.phone,
          line1: orderData.shippingAddress.line1,
          line2: orderData.shippingAddress.line2,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postalCode: orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country || "India",
        },
        billingAddress: orderData.billingAddress,
        contactPhone: orderData.contactPhone,
        contactEmail: orderData.contactEmail,
        paymentMethod: orderData.paymentMethod,
      };

      const response = await fetch("http://localhost:3001/api/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedOrder),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      await get().getOrders(); // Refresh orders
      set({ loading: false, error: null });
      return data.data.order;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get order by ID
  getOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:3001/api/v1/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order");
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data.order;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:3001/api/v1/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel order");
      }

      const data = await response.json();
      await get().getOrders(); // Refresh orders
      set({ loading: false, error: null });
      return data.data.order;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://localhost:3001/api/v1/orders/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order stats");
      }

      const data = await response.json();
      set({
        orderStats: data.data,
        loading: false,
        error: null,
      });

      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // ============ PRODUCT MANAGEMENT ============

  // Search products
  searchProducts: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.brand) queryParams.append("brand", filters.brand);
      if (filters.productType)
        queryParams.append("productType", filters.productType);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (filters.schoolId) queryParams.append("schoolId", filters.schoolId);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const url = `http://localhost:3001/api/v1/products${
        queryParams.toString() ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products");
      }

      const data = await response.json();
      set({
        products: data.data.products || data.data,
        loading: false,
        error: null,
      });

      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get product by ID with caching
  getProduct: async (productId) => {
    const get = useUserProfileStore.getState;
    const set = useUserProfileStore.setState;

    // Check cache first
    if (get().productCache.has(productId)) {
      console.log("Returning cached product:", productId);
      return get().productCache.get(productId);
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/products/${productId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch product");
      }

      const data = await response.json();
      const product = data.data.product;

      // Enhanced product now includes images and brands by default
      console.log("Product fetched with enhanced data:", product);

      // Ensure we have proper fallbacks for the enhanced data
      if (!product.images) product.images = [];
      if (!product.mainImages) product.mainImages = [];
      if (!product.imagesByVariant) product.imagesByVariant = {};
      if (!product.brandDetails) product.brandDetails = product.brands || [];
      if (!product.primaryImage) {
        product.primaryImage =
          product.images.find((img) => img.isPrimary) ||
          product.images[0] ||
          null;
      }

      // Cache the enhanced product
      const cache = get().productCache;
      cache.set(productId, product);

      set({ loading: false, error: null, productCache: cache });
      return product;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get product variants
  getProductVariants: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/products/${productId}/variants`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch product variants"
        );
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data.variants || [];
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get product images
  getProductImages: async (productId, variantId = null) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (variantId) queryParams.append("variantId", variantId);

      const url = `http://localhost:3001/api/v1/products/${productId}/images${
        queryParams.toString() ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch product images");
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data.images || [];
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/products/featured?limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch featured products"
        );
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data.products;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // ============ SCHOOL MANAGEMENT ============

  // Search schools
  searchSchools: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.city) queryParams.append("city", filters.city);
      if (filters.state) queryParams.append("state", filters.state);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.board) queryParams.append("board", filters.board);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const url = `http://localhost:3001/api/v1/schools${
        queryParams.toString() ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch schools");
      }

      const data = await response.json();
      set({
        schools: data.data.schools || data.data,
        loading: false,
        error: null,
      });

      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get nearby schools
  getNearbySchools: async (lat, lng, radius = 10, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams({ lat, lng, radius, ...filters });
      const response = await fetch(
        `http://localhost:3001/api/v1/schools/nearby?${queryParams}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch nearby schools");
      }

      const data = await response.json();
      set({
        nearbySchools: data.data.schools,
        loading: false,
        error: null,
      });

      return data.data.schools;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get school by ID
  getSchool: async (schoolId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/schools/${schoolId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch school");
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data.school;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get school catalog
  getSchoolCatalog: async (schoolId, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams(filters);
      const url = `http://localhost:3001/api/v1/schools/${schoolId}/catalog${
        queryParams.toString() ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch school catalog");
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Clear school-related data (useful when switching between schools)
  clearSchoolData: () => {
    set({
      schools: [],
      nearbySchools: [],
      products: [],
      error: null,
    });

    // Clear request cache for school-related requests
    const cache = get()._requestCache;
    for (const [key] of cache) {
      if (key.includes("getSchool") || key.includes("getSchoolCatalog")) {
        cache.delete(key);
      }
    }
  },

  // ============ CART MANAGEMENT ============

  // Get cart
  getCart: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        set({ cart: { items: [] }, loading: false, error: null });
        return { items: [] };
      }

      const response = await fetch("http://localhost:3001/api/v1/orders/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // If cart endpoint doesn't exist, return empty cart
        set({ cart: { items: [] }, loading: false, error: null });
        return { items: [] };
      }

      const data = await response.json();
      set({
        cart: data.cart || { items: [] },
        loading: false,
        error: null,
      });

      return data.cart;
    } catch (error) {
      set({
        cart: { items: [] },
        loading: false,
        error: error.message,
      });
      return { items: [] };
    }
  },

  // ============ ORDER QUERIES/SUPPORT ============

  // Create order query
  createOrderQuery: async (orderId, queryData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const validatedQuery = {
        subject: queryData.subject,
        message: queryData.message,
        attachments: queryData.attachments || [],
      };

      const response = await fetch(
        `http://localhost:3001/api/v1/orders/${orderId}/queries`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedQuery),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order query");
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data.query;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Get order queries
  getOrderQueries: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:3001/api/v1/orders/${orderId}/queries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order queries");
      }

      const data = await response.json();
      set({
        orderQueries: data.data.queries,
        loading: false,
        error: null,
      });

      return data.data.queries;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // ============ UTILITY FUNCTIONS ============

  // Calculate order summary
  calculateOrderSummary: async (items) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/orders/calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to calculate order summary"
        );
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Check product availability
  checkProductAvailability: async (productId, variantId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams({ quantity });
      if (variantId) queryParams.append("variantId", variantId);

      const response = await fetch(
        `http://localhost:3001/api/v1/products/${productId}/availability?${queryParams}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check availability");
      }

      const data = await response.json();
      set({ loading: false, error: null });
      return data.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },
}));

export default useUserProfileStore;
