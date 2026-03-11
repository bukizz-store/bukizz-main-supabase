import React from "react";
import useAuthStore from "../../store/authStore";
import { Apple } from "lucide-react";

const LoginAppleButton = () => {
    const { loginWithApple, loading } = useAuthStore();

    const handleAppleLogin = async () => {
        try {
            await loginWithApple();
        } catch (error) {
            console.error("Apple login error:", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleAppleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-black border border-black rounded-full px-6 py-3 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm"
        >
            <Apple className="w-5 h-5 fill-white" />
            <span>Continue with Apple</span>
        </button>
    );
};

export default LoginAppleButton;
