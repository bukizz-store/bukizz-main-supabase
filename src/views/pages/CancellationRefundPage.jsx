import React from 'react';

const CancellationRefundPage = () => {
    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Cancellation & Refund Policy</h1>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-gray-600">

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Cancellations</h2>
                <p className="mb-6 leading-relaxed">
                    You can cancel your order before it has been processed for shipping. To cancel, please visit the "Orders" section in your account or contact our customer support immediately. Once shipped, orders cannot be cancelled.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">Returns & Refunds</h2>
                <p className="mb-4 leading-relaxed">
                    We accept returns for damaged, defective, or incorrect items delivered.
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Return requests must be raised within 7 days of delivery.</li>
                    <li>Items must be unused and in their original packaging.</li>
                    <li>Refunds are processed to the original payment method after the return is verified at our warehouse.</li>
                </ul>
                <p className="leading-relaxed">
                    Please allow 5-7 business days for the refund to reflect in your account after processing.
                </p>
            </div>
        </div>
    );
};

export default CancellationRefundPage;
