import React from 'react';

const SolutionsPage = () => {
    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Our Solutions</h1>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm text-gray-600">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">For Parents</h2>
                    <p className="mb-4 leading-relaxed">
                        Say goodbye to store hopping. Bukizz brings your child's complete school requires list online. Simply select your school and class, and get a pre-populated cart with all approved books and supplies.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>One-click ordering</li>
                        <li>Home delivery</li>
                        <li>High-quality products</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">For Schools</h2>
                    <p className="mb-4 leading-relaxed">
                        Partner with Bukizz to streamline your supply chain. We ensure your students have access to the correct learning materials from day one.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Customized booklists</li>
                        <li>Hassle-free distribution</li>
                        <li>Dedicated support</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SolutionsPage;
