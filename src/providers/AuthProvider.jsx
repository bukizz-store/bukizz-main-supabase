import { useEffect } from "react";
import { supabase } from "../store/supabaseClient";
import useAuthStore from "../store/authStore";

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
