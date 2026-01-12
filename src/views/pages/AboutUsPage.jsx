import React from 'react';

const AboutUsPage = () => {
    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">About Us</h1>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-4 leading-relaxed">
                    Welcome to Bukizz! We are dedicated to simplifying the school supply process for parents and schools alike.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                    Our mission is to provide a seamless, one-stop shop for all your educational needs, from textbooks and notebooks to uniforms and stationery. We partner directly with schools to ensure you get the exact items required for your child's curriculum.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    At Bukizz, we believe in quality, convenience, and affordability. Join us in making education more accessible and hassle-free.
                </p>
            </div>
        </div>
    );
};

export default AboutUsPage;
