import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import LoginGoogleButton from "./LoginGoogleButton";

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        login,
        signup,
        forgotPassword: forgotPasswordAction,
        clearError,
        redirectPath,
        setRedirectPath,
    } = useAuthStore();

    const { showError, showSuccess, showInfo } = useNotificationStore();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (forgotPassword) {
                await forgotPasswordAction(formData.email);
                showSuccess(
                    "Password Reset Email Sent",
                    "Please check your inbox and follow the instructions to reset your password.",
                    { duration: 6000 }
                );
                setForgotPassword(false);
                setFormData({ email: "", password: "", name: "" });
            } else if (isLogin) {
                await login(formData.email, formData.password);
                showSuccess("Welcome Back!", "You have been successfully logged in.", {
                    duration: 3000,
                });

                // Check for redirect immediately
                const currentRedirectPath = useAuthStore.getState().redirectPath;
                if (currentRedirectPath) {
                    console.log("Redirecting to:", currentRedirectPath);
                    navigate(currentRedirectPath);
                    setRedirectPath(null);
                    onClose();
                    return;
                }

                setTimeout(() => {
                    onClose();
                    setFormData({ email: "", password: "", name: "" });
                }, 1000);
            } else {
                await signup(formData.email, formData.password, formData.name);
                showSuccess(
                    "Registration Successful!",
                    "Please check your email for verification instructions.",
                    { duration: 6000 }
                );
                showInfo(
                    "Next Step",
                    "You can now log in with your credentials after email verification.",
                    { duration: 4000 }
                );
                setTimeout(() => {
                    setIsLogin(true);
                    setFormData({ email: formData.email, password: "", name: "" });
                }, 2000);
            }
        } catch (err) {
            const errorMessage = err.message || "An unexpected error occurred";

            // Show specific error messages based on error type
            if (
                errorMessage.toLowerCase().includes("invalid") ||
                errorMessage.toLowerCase().includes("credential") ||
                errorMessage.toLowerCase().includes("password")
            ) {
                showError(
                    "Invalid Credentials",
                    "Please check your email and password and try again."
                );
            } else if (
                errorMessage.toLowerCase().includes("email") &&
                errorMessage.toLowerCase().includes("exist")
            ) {
                showError(
                    "Email Already Exists",
                    "This email is already registered. Please try logging in instead."
                );
            } else if (
                errorMessage.toLowerCase().includes("network") ||
                errorMessage.toLowerCase().includes("fetch")
            ) {
                showError(
                    "Connection Error",
                    "Please check your internet connection and try again."
                );
            } else if (errorMessage.toLowerCase().includes("verification")) {
                showError(
                    "Email Verification Required",
                    "Please verify your email before logging in."
                );
            } else {
                showError("Authentication Failed", errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        onClose();
        setFormData({ email: "", password: "", name: "" });
        setForgotPassword(false);
        setIsLogin(true);
        clearError();
    };

    const switchMode = (loginMode) => {
        setIsLogin(loginMode);
        setForgotPassword(false);
    };

    const handleForgotPassword = () => {
        setForgotPassword(true);
    };

    const handleBackToLogin = () => {
        setForgotPassword(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden rounded-lg items-center justify-center ">
                {/* Form Section */}
                <div className="w-full md:w-1/2 p-8 bg-white rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                        <img src="/Logo.svg" alt="Bukizz Logo" className="h-10" />
                        <button
                            onClick={handleModalClose}
                            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {!forgotPassword && (
                        <div className="flex mb-6">
                            <button
                                type="button"
                                className={`flex-1 py-2 px-4 rounded-l-lg transition-colors ${isLogin
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                onClick={() => switchMode(true)}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 px-4 rounded-r-lg transition-colors ${!isLogin
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                onClick={() => switchMode(false)}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {forgotPassword && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Reset Password
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Enter your email address and we'll send you a link to reset your
                                password.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && !forgotPassword && (
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required={!isLogin}
                                    disabled={loading}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading}
                                placeholder="Enter your email"
                            />
                        </div>

                        {!forgotPassword && (
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={loading}
                                    placeholder="Enter your password"
                                    minLength={6}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-lg"
                        >
                            {isLogin && !loading && !forgotPassword && (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            )}
                            <span>
                                {loading
                                    ? "Loading..."
                                    : forgotPassword
                                        ? "Send Reset Email"
                                        : isLogin
                                            ? "Login"
                                            : "Sign Up"}
                            </span>
                        </button>
                    </form>

                    {!forgotPassword && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>
                            <LoginGoogleButton />
                        </>
                    )}

                    <div className="mt-4 text-center">
                        {forgotPassword ? (
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                                disabled={loading}
                            >
                                ← Back to Login
                            </button>
                        ) : (
                            <>
                                {isLogin && (
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                                        disabled={loading}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                                {!isLogin && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        By signing up, you agree to our Terms of Service and Privacy
                                        Policy.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Image Section */}
                {/* <div className="hidden md:block md:w-1/2 rounded-r-lg overflow-hidden">
                    <img
                        src="/login_model.svg"
                        alt="Login Illustration"
                        className="h-full w-full object-cover"
                    />
                </div> */}
            </div>
        </div>
    );
};

export default AuthModal;
