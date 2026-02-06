import { create } from "zustand";

import useApiRoutesStore from "./apiRoutesStore";

const API_BASE_URL = useApiRoutesStore.getState().baseUrl;

const useAddressStore = create((set, get) => ({
  // State
  addresses: [],
  loading: false,
  error: null,
  selectedAddressId: null,

  // Geolocation state
  geoLoading: false,
  geoError: null,
  currentLocation: null,
  detectedAddress: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setGeoLoading: (geoLoading) => set({ geoLoading }),
  setGeoError: (geoError) => set({ geoError }),
  clearGeoError: () => set({ geoError: null }),

  // Enhanced geolocation with high accuracy
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      set({ geoLoading: true, geoError: null });

      // Try to get high-accuracy location first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            postalCode: position.coords.postalCode,
          };

          set({
            currentLocation: location,
            geoLoading: false,
            geoError: null,
          });

          resolve(location);
        },
        (error) => {
          // If high accuracy fails, try with lower accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                timestamp: position.timestamp,
                postalCode: position.coords.postalCode,
              };

              set({
                currentLocation: location,
                geoLoading: false,
                geoError: null,
              });

              resolve(location);
            },
            (fallbackError) => {
              let errorMessage = "Unable to get your location";

              switch (fallbackError.code) {
                case fallbackError.PERMISSION_DENIED:
                  errorMessage =
                    "Location access denied. Please allow location access and try again.";
                  break;
                case fallbackError.POSITION_UNAVAILABLE:
                  errorMessage =
                    "Location information unavailable. Please check your GPS settings.";
                  break;
                case fallbackError.TIMEOUT:
                  errorMessage =
                    "Location request timed out. Please try again.";
                  break;
                default:
                  errorMessage =
                    "An unknown error occurred while getting location.";
              }

              set({
                geoLoading: false,
                geoError: errorMessage,
              });

              reject(new Error(errorMessage));
            },
            {
              enableHighAccuracy: false, // Fallback with lower accuracy
              timeout: 15000,
              maximumAge: 600000, // 10 minutes
            }
          );
        },
        {
          enableHighAccuracy: true, // Try high accuracy first
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },

  // Enhanced reverse geocoding with multiple API fallbacks
  reverseGeocodeEnhanced: async (lat, lng) => {
    set({ geoLoading: true, geoError: null });

    // Try multiple APIs in order of preference
    const geocodingAPIs = [
      // Primary: Google Maps (Highest Precision)
      {
        name: "Google Maps",
        fn: () => get().reverseGeocodeGoogle(lat, lng, process.env.REACT_APP_GOOGLE_MAPS_API_KEY),
      },
      // Secondary: BigDataCloud (Free, good detail)
      {
        name: "BigDataCloud",
        fn: () => get().reverseGeocodeBigDataCloud(lat, lng),
      },
      // Tertiary: Nominatim (Free, OpenStreetMap)
      {
        name: "Nominatim",
        fn: () => get().reverseGeocodeNominatim(lat, lng),
      },
    ];

    for (const api of geocodingAPIs) {
      try {
        console.log(`Trying ${api.name} for reverse geocoding...`);
        const addressData = await api.fn();

        if (addressData && addressData.line1) {
          console.log(`Successfully got address from ${api.name}`);
          set({
            detectedAddress: addressData,
            geoLoading: false,
            geoError: null,
          });
          return addressData;
        }
      } catch (error) {
        console.warn(`${api.name} failed:`, error.message);
        // Continue to next API
      }
    }

    // If all APIs fail, return a basic address structure
    const fallbackAddress = {
      line1: "Please enter your address manually",
      line2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      lat: lat,
      lng: lng,

    };

    set({
      detectedAddress: fallbackAddress,
      geoLoading: false,
      geoError:
        "Could not automatically detect address. Please enter manually.",
    });

    return fallbackAddress;
  },

  // BigDataCloud API (most detailed, free)
  reverseGeocodeBigDataCloud: async (lat, lng) => {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error("BigDataCloud API request failed");
    }

    const data = await response.json();
    console.log("BigDataCloud response:", data);

    // Enhanced parsing for Indian addresses
    const addressData = {
      line1: get().buildAddressLine1(data),
      line2: get().buildAddressLine2(data),
      city:
        data.city ||
        data.locality ||
        data.localityInfo?.administrative?.[2]?.name ||
        "",
      state:
        data.principalSubdivision ||
        data.localityInfo?.administrative?.[1]?.name ||
        "",
      country: data.countryName || "India",
      postalCode: data.postcode || "",
      lat: lat,
      lng: lng,
      // Additional metadata for delivery precision
      neighborhood: data.localityInfo?.administrative?.[3]?.name || "",
      district: data.localityInfo?.administrative?.[2]?.name || "",
      subDistrict: data.localityInfo?.administrative?.[4]?.name || "",
      landmark: data.localityInfo?.informative?.[0]?.name || "",
    };

    return addressData;
  },

  // Nominatim API (OpenStreetMap, free)
  reverseGeocodeNominatim: async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Bukizz-DeliveryApp/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Nominatim API request failed");
    }

    const data = await response.json();

    if (!data.address) {
      throw new Error("No address data from Nominatim");
    }

    const addr = data.address;

    const addressData = {
      line1: get().buildNominatimAddressLine1(addr),
      line2: addr.neighbourhood || addr.suburb || addr.residential || "",
      city: addr.city || addr.town || addr.village || addr.municipality || "",
      state: addr.state || addr.state_district || "",
      country: addr.country || "India",
      postalCode: addr.postcode || "",
      lat: lat,
      lng: lng,
      // Additional details
      neighborhood: addr.neighbourhood || addr.suburb || "",
      district: addr.city_district || addr.county || "",
      landmark: addr.amenity || addr.shop || "",
    };

    return addressData;
  },

  // LocationIQ API (backup option)
  reverseGeocodeLocationIQ: async (lat, lng) => {
    // Note: This requires an API key for production use
    // For now, we'll use the free tier endpoint
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=demo&lat=${lat}&lon=${lng}&format=json&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error("LocationIQ API request failed");
    }

    const data = await response.json();

    if (!data.address) {
      throw new Error("No address data from LocationIQ");
    }

    const addr = data.address;

    const addressData = {
      line1:
        `${addr.house_number || ""} ${addr.road || addr.street || ""}`.trim() ||
        "Address Line 1",
      line2: addr.neighbourhood || addr.suburb || addr.quarter || "",
      city: addr.city || addr.town || addr.village || "",
      state: addr.state || "",
      country: addr.country || "India",
      postalCode: addr.postcode || "",
      lat: lat,
      lng: lng,
    };

    return addressData;
  },

  // Helper function to build detailed address line 1
  buildAddressLine1: (data) => {
    const components = [];

    // Add house number/building if available
    if (data.localityInfo?.administrative?.[4]?.name) {
      components.push(data.localityInfo.administrative[4].name);
    }

    // Add street/road
    if (data.locality) {
      components.push(data.locality);
    }

    // Add more specific locality info
    if (data.localityInfo?.administrative?.[3]?.name) {
      components.push(data.localityInfo.administrative[3].name);
    }

    return components.length > 0 ? components.join(", ") : "Address Line 1";
  },

  // Helper function to build address line 2 (area/locality)
  buildAddressLine2: (data) => {
    // Use administrative level 2 as area/locality
    return (
      data.localityInfo?.administrative?.[2]?.name ||
      data.localityInfo?.administrative?.[1]?.name ||
      ""
    );
  },

  // Helper for Nominatim address line 1
  buildNominatimAddressLine1: (addr) => {
    const components = [];

    if (addr.house_number) components.push(addr.house_number);
    if (addr.road) components.push(addr.road);
    if (addr.street) components.push(addr.street);

    return components.length > 0 ? components.join(" ") : "Address Line 1";
  },

  // Combined function to get current location and detailed address
  getCurrentLocationAndAddress: async (forceRefresh = false) => {
    try {
      // Get current location (high accuracy)
      const location = await get().getCurrentLocation();

      // Get detailed address using enhanced reverse geocoding
      const addressData = await get().reverseGeocodeEnhanced(
        location.lat,
        location.lng
      );

      console.log("Address data:", addressData);

      return {
        location,
        address: addressData,
      };
    } catch (error) {
      console.error("Error getting location and address:", error);
      throw error;
    }
  },

  // Google Maps reverse geocoding (for production with API key)
  reverseGeocodeGoogle: async (lat, lng, apiKey) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=street_address|premise|subpremise`
      );

      if (!response.ok) {
        throw new Error("Google Maps API request failed");
      }

      const data = await response.json();

      if (data.status !== "OK" || !data.results.length) {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      const result = data.results[0];
      const components = result.address_components;

      // Enhanced parsing for Indian addresses
      const getComponent = (types) => {
        const component = components.find((c) =>
          c.types.some((type) => types.includes(type))
        );
        return component ? component.long_name : "";
      };

      const getShortComponent = (types) => {
        const component = components.find((c) =>
          c.types.some((type) => types.includes(type))
        );
        return component ? component.short_name : "";
      };

      // Precise mapping
      const houseNumber = getComponent(["street_number", "premise", "subpremise"]);
      const route = getComponent(["route"]);
      const sublocality = getComponent(["sublocality_level_2", "sublocality_level_1", "sublocality", "neighborhood"]);
      const landmarkComponent = getComponent(["point_of_interest", "establishment", "park"]);

      const addressData = {
        line1: houseNumber ? `${houseNumber}, ${route}` : (route || sublocality || "Address"),
        line2: sublocality,
        city: getComponent(["locality", "administrative_area_level_2"]) || "",
        state: getComponent(["administrative_area_level_1"]) || "",
        country: getComponent(["country"]) || "India",
        postalCode: getComponent(["postal_code"]) || "",
        lat: lat,
        lng: lng,
        // Extract specific fields for form pre-filling
        houseNumber: houseNumber, // Export specifically for UI
        street: route,
        landmark: landmarkComponent, // Export landmark
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };

      return addressData;
    } catch (error) {
      console.error("Google reverse geocoding error:", error);
      throw error;
    }
  },

  // Get all addresses
  fetchAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        set({ loading: false, error: null });
        return [];
      }

      const response = await fetch(
        `${API_BASE_URL}/users/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Handle token refresh errors gracefully
        if (response.status === 401 || errorData.message?.includes("token")) {
          console.log("Token expired, attempting refresh...");

          try {
            // Import auth store dynamically to avoid circular dependencies
            const { default: useAuthStore } = await import("./authStore.js");
            await useAuthStore.getState().refreshToken();

            console.log("Token refreshed successfully, retrying request...");

            // Retry the request with new token
            const newToken = localStorage.getItem("custom_token");
            const retryResponse = await fetch(
              `${API_BASE_URL}/users/addresses`,
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              const addresses = retryData.data.addresses || [];

              // Set the first address as selected if none is selected
              const selectedId = get().selectedAddressId;
              if (!selectedId && addresses.length > 0) {
                set({ selectedAddressId: addresses[0].id });
              }

              set({
                addresses,
                loading: false,
                error: null,
              });

              return addresses;
            } else {
              throw new Error("Failed to fetch addresses after token refresh");
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            set({
              loading: false,
              error: "Session expired. Please login again.",
            });
            return [];
          }
        }

        throw new Error(errorData.message || "Failed to fetch addresses");
      }

      const data = await response.json();
      const addresses = data.data.addresses || [];

      // Set the first address as selected if none is selected
      const selectedId = get().selectedAddressId;
      if (!selectedId && addresses.length > 0) {
        set({ selectedAddressId: addresses[0].id });
      }

      set({
        addresses,
        loading: false,
        error: null,
      });

      return addresses;
    } catch (error) {
      // Handle network errors gracefully
      if (
        error.message?.includes("fetch") ||
        error.message?.includes("network")
      ) {
        set({
          loading: false,
          error: "Connection issue. Please check your internet and try again.",
        });
      } else {
        set({
          loading: false,
          error: error.message,
        });
      }
      throw error;
    }
  },

  // Add new address with enhanced validation
  addAddress: async (addressData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("custom_token");
      if (!token) {
        set({ loading: false, error: null });
        return null;
      }

      // Validate required fields
      const requiredFields = [
        "label",
        "line1",
        "city",
        "state",
        "country",
        "postalCode",
      ];
      for (const field of requiredFields) {
        if (!addressData[field] || !addressData[field].toString().trim()) {
          throw new Error(`${field} is required`);
        }
      }

      // Include all geolocation data if provided
      const addressPayload = {
        ...addressData,
        ...(addressData.lat &&
          addressData.lng && {
          lat: parseFloat(addressData.lat),
          lng: parseFloat(addressData.lng),
        }),
        // Include additional metadata if available
        ...(addressData.neighborhood && {
          neighborhood: addressData.neighborhood,
        }),
        ...(addressData.district && { district: addressData.district }),
        ...(addressData.landmark && { landmark: addressData.landmark }),
        ...(addressData.formattedAddress && {
          formattedAddress: addressData.formattedAddress,
        }),
        ...(addressData.placeId && { placeId: addressData.placeId }),
      };

      const response = await fetch(
        `${API_BASE_URL}/users/addresses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add address");
      }

      const data = await response.json();
      const newAddress = data.data.address;

      set((state) => ({
        addresses: [...state.addresses, newAddress],
        selectedAddressId: newAddress.id,
        loading: false,
        error: null,
      }));

      return newAddress;
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
        set({ loading: false, error: null });
        return null;
      }

      // Include all geolocation data if provided
      const addressPayload = {
        ...addressData,
        ...(addressData.lat &&
          addressData.lng && {
          lat: parseFloat(addressData.lat),
          lng: parseFloat(addressData.lng),
        }),
        // Include additional metadata if available
        ...(addressData.neighborhood && {
          neighborhood: addressData.neighborhood,
        }),
        ...(addressData.district && { district: addressData.district }),
        ...(addressData.landmark && { landmark: addressData.landmark }),
        ...(addressData.formattedAddress && {
          formattedAddress: addressData.formattedAddress,
        }),
        ...(addressData.placeId && { placeId: addressData.placeId }),
      };

      const response = await fetch(
        `${API_BASE_URL}/users/addresses/${addressId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update address");
      }

      const data = await response.json();
      const updatedAddress = data.data.address;

      set((state) => ({
        addresses: state.addresses.map((addr) =>
          addr.id === addressId ? updatedAddress : addr
        ),
        loading: false,
        error: null,
      }));

      return updatedAddress;
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
        set({ loading: false, error: null });
        return null;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/addresses/${addressId}`,
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

      set((state) => {
        const remainingAddresses = state.addresses.filter(
          (addr) => addr.id !== addressId
        );
        const newSelectedId =
          state.selectedAddressId === addressId && remainingAddresses.length > 0
            ? remainingAddresses[0].id
            : state.selectedAddressId === addressId
              ? null
              : state.selectedAddressId;

        return {
          addresses: remainingAddresses,
          selectedAddressId: newSelectedId,
          loading: false,
          error: null,
        };
      });

      return true;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Select address
  selectAddress: (addressId) => {
    set({ selectedAddressId: addressId });
  },

  // Get selected address
  getSelectedAddress: () => {
    const { addresses, selectedAddressId } = get();
    return addresses.find((addr) => addr.id === selectedAddressId) || null;
  },

  // Clear all data
  clear: () => {
    set({
      addresses: [],
      loading: false,
      error: null,
      selectedAddressId: null,
      geoLoading: false,
      geoError: null,
      currentLocation: null,
      detectedAddress: null,
    });
  },
}));

export default useAddressStore;
