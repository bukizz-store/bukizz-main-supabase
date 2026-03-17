import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import HomeCarousel from "../../components/Sections/HomeCarousel";
import useCityStore from "../../store/cityStore";
import AppDownloadSlider from "../../components/Common/AppDownloadSlider";

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
        }, 6000);

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

                {/* App Download Section */}
                <div className="w-full bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-[#1a202c] mb-2 text-center">Get the Bukizz App</h2>
                    {/* <p className="text-gray-600 mb-6 text-center max-w-md italic">
                        Track your orders and explore more school essentials directly from your phone.
                    </p> */}
                    <AppDownloadSlider />
                </div>

                                <div className="w-full mb-8">
                    <HomeCarousel page="order_confirmation,order_placed" city={selectedCity} />
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
