import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";

const OrderConfirmationPage = () => {
    const navigate = useNavigate();
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Fetch the animation data from the public folder
        fetch("/order_completed.json")
            .then((response) => response.json())
            .then((data) => setAnimationData(data))
            .catch((error) => console.error("Error loading animation:", error));

        // Redirect to home after 3 seconds
        const timer = setTimeout(() => {
            navigate("/");
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    if (!animationData) {
        return <div className="min-h-screen bg-white" />;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 flex flex-col items-center">
                <Lottie animationData={animationData} loop={false} className="w-64 h-64" />
                <p className="text-center text-2xl font-bold text-gray-800 mt-6 font-nunito">
                    Order Placed Successfully!
                </p>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
