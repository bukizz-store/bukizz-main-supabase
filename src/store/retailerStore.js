import { create } from "zustand";
import useApiRoutesStore from "./apiRoutesStore";
import useAuthStore from "./authStore";

const useRetailerStore = create((set, get) => ({
    loading: false,
    error: null,
    retailerProfile: null,

    // Setters
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    /**
     * Create or update retailer profile
     * @param {FormData} formData - FormData object containing fields and file
     */
    createRetailerProfile: async (formData) => {
        set({ loading: true, error: null });
        try {
            const apiRoutes = useApiRoutesStore.getState();
            const token = useAuthStore.getState().getToken();

            const response = await fetch(apiRoutes.retailer.createProfile, {
                method: "POST",
                cache: 'default',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Content-Type is string not set manually for FormData to allow browser to set boundary
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to save retailer profile");
            }

            const data = await response.json();
            set({ retailerProfile: data.data, loading: false });
            return data;
        } catch (error) {
            console.error("Retailer profile save error:", error);
            set({ loading: false, error: error.message });
            throw error;
        }
    },

    /**
     * Get retailer profile
     */
    getRetailerProfile: async () => {
        set({ loading: true, error: null });
        try {
            const apiRoutes = useApiRoutesStore.getState();
            const token = useAuthStore.getState().getToken();

            const response = await fetch(apiRoutes.retailer.getProfile, {
                method: "GET",
                cache: 'default',
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    set({ retailerProfile: null, loading: false });
                    return null;
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to fetch retailer profile");
            }

            const data = await response.json();
            set({ retailerProfile: data.data, loading: false });
            return data.data;
        } catch (error) {
            console.error("Fetch retailer profile error:", error);
            set({ loading: false, error: error.message });
            // Don't throw for getProfile, just set error
        }
    },
}));

export default useRetailerStore;
