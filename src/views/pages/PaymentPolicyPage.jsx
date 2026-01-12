import React from 'react';

const PaymentPolicyPage = () => {
    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Payment Policy</h1>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-gray-600">
                <p className="mb-4 leading-relaxed">
                    At Bukizz, we offer a variety of secure payment methods to ensure a smooth checkout experience.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Accepted Payment Methods</h2>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                    <li>Credit and Debit Cards (Visa, Mastercard, RuPay)</li>
                    <li>Net Banking</li>
                    <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                    <li>Wallets</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Security</h2>
                <p className="leading-relaxed">
                    Your payment information is vital to us. We use industry-standard encryption and secure payment gateways to protect your data. Bukizz does not store your card details on our servers.
                </p>
            </div>
        </div>
    );
};

export default PaymentPolicyPage;
