import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useApiRoutesStore from "./apiRoutesStore";
import { supabase } from "./supabaseClient";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      loading: true,
      isModalOpen: false,
      error: null,
      isHydrated: false, // Add flag to track hydration status
      redirectPath: null, // Path to redirect to after successful login

      // Basic setters
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
      setRedirectPath: (path) => set({ redirectPath: path }),
      clearError: () => set({ error: null }),
      setHydrated: () => set({ isHydrated: true }),

      // ...existing login method...
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const apiRoutes = useApiRoutesStore.getState();

          const response = await fetch(apiRoutes.auth.login, {
            method: "POST",
            headers: apiRoutes.getBasicHeaders(),
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || errorData.error || "Login failed"
            );
          }

          const data = await response.json();

          console.log("data", data);

          // Store tokens securely - handle both response structures
          const tokens = data.data || data;
          const user = tokens.user || data.user;

          const accessToken = tokens.accessToken || tokens.access_token || data.session?.access_token || data.token;
          const refreshToken = tokens.refreshToken || tokens.refresh_token || data.session?.refresh_token;

          if (accessToken) {
            localStorage.setItem("access_token", accessToken);
            localStorage.setItem("custom_token", accessToken);
          }

          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }

          if (user) {
            // Store user in Zustand persist (will automatically save to localStorage)
            set({ user, loading: false, error: null });
          }

          return data;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // ...existing signup method...
      signup: async (email, password, fullName) => {
        set({ loading: true, error: null });
        try {
          const apiRoutes = useApiRoutesStore.getState();

          const response = await fetch(apiRoutes.auth.register, {
            method: "POST",
            headers: apiRoutes.getBasicHeaders(),
            body: JSON.stringify({
              email,
              password,
              fullName: fullName || "User",
              name: fullName || "User",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || errorData.error || "Signup failed"
            );
          }

          const data = await response.json();
          set({ loading: false, error: null });

          return data;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // ...existing forgotPassword method...
      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const apiRoutes = useApiRoutesStore.getState();

          const response = await fetch(apiRoutes.auth.forgotPassword, {
            method: "POST",
            headers: apiRoutes.getBasicHeaders(),
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message ||
              errorData.error ||
              "Failed to send reset email"
            );
          }

          const data = await response.json();
          set({ loading: false, error: null });

          return data;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // ...existing resetPassword method...
      resetPassword: async (resetToken, newPassword) => {
        set({ loading: true, error: null });
        try {
          const apiRoutes = useApiRoutesStore.getState();

          const response = await fetch(apiRoutes.auth.resetPassword, {
            method: "POST",
            headers: apiRoutes.getBasicHeaders(),
            body: JSON.stringify({
              resetToken,
              newPassword,
              token: resetToken,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || errorData.error || "Password reset failed"
            );
          }

          const data = await response.json();
          set({ loading: false, error: null });

          return data;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          const apiRoutes = useApiRoutesStore.getState();
          const refreshToken = localStorage.getItem("refresh_token");

          // Attempt to logout on server
          if (refreshToken) {
            try {
              await fetch(apiRoutes.auth.logout, {
                method: "POST",
                cache: 'default',
                headers: apiRoutes.getAuthHeaders(),
                body: JSON.stringify({ refreshToken }),
              });
            } catch (error) {
              console.error("Server logout error:", error);
              // Continue with local logout even if server logout fails
            }
          }

          // Explicitly sign out from Supabase to prevent auto-login on refresh
          const { error } = await supabase.auth.signOut();
          if (error) console.error("Supabase signOut error:", error);

        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Always clean up local storage
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("custom_token");
          // Clear user from persist store (will automatically remove from localStorage)
          set({ user: null, loading: false, error: null });
          window.location.href = "/";
        }
      },

      // Shared promise for concurrent refresh requests (not persisted in store)
      _refreshPromise: null,

      // Robust refreshToken method with promise-based deduplication
      refreshToken: async () => {
        const state = get();

        // If a refresh is already in progress, return the existing promise
        // This ensures all concurrent 401 handlers share a single network request
        if (state._refreshPromise) {
          console.log("Token refresh already in progress, reusing promise...");
          return state._refreshPromise;
        }

        const refreshPromise = (async () => {
          try {
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await fetch(
              useApiRoutesStore.getState().auth.refreshToken,
              {
                method: "POST",
                cache: 'default',
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
              }
            );

            console.log("Refresh token response status:", response.status);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              const errorMessage = errorData.message || "Token refresh failed";

              // Only logout for definitive auth failures, not transient errors
              if (response.status === 401 || response.status === 403) {
                console.log("Refresh token invalid/expired, logging out");
                await get().logout();
              }

              throw new Error(errorMessage);
            }

            const data = await response.json();
            const tokens = data.data || data;

            // Update tokens in localStorage
            const newAccessToken = tokens.accessToken || tokens.access_token;
            const newRefreshToken = tokens.refreshToken || tokens.refresh_token;

            if (newAccessToken) {
              localStorage.setItem("access_token", newAccessToken);
              localStorage.setItem("custom_token", newAccessToken);
            }
            if (newRefreshToken) {
              localStorage.setItem("refresh_token", newRefreshToken);
            }

            console.log("Token refresh successful");
            return tokens;
          } catch (error) {
            console.error("Token refresh failed:", error);

            // Only logout for truly unrecoverable auth errors
            // Do NOT logout for network errors, server 500s, or transient failures
            if (
              error.message.includes("No refresh token available") ||
              error.message.includes("Invalid refresh token") ||
              error.message.includes("Refresh token expired")
            ) {
              console.log("Unrecoverable refresh error, logging out");
              await get().logout();
            }

            throw error;
          } finally {
            // Clear the shared promise so future refreshes can proceed
            set({ _refreshPromise: null });
          }
        })();

        // Store the promise in state so concurrent callers can reuse it
        set({ _refreshPromise: refreshPromise });

        return refreshPromise;
      },

      // ...existing verifyToken method...
      verifyToken: async (token) => {
        try {
          const apiRoutes = useApiRoutesStore.getState();

          const response = await fetch(apiRoutes.auth.verifyToken, {
            method: "POST",
            cache: 'default',
            headers: {
              ...apiRoutes.getBasicHeaders(),
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            return { valid: false };
          }

          const data = await response.json();
          return { valid: data.success, user: data.data?.user };
        } catch (error) {
          console.error("Token verification failed:", error);
          return { valid: false };
        }
      },

      loginWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}`,
              queryParams: {
                access_type: "offline",
                prompt: "consent",
              },
            },
          });
          if (error) throw error;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      handleGoogleCallback: async (session = null) => {
        set({ loading: true });
        console.log("handleGoogleCallback initiated", { hasSessionProvided: !!session });

        try {
          let activeSession = session;

          if (!activeSession) {
            console.log("No session provided, fetching from Supabase...");
            // 1. Get Supabase session
            const { data, error: sessionError } = await supabase.auth.getSession();
            activeSession = data?.session;

            if (sessionError || !activeSession) {
              console.error("Supabase session error or no session found:", sessionError);
              set({ loading: false });
              return;
            }
          }

          console.log("Active session found, exchanging with backend...");

          const apiRoutes = useApiRoutesStore.getState();

          // 2. Send Supabase token to backend
          const response = await fetch(apiRoutes.auth.googleLogin, {
            method: "POST",
            headers: apiRoutes.getBasicHeaders(),
            body: JSON.stringify({ token: activeSession.access_token }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Google login failed on backend");
          }

          const data = await response.json();
          console.log("Backend exchange successful");

          // 3. Store Backend Tokens
          const tokens = data.data || data;
          const user = tokens.user || data.user;

          const accessToken = tokens.accessToken || tokens.access_token;
          const refreshToken = tokens.refreshToken || tokens.refresh_token;

          if (accessToken) {
            localStorage.setItem("access_token", accessToken);
            localStorage.setItem("custom_token", accessToken);
          }
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }

          if (user) {
            set({ user, loading: false, error: null, isModalOpen: false });

            // Handle post-login redirect if path exists
            const redirectPath = get().redirectPath;
            if (redirectPath) {
              console.log("Redirecting to preserved path after Google login:", redirectPath);
              window.location.href = redirectPath;
              set({ redirectPath: null });
            }
          }

          // Clear URL fragment params to prevent loop
          if (window.location.hash) {
            console.log("Cleaning up URL hash");
            window.history.replaceState(null, '', window.location.pathname);
          }

          // Optional: Sign out from Supabase if we only want to keep backend session
          // await supabase.auth.signOut();

        } catch (error) {
          console.error("Google Callback Error:", error);
          set({ loading: false, error: error.message });
          // Clear URL fragment params to prevent loop or confuse user even on error
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      },

      checkAuth: async () => {
        console.log("Checking authentication status...");

        const token = localStorage.getItem("custom_token");
        const currentUser = get().user;

        console.log("Current state:", {
          hasToken: !!token,
          hasUser: !!currentUser,
        });

        // If we have both user and token from persist store, set loading to false immediately
        if (currentUser && token) {
          console.log("User found in persist store:", currentUser.email);
          set({ loading: false });

          // Skip background verification on initial load to prevent unnecessary refreshes
          // Only verify if the token is close to expiry or on user action
          return;
        }

        // If no token, user is not authenticated
        if (!token) {
          console.log("No authentication token found");
          set({ loading: false, user: null });
          return;
        }

        // If we have token but no user, verify with server
        set({ loading: true });
        try {
          const apiRoutes = useApiRoutesStore.getState();
          console.log("Verifying token with server...");

          const response = await fetch(apiRoutes.auth.getProfile, {
            cache: 'default',
            headers: apiRoutes.getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.data?.user || data.user;

            if (user) {
              console.log("Token valid, user authenticated:", user.email);
              set({ user, loading: false, error: null });
            } else {
              throw new Error("Invalid user data received");
            }
          } else if (response.status === 401) {
            console.log("Token expired, attempting refresh...");
            try {
              await get().refreshToken();
              // Don't recursively call checkAuth, just verify the new token works
              const newToken = localStorage.getItem("custom_token");
              if (newToken) {
                const verifyResponse = await fetch(apiRoutes.auth.getProfile, {
                  cache: 'default',
                  headers: {
                    ...apiRoutes.getBasicHeaders(),
                    Authorization: `Bearer ${newToken}`,
                  },
                });

                if (verifyResponse.ok) {
                  const userData = await verifyResponse.json();
                  const user = userData.data?.user || userData.user;
                  set({ user, loading: false, error: null });
                } else {
                  throw new Error("New token verification failed");
                }
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              // Only logout if it's a token-related error, not a network error
              if (!refreshError.message.includes("fetch")) {
                await get().logout();
              } else {
                // For network errors, just set loading to false but keep user data
                set({ loading: false });
              }
            }
          } else {
            console.log(`Authentication check failed: ${response.status}`);
            // For non-401 errors, don't logout - might be temporary server issues
            set({ loading: false });
          }
        } catch (error) {
          console.error("Authentication check error:", error);
          // For network errors, don't logout - just set loading to false
          set({ loading: false });
        }
      },

      // Utility methods
      isAuthenticated: () => {
        const state = get();
        return !!state.user && !!localStorage.getItem("custom_token");
      },

      getUser: () => get().user,

      getToken: () => localStorage.getItem("custom_token"),

      // Alias for backwards compatibility
      signOut: async () => {
        await get().logout();
      },

      // Fixed initialize method with timeout fallback
      initialize: async () => {
        console.log("Initialize called, waiting for hydration...");

        // Set a maximum wait time to prevent infinite loading
        const maxWaitTime = 3000; // 3 seconds max wait
        const startTime = Date.now();

        // Wait for persist hydration with timeout
        const waitForHydration = () => {
          return new Promise((resolve) => {
            const checkHydration = () => {
              const elapsed = Date.now() - startTime;

              if (get().isHydrated || elapsed > maxWaitTime) {
                if (elapsed > maxWaitTime) {
                  console.warn("Hydration timeout reached, proceeding anyway");
                  // Force set hydrated to true
                  set({ isHydrated: true });
                }
                resolve();
              } else {
                setTimeout(checkHydration, 50);
              }
            };
            checkHydration();
          });
        };

        try {
          await waitForHydration();
          console.log("Hydration completed, checking auth...");
          await get().checkAuth();
        } catch (error) {
          console.error("Initialize failed:", error);
          // Ensure loading is cleared even on error
          set({ loading: false });
        }
      },
    }),
    {
      name: "bukizz-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        redirectPath: state.redirectPath,
      }),
      onRehydrateStorage: () => {
        console.log("Starting rehydration...");
        // The inner callback receives (state, error). Use the store instance to set hydration flag.
        return (state, error) => {
          console.log("Rehydration callback called", { state: !!state, error });
          if (error) {
            console.error("Rehydration error:", error);
          }
          // Always mark as hydrated, even on error
          setTimeout(() => {
            console.log("Setting isHydrated to true");
            useAuthStore.setState({ isHydrated: true });
          }, 100);
        };
      },
      version: 1,
    }
  )
);

// Ensure hydration flag is set when persist finishes hydration (Zustand v4/v5 API)
try {
  if (
    useAuthStore.persist &&
    typeof useAuthStore.persist.onFinishHydration === "function"
  ) {
    useAuthStore.persist.onFinishHydration(() => {
      // Mark as hydrated if not already
      if (!useAuthStore.getState().isHydrated) {
        useAuthStore.setState({ isHydrated: true });
      }
    });
  }
} catch (e) {
  // Non-fatal; fallback handled via onRehydrateStorage
  console.warn("persist.onFinishHydration hook not available:", e);
}

// Immediate fallback - set hydrated after store creation
setTimeout(() => {
  if (!useAuthStore.getState().isHydrated) {
    console.log("Fallback: Setting isHydrated to true after 1 second");
    useAuthStore.setState({ isHydrated: true });
  }
}, 1000);

export default useAuthStore;
