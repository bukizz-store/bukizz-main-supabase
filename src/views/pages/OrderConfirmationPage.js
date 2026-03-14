import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import HomeCarousel from "../../components/Sections/HomeCarousel";
import useCityStore from "../../store/cityStore";

const OrderConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedCity } = useCityStore();
    const [animationData, setAnimationData] = useState(null);
    const order = location.state?.order;

    useEffect(() => {
        // Fetch the animation data from the public folder
        fetch("/order_completed.json")
            .then((response) => response.json())
            .then((data) => setAnimationData(data))
            .catch((error) => console.error("Error loading animation:", error));

        // Redirect to home after 8 seconds
        const timer = setTimeout(() => {
            navigate("/");
        }, 100000);

        return () => clearTimeout(timer);
    }, [navigate]);

    if (!animationData) {
        return <div className="min-h-screen bg-white" />;
    }

    return (
        <div className="min-h-screen bg-[#F3F8FF] flex flex-col items-center py-4 px-4 font-nunito overflow-y-auto">
            <div className="w-full max-w-4xl flex flex-col items-center">
                {/* Success Animation and Message */}
                <div className="flex flex-col items-center mb-8">
                    <Lottie animationData={animationData} loop={false} className="w-48 h-48 md:w-64 md:h-64" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a202c] text-center">
                        Congratulations!
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-blue-600 mt-2 text-center">
                        Order Placed Successfully
                    </p>
                    {/* {(order?.orderNumber || order?.id) && (
                        <p className="text-gray-500 mt-2 font-semibold">Order ID: #{order.orderNumber || order.id}</p>
                    )} */}
                </div>

                {/* Order Details (Name and Quantity) */}
                {order?.items && order.items.length > 0 && (
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex-1 pr-4">
                                        <p className="text-gray-800 font-medium line-clamp-1">
                                            {item.productSnapshot?.title || item.title || item.productDetails?.title}
                                        </p>
                                        <p className="text-gray-500 text-sm">{item.variantDetails?.variantDescription || item.productSnapshot?.variantDescription || ""}</p>
                                    </div>
                                    <div className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">
                                        Qty: {item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="w-full mb-8">
                    <HomeCarousel page="order_confirmation,order_placed" city={selectedCity} />
                </div>

                {/* App Download Section */}
                <div className="w-full bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-[#1a202c] mb-2 text-center">Get the Bukizz App</h2>
                    {/* <p className="text-gray-600 mb-6 text-center max-w-md italic">
                        Track your orders and explore more school essentials directly from your phone.
                    </p> */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        {/* Play Store Button */}
                        <a
                            href="https://play.google.com/store/apps/details?id=com.bukizz.main&hl=en_IN"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                            </svg>
                            <div className="text-left leading-none">
                                <div className="text-[10px] uppercase font-semibold text-gray-300">Get it on</div>
                                <div className="text-lg font-bold">Google Play</div>
                            </div>
                        </a>

                        {/* App Store Button */}
                        <a
                            href="#"
                            className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl border border-gray-200 hover:scale-[1.02] transition-transform shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 pl-0.5 pb-0.5" viewBox="0 0 384 512" fill="currentColor">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                            <div className="text-left leading-none">
                                <div className="text-[10px] uppercase font-semibold text-gray-500">Download on the</div>
                                <div className="text-lg font-bold">App Store</div>
                            </div>
                        </a>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="text-blue-600 font-bold hover:underline"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
