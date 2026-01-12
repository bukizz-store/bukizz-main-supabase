import React from 'react';

const ShippingPolicyPage = () => {
    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Shipping Policy</h1>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-gray-600">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Delivery Timelines</h2>
                <p className="mb-4 leading-relaxed">
                    We strive to deliver your orders as quickly as possible. Standard delivery typically takes 3-7 business days, depending on your location.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Shipping Charges</h2>
                <p className="mb-4 leading-relaxed">
                    Shipping charges may apply based on the order value and delivery location. Any applicable shipping fees will be displayed at checkout before you complete your purchase.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Tracking Your Order</h2>
                <p className="leading-relaxed">
                    Once your order is shipped, you will receive a tracking link via email and SMS. You can also track your order status from the "Orders" section in your profile.
                </p>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;
