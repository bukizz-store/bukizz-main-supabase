import { useEffect } from "react";
import { supabase } from "../store/supabaseClient";
import useAuthStore from "../store/authStore";

/**
 * AuthProvider — lightweight wrapper that keeps Zustand's `user` field
 * in sync with the Supabase session.
 *
 * IMPORTANT: The **primary** onAuthStateChange listener that handles
 * the OAuth backend-exchange (Google / Apple → custom token) lives in
 * App.jsx.  This provider must NOT duplicate that work.  It only
 * mirrors the raw Supabase user into the store for components that
 * need it before the custom-token exchange completes.
 *
 * NOTE: As of this writing, AuthProvider is not mounted in the
 * component tree (App.jsx handles everything).  If you re-introduce
 * it, ensure there is no duplicate exchange logic.
 */
const AuthProvider = ({ children }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return children;
};
export default AuthProvider;
