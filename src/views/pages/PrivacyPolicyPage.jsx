import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Privacy Policy</h1>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-gray-600">
                <p className="mb-4 leading-relaxed">
                    Your privacy is important to us. This policy explains how Bukizz collects, uses, and protects your personal information.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
                <p className="mb-4 leading-relaxed">
                    We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you create an account or place an order.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>To process and deliver your orders.</li>
                    <li>To communicate with you regarding your account and orders.</li>
                    <li>To improve our services and user experience.</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Sharing</h2>
                <p className="mb-4 leading-relaxed">
                    We do not sell your personal information. We may share data with trusted third-party service providers (e.g., shipping partners, payment gateways) solely for the purpose of fulfilling your orders.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Security</h2>
                <p className="leading-relaxed">
                    We employ security measures to protect your information from unauthorized access or disclosure.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
