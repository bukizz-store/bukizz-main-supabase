import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NotificationSection = () => {
    const [isMobileApp, setIsMobileApp] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const isApp = localStorage.getItem("isMobileApp") === "true" ||
                window.location.search.includes("mode=webview");
            const isMobileScreen = window.innerWidth < 768;
            setIsMobileApp(isApp || isMobileScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-sm min-h-[600px] flex flex-col">
            {/* Header */}
            <div className={`flex items-center p-4 ${isMobileApp ? 'border-b border-gray-100' : ''}`}>
                {isMobileApp && (
                    <button onClick={() => window.history.back()} className="mr-3">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                )}
                <h2 className={`${isMobileApp ? "text-lg" : "text-2xl"} font-bold text-gray-900`}>
                    All Notifications
                </h2>
            </div>

            {/* Content centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {/* Icon Circle */}
                <div className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="w-40 h-40 bg-blue-50/50 rounded-full flex items-center justify-center absolute animate-pulse"></div>
                    <img
                        src="/icons/bell.svg"
                        alt="No Notifications"
                        className="w-24 h-24 text-blue-400 opacity-80"
                    />
                </div>

                {/* Text Content */}
                <h2 className="text-2xl font-bold text-[#0056D2] mb-3 text-center">
                    No Notifications Yet
                </h2>

                <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
                    No news yet, but stay tuned for updates, alerts, and more!
                </p>

                {/* Action Button */}
                <Link
                    to="/"
                    className="px-12 py-3 border-2 border-[#0056D2] text-[#0056D2] rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotificationSection;
