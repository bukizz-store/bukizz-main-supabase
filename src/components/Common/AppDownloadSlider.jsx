import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppDownloadSlider = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // const messages = [
  //   {
  //     title: "Unlock exclusive app-only deals",
  //     subtitle: "Get personalized picks and faster checkout in the app",
  //   },
  //   {
  //     title: "Track your orders in real-time",
  //     subtitle: "Get instant delivery updates from packing to doorstep",
  //   },
  //   {
  //     title: "Switch to the Bukizz App",
  //     subtitle: "Shop smoother with one-tap reorders and saved addresses",
  //   },
  // ];

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentIndex((prev) => (prev + 1) % messages.length);
  //   }, 4000);
  //   return () => clearInterval(timer);
  // }, [messages.length]);

  return (
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-5 py-4 md:px-8 md:py-6 gap-4 md:gap-8">
          
          {/* Compact Left: Icon + Text */}
          {/* <div className="flex items-center gap-4 w-full md:flex-1 overflow-hidden"> */}
            {/* 3D-ish Icon */}
            {/* <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl shadow-sm border border-blue-50 flex items-center justify-center transform rotate-[-3deg]">
              <span className="text-2xl md:text-3xl filter drop-shadow-sm">🎁</span>
            </div> */}

            {/* Ticker Content */}
            {/* <div className="flex-1 min-w-0 flex flex-col justify-center h-[42px] md:h-[48px] relative">
              {messages.map((msg, index) => {
                const isActive = index === currentIndex;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ease-out ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <h3 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-wide truncate">
                      {msg.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 font-medium truncate leading-relaxed">
                      {msg.subtitle}
                    </p>
                  </div>
                );
              })}
            </div> */}
          {/* </div> */}

          {/* Compact Right: Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
             <a
              href="https://apps.apple.com/us/app/bukizz/id6760407151"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white rounded-xl px-4 py-2.5 h-[44px] min-w-[140px] transition-all shadow-md active:scale-95 border border-gray-800 hover:-translate-y-0.5"
              onClick={(e) => e.stopPropagation()}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 pb-0.5" viewBox="0 0 384 512" fill="currentColor">
                 <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
               </svg>
               <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Download on</span>
                  <span className="text-[13px] font-bold">App Store</span>
               </div>
             </a>
                          <a
              href="https://play.google.com/store/apps/details?id=com.bukizz.main&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white rounded-xl px-4 py-2.5 h-[44px] min-w-[140px] transition-all shadow-md active:scale-95 border border-gray-800 hover:-translate-y-0.5"
              onClick={(e) => e.stopPropagation()}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor">
                 <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
               </svg>
               <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Get it on</span>
                  <span className="text-[13px] font-bold">Google Play</span>
               </div>
             </a>
          </div>

        </div>
  );
};

export default AppDownloadSlider;
