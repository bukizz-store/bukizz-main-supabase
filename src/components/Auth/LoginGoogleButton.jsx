import React from "react";
import useAuthStore from "../../store/authStore";

const LoginGoogleButton = () => {
    const { loginWithGoogle, loading } = useAuthStore();

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Google login error:", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-full px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm"
        >
            <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                className="w-5 h-5"
            />
            <span>Continue with Google</span>
        </button>
    );
};

export default LoginGoogleButton;
