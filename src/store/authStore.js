import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useApiRoutesStore from "./apiRoutesStore";
import { supabase } from "./supabaseClient";

/**
 * Safely stores auth tokens in localStorage with verification
 * Ensures tokens are actually persisted before returning success
 */
/**
 * Module-level flag to prevent duplicate OAuth backend exchanges.
 * Both onAuthStateChange(INITIAL_SESSION) and checkAuth() can detect
 * a Supabase session simultaneously — this guard deduplicates them.
 */
let _oauthExchangeInProgress = false;

const __saveTokensSafely = (accessToken, refreshToken) => {
  try {
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("custom_token", accessToken);

      // Verify save was successful
      const savedAccess = localStorage.getItem("access_token");
      const savedCustom = localStorage.getItem("custom_token");
      if (savedAccess !== accessToken || savedCustom !== accessToken) {
        throw new Error("Token save verification failed");
      }
    }

    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
      const savedRefresh = localStorage.getItem("refresh_token");
      if (savedRefresh !== refreshToken) {
        throw new Error("Refresh token save verification failed");
      }
    }

    console.log("✅ Tokens saved and verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to save tokens securely:", error);
    return false;
  }
};

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

      // Convenience: captures current URL and opens auth modal
      openAuthModal: () => {
        const currentPath = window.location.pathname + window.location.search;
        set({ redirectPath: currentPath, isModalOpen: true });
      },

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
        set({ loading: true, error: null, isModalOpen: false });
        try {
          // Dynamically capture the user's current origin (e.g. https://www.bukizz.in
          // or https://bukizz.in) so Supabase redirects back to the exact subdomain
          // the login was initiated from.  window.location.origin never includes a
          // trailing slash, so no normalisation is needed.
          const redirectOrigin = window.location.origin;

          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectOrigin,
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
        // Prevent duplicate backend exchanges when both onAuthStateChange and
        // checkAuth detect the same Supabase session simultaneously.
        if (_oauthExchangeInProgress) {
          console.log("⏳ Google OAuth exchange already in progress, skipping duplicate call");
          return;
        }
        _oauthExchangeInProgress = true;

        set({ loading: true, error: null });
        console.log("🔐 handleGoogleCallback initiated", { hasSessionProvided: !!session });

        const MAX_RETRIES = 3;
        let retryCount = 0;

        const attemptBackendExchange = async () => {
          try {
            let activeSession = session;

            if (!activeSession) {
              console.log("📋 No session provided, fetching from Supabase...");
              const { data, error: sessionError } = await supabase.auth.getSession();
              activeSession = data?.session;

              if (sessionError || !activeSession) {
                console.error("❌ Supabase session error or no session found:", sessionError);
                throw new Error("No valid Supabase session found");
              }
            }

            console.log("🔄 Active session found, exchanging with backend...");
            const apiRoutes = useApiRoutesStore.getState();

            const response = await fetch(apiRoutes.auth.googleLogin, {
              method: "POST",
              headers: apiRoutes.getBasicHeaders(),
              body: JSON.stringify({ token: activeSession.access_token }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Backend exchange failed: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Backend exchange successful");

            const tokens = data.data || data;
            const user = tokens.user || data.user;
            const accessToken = tokens.accessToken || tokens.access_token;
            const refreshToken = tokens.refreshToken || tokens.refresh_token;

            // Critically: Verify tokens are saved to localStorage BEFORE proceeding
            if (!accessToken) {
              throw new Error("No access token received from backend");
            }

            const tokensSaved = __saveTokensSafely(accessToken, refreshToken);
            if (!tokensSaved) {
              throw new Error("Failed to persist tokens to localStorage");
            }

            // Verify tokens are actually in localStorage
            const verifyAccessToken = localStorage.getItem("custom_token");
            if (verifyAccessToken !== accessToken) {
              throw new Error("Token persistence verification failed");
            }

            if (!user) {
              throw new Error("No user data in backend response");
            }

            console.log("👤 User authenticated:", user.email);
            set({ user, loading: false, error: null, isModalOpen: false });

            // Handle post-login redirect AFTER tokens are confirmed
            const redirectPath = get().redirectPath;
            if (redirectPath) {
              console.log("🔗 Redirecting to:", redirectPath);
              window.location.href = redirectPath;
              set({ redirectPath: null });
            }

            return true; // Success
          } catch (error) {
            console.error(`❌ Attempt ${retryCount + 1}/${MAX_RETRIES} failed:`, error.message);
            throw error;
          }
        };

        try {
          // Attempt backend exchange with retries
          while (retryCount < MAX_RETRIES) {
            try {
              await attemptBackendExchange();
              break; // Success, exit retry loop
            } catch (error) {
              retryCount++;
              if (retryCount >= MAX_RETRIES) {
                throw error; // Final attempt failed
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }

          // Clean up URL fragment
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (error) {
          console.error("💥 Google Authentication Failed:", error.message);
          set({ loading: false, error: error.message || "Google authentication failed. Please try again." });
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } finally {
          _oauthExchangeInProgress = false;
        }
      },

      loginWithApple: async () => {
        set({ loading: true, error: null, isModalOpen: false });
        try {
          // Same dynamic-origin approach as Google — keeps users on the
          // exact subdomain (www / non-www) they initiated login from.
          const redirectOrigin = window.location.origin;

          const { error } = await supabase.auth.signInWithOAuth({
            provider: "apple",
            options: {
              redirectTo: redirectOrigin,
            },
          });
          if (error) throw error;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      handleAppleCallback: async (session = null) => {
        // Prevent duplicate backend exchanges (same guard as Google).
        if (_oauthExchangeInProgress) {
          console.log("⏳ Apple OAuth exchange already in progress, skipping duplicate call");
          return;
        }
        _oauthExchangeInProgress = true;

        set({ loading: true, error: null });
        console.log("🍎 handleAppleCallback initiated", { hasSessionProvided: !!session });

        const MAX_RETRIES = 3;
        let retryCount = 0;

        const attemptBackendExchange = async () => {
          try {
            let activeSession = session;

            if (!activeSession) {
              console.log("📋 No session provided, fetching from Supabase...");
              const { data, error: sessionError } = await supabase.auth.getSession();
              activeSession = data?.session;

              if (sessionError || !activeSession) {
                console.error("❌ Supabase session error or no session found:", sessionError);
                throw new Error("No valid Supabase session found");
              }
            }

            console.log("🔄 Active session found, exchanging with backend...");
            const apiRoutes = useApiRoutesStore.getState();

            const response = await fetch(apiRoutes.auth.appleLogin, {
              method: "POST",
              headers: apiRoutes.getBasicHeaders(),
              body: JSON.stringify({ token: activeSession.access_token }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Backend exchange failed: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Backend exchange successful");

            const tokens = data.data || data;
            const user = tokens.user || data.user;
            const accessToken = tokens.accessToken || tokens.access_token;
            const refreshToken = tokens.refreshToken || tokens.refresh_token;

            // Critically: Verify tokens are saved to localStorage BEFORE proceeding
            if (!accessToken) {
              throw new Error("No access token received from backend");
            }

            const tokensSaved = __saveTokensSafely(accessToken, refreshToken);
            if (!tokensSaved) {
              throw new Error("Failed to persist tokens to localStorage");
            }

            // Verify tokens are actually in localStorage
            const verifyAccessToken = localStorage.getItem("custom_token");
            if (verifyAccessToken !== accessToken) {
              throw new Error("Token persistence verification failed");
            }

            if (!user) {
              throw new Error("No user data in backend response");
            }

            console.log("👤 User authenticated:", user.email);
            set({ user, loading: false, error: null, isModalOpen: false });

            // Handle post-login redirect AFTER tokens are confirmed
            const redirectPath = get().redirectPath;
            if (redirectPath) {
              console.log("🔗 Redirecting to:", redirectPath);
              window.location.href = redirectPath;
              set({ redirectPath: null });
            }

            return true; // Success
          } catch (error) {
            console.error(`❌ Attempt ${retryCount + 1}/${MAX_RETRIES} failed:`, error.message);
            throw error;
          }
        };

        try {
          // Attempt backend exchange with retries
          while (retryCount < MAX_RETRIES) {
            try {
              await attemptBackendExchange();
              break; // Success, exit retry loop
            } catch (error) {
              retryCount++;
              if (retryCount >= MAX_RETRIES) {
                throw error; // Final attempt failed
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }

          // Clean up URL fragment
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (error) {
          console.error("💥 Apple Authentication Failed:", error.message);
          set({ loading: false, error: error.message || "Apple authentication failed. Please try again." });
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } finally {
          _oauthExchangeInProgress = false;
        }
      },

      checkAuth: async () => {
        console.log("🔍 Checking authentication status...");

        const token = localStorage.getItem("custom_token");
        const currentUser = get().user;

        console.log("📊 Current auth state:", {
          hasToken: !!token,
          hasUser: !!currentUser,
          userEmail: currentUser?.email || "none",
        });

        // If we have both user and token from persist store, set loading to false immediately
        if (currentUser && token) {
          console.log("User found in persist store:", currentUser.email);
          set({ loading: false });

          // Skip background verification on initial load to prevent unnecessary refreshes
          // Only verify if the token is close to expiry or on user action
          return;
        }

        // If no custom token, try to recover session from Supabase
        // This handles cases where custom_token was lost (browser cleanup, domain change, etc.)
        // but Supabase still has a valid session from the Google/Apple OAuth flow
        if (!token) {
          // If the onAuthStateChange listener is already handling an exchange,
          // wait a short moment for it to finish rather than firing a duplicate.
          if (_oauthExchangeInProgress) {
            console.log("⏳ OAuth exchange already in-flight (via onAuthStateChange), waiting...");
            // Poll until the exchange completes (max ~5 s)
            const waitStart = Date.now();
            while (_oauthExchangeInProgress && Date.now() - waitStart < 5000) {
              await new Promise(r => setTimeout(r, 200));
            }
            // Re-check after waiting — the exchange may have succeeded
            if (get().user && localStorage.getItem("custom_token")) {
              console.log("✅ Session established by onAuthStateChange while we waited");
              set({ loading: false });
              return;
            }
          }

          console.log("No custom token found, attempting Supabase session recovery...");
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              console.log("Found valid Supabase session, re-syncing with backend...");
              const provider = session?.user?.app_metadata?.provider;
              if (provider === 'apple') {
                await get().handleAppleCallback(session);
              } else {
                await get().handleGoogleCallback(session);
              }
              // If recovery succeeded, we're done
              if (get().user && localStorage.getItem("custom_token")) {
                console.log("Session recovery from Supabase successful");
                return;
              }
            }
          } catch (recoveryError) {
            console.warn("Supabase session recovery failed:", recoveryError.message);
          }

          console.log("No authentication token found and no Supabase session to recover from");
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
        const hasToken = !!localStorage.getItem("custom_token");
        const hasUser = !!state.user;
        
        // Both user state AND token must exist
        if (!hasUser || !hasToken) {
          console.log("🔒 Auth check:", { hasUser, hasToken });
        }
        
        return hasUser && hasToken;
      },

      getUser: () => get().user,

      getToken: () => {
        const token = localStorage.getItem("custom_token");
        if (!token) {
          console.warn("⚠️ Attempted to get token but none found in localStorage");
        }
        return token;
      },

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
        // Persist token metadata to verify authenticity on rehydration
        _tokenMetadata: state.user ? {
          hasTokens: !!localStorage.getItem("custom_token"),
          tokenType: localStorage.getItem("custom_token") ? "oauth" : "local",
          timestamp: Date.now(),
        } : null,
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
