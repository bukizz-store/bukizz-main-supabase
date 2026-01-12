/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useUserProfileStore from "../../store/userProfileStore";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { confirmEmailVerification } = useUserProfileStore();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link. Token is missing.");
            return;
        }

        const verify = async () => {
            try {
                await confirmEmailVerification(token);
                setStatus("success");
                setMessage("Email verified successfully! Redirecting...");
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            } catch (error) {
                setStatus("error");
                setMessage(error.message || "Failed to verify email. Link may be expired.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    {status === "verifying" && (
                        <div className="flex flex-col items-center justify-center">
                            <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Email</h2>
                            <p className="text-gray-600">{message}</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center justify-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Verified!</h2>
                            <p className="text-green-600 mb-4">{message}</p>
                            <button
                                onClick={() => navigate("/")}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Go to Home
                            </button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center justify-center">
                            <XCircle className="w-16 h-16 text-red-500 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                            <p className="text-red-600 mb-4">{message}</p>
                            <button
                                onClick={() => navigate("/")}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
