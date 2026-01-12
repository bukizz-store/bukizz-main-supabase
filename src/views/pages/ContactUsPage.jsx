import React from 'react';

const ContactUsPage = () => {
    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Contact Us</h1>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-6 leading-relaxed">
                    We'd love to hear from you! If you have any questions, feedback, or need support, please don't hesitate to reach out.
                </p>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Address</h2>
                        <p className="text-gray-600">
                            Wisdom Rd, Sco 142 Nirman Point
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Phone</h2>
                        <p className="text-gray-600">
                            +91 95204 43591
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Email</h2>
                        <p className="text-gray-600">
                            support@bukizz.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
