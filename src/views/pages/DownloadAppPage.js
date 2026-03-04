import React from "react";
import { useNavigate } from "react-router-dom";
import { handleBackNavigation } from "../../utils/navigation";
import SearchBar from "../../components/Common/SearchBar";

const DownloadAppPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F3F8FF] flex flex-col font-nunito overflow-hidden relative">
            <SearchBar />

            {/* Background Abstract Geometry */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 blur-3xl z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-200 rounded-full -translate-x-1/2 translate-y-1/3 opacity-30 blur-3xl z-0 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto w-full px-4 md:px-12 py-12 relative z-10 flex-grow flex flex-col justify-center">

                {/* Back button */}
                <button
                    onClick={() => handleBackNavigation(navigate)}
                    className="text-blue-600 hover:text-blue-800 mb-8 flex items-center gap-2 font-semibold w-max transition-transform hover:-translate-x-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to previous
                </button>

                {/* Staggered Content Layout (Breaking the safe 50/50 split) */}
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 items-center lg:items-start justify-between mt-4">

                    {/* Typographic Massive Core */}
                    <div className="flex flex-col w-full lg:w-7/12 pt-8 lg:pr-12">
                        <div className="inline-block px-4 py-1.5 bg-blue-600 text-white font-bold text-sm tracking-wider uppercase w-max rounded-sm mb-6 shadow-sm border border-blue-700">
                            Available Now
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-[#1a202c] leading-[1.05] tracking-tight">
                            Your School World, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">
                                In Your Pocket.
                            </span>
                        </h1>

                        <p className="mt-8 text-lg md:text-xl text-gray-600 font-medium max-w-xl leading-relaxed border-l-4 border-blue-400 pl-6">
                            Experience faster checkouts, real-time order tracking, and exclusive mobile-only deals. Download the Bukizz app today to revolutionize how you manage school essentials.
                        </p>

                        {/* Store Buttons - Asymmetric Alignment */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                            {/* Play Store Button */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.bukizz.main&hl=en_IN"
                                className="group relative flex items-center gap-4 bg-black text-white px-6 py-4 rounded-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20 w-[240px] border border-gray-800"
                                onClick={(e) => { e.preventDefault(); alert('Play Store link coming soon!'); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 group-hover:rotate-6 transition-transform" viewBox="0 0 512 512" fill="currentColor">
                                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                                </svg>
                                <div className="text-left font-sans">
                                    <div className="text-[10px] uppercase font-semibold text-gray-300 tracking-wider">Get it on</div>
                                    <div className="text-xl font-medium leading-none mt-1">Google Play</div>
                                </div>
                                <div className="absolute inset-0 rounded-xl ring-2 ring-white/0 group-hover:ring-white/20 transition-all"></div>
                            </a>

                            {/* App Store Button - Visual Contrast */}
                            <a
                                href="#"
                                className="group relative flex items-center gap-4 bg-white text-black px-6 py-4 rounded-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-gray-200/50 w-[240px] border border-gray-200"
                                onClick={(e) => { e.preventDefault(); alert('App Store link coming soon!'); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 group-hover:-rotate-6 transition-transform pl-1 pb-1" viewBox="0 0 384 512" fill="currentColor">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                </svg>
                                <div className="text-left font-sans">
                                    <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Download on the</div>
                                    <div className="text-xl font-medium leading-none mt-1">App Store</div>
                                </div>
                                <div className="absolute inset-0 rounded-xl ring-2 ring-black/0 group-hover:ring-black/5 transition-all"></div>
                            </a>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 flex items-center gap-8 text-gray-500 text-sm font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500 text-xl">★</span> 4.9/5 Average Rating
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-blue-600 font-extrabold text-lg">1K+</span> Active Users
                            </div>
                        </div>
                    </div>

                    {/* Dramatic Visual Elements (Right Side Override) */}
                    <div className="relative w-full lg:w-5/12 flex justify-center lg:justify-end">
                        {/* Phone Mockup Frame */}
                        <div className="relative w-[300px] h-[600px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden transform lg:rotate-[-5deg] lg:-translate-y-8 flex-shrink-0 z-20 transition-transform duration-700 hover:rotate-0">

                            {/* Screen Content Fake */}
                            <div className="w-full h-full bg-[#F3F8FF] overflow-hidden rounded-[2.5rem]">
                                <img src="/app/image.png" alt="App Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Floating Element Depth */}
                        <div className="absolute bottom-20 -left-16 w-36 h-36 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 transform rotate-6 z-30 hidden lg:flex flex-col justify-center items-center group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div className="font-bold text-gray-800 text-sm">Instant Sync</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadAppPage;
