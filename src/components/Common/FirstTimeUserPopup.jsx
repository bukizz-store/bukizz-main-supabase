import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const FirstTimeUserPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenAppUpdatePopup");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenAppUpdatePopup", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#F3F8FF] rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full relative overflow-hidden font-nunito my-2 sm:my-6">
        <div className="absolute top-0 right-0 w-[280px] h-[280px] sm:w-[600px] sm:h-[600px] bg-blue-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 blur-3xl z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[220px] h-[220px] sm:w-[400px] sm:h-[400px] bg-sky-200 rounded-full -translate-x-1/2 translate-y-1/3 opacity-30 blur-3xl z-0 pointer-events-none" />

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 bg-white/90 hover:bg-white rounded-full transition-colors z-20 shadow-sm border border-gray-100"
          aria-label="Close popup"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="relative z-10 p-6 sm:p-7 md:p-10 lg:p-12 flex flex-col lg:flex-row gap-6 sm:gap-10 items-center">
          <div className="flex flex-col w-full lg:w-7/12">
            <div className="inline-block px-3 sm:px-4 py-1.5 bg-blue-600 text-white font-bold text-xs sm:text-sm tracking-wider uppercase w-max rounded-sm mb-4 sm:mb-6 shadow-sm border border-blue-700">
              Available Now
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a202c] leading-[1.05] tracking-tight">
              Your School World, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">
                In Your Pocket.
              </span>
            </h2>

            <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-600 font-medium max-w-xl leading-relaxed border-l-4 border-blue-400 pl-4 sm:pl-5">
              Experience faster checkouts, real-time order tracking, and exclusive
              mobile-only deals. Download the Bukizz app today.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
              <a
                href="https://play.google.com/store/apps/details?id=com.bukizz.main&hl=en_IN"
                className="group relative flex items-center gap-4 bg-black text-white px-5 py-3 rounded-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20 w-full sm:w-[220px] border border-gray-800"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 group-hover:rotate-6 transition-transform" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                <div className="text-left font-sans">
                  <div className="text-[10px] uppercase font-semibold text-gray-300 tracking-wider">Get it on</div>
                  <div className="text-lg font-medium leading-none mt-0.5">Google Play</div>
                </div>
                <div className="absolute inset-0 rounded-xl ring-2 ring-white/0 group-hover:ring-white/20 transition-all" />
              </a>

              <a
                href="https://apps.apple.com/us/app/bukizz/id6760407151"
                className="group relative flex items-center gap-4 bg-white text-black px-5 py-3 rounded-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-gray-200/50 w-full sm:w-[220px] border border-gray-200"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 group-hover:-rotate-6 transition-transform pl-1 pb-1" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <div className="text-left font-sans">
                  <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Download on the</div>
                  <div className="text-lg font-medium leading-none mt-0.5">App Store</div>
                </div>
                <div className="absolute inset-0 rounded-xl ring-2 ring-black/0 group-hover:ring-black/5 transition-all" />
              </a>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-500 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">★</span> 4.9/5 Average Rating
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-extrabold text-lg">1K+</span> Active Users
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-5/12 hidden sm:flex justify-center lg:justify-end">
            <div className="relative w-[170px] h-[340px] md:w-[210px] md:h-[420px] bg-white rounded-[2rem] md:rounded-[2.2rem] shadow-2xl border-[5px] md:border-[6px] border-gray-900 overflow-hidden transform lg:rotate-[-5deg] flex-shrink-0 z-20 transition-transform duration-700 hover:rotate-0">
              <div className="w-full h-full bg-[#F3F8FF] overflow-hidden rounded-[1.8rem]">
                <img src="/app/image.png" alt="App Preview" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="absolute bottom-10 -left-8 w-24 h-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 transform rotate-6 z-30 hidden lg:flex flex-col justify-center items-center">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="font-bold text-gray-800 text-[11px]">Instant Sync</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeUserPopup;
