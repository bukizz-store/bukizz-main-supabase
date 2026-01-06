// components/Footer.jsx
import React from "react";
import PromoCard from "../Cards/PromoCard";
// import logo from "../assets/22e87198-54d1-4aa8-b1e0-79b511ca7ba0.png";

const Footer = () => {
  return (
    <footer className="w-full">
      <div className="w-full px-4 md:px-0 mt-4 mb-20 md:mt-0 md:mb-0">
        <PromoCard />
      </div>
      <div className="hidden md:block bg-transparent mt-0 w-full md:mx-12 mx-0 relative z-10">
        <div className="flex flex-col md:flex-row justify-between mb-4 font-nunito gap-4">
          <div>
            <img src="/logo.svg" alt="Bukizz Logo" className="h-12" />
            <p className="text-gray-600 mt-2">Wisdom Rd , Sco 142 Nirman Point</p>
            <p className="text-gray-600 mt-2">+919520443591</p>
          </div>
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div className="gap-4 flex flex-col">
              <h4 className="font-bold">About</h4>
              <ul className="gap-4 flex flex-col">
                <li>About Us</li>
                <li>Contact Us</li>
                <li>Solutions</li>
                <li>Download App</li>
              </ul>
            </div>
            <div className="gap-4 flex flex-col">
              <h4 className="font-bold">Help</h4>
              <ul className="gap-4 flex flex-col">
                <li>Payments</li>
                <li>Shipping</li>
                <li>Cancellation & Returns</li>
              </ul>
            </div>
            <div className="gap-4 flex flex-col">
              <h4 className="font-bold">Consumer Policies</h4>
              <ul className="gap-4 flex flex-col">
                <li>Cancellation & Returns</li>
                <li>Terms of Use</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div className="gap-4 flex flex-col">
              <h4 className="font-bold">Mail Us</h4>
              <ul className="gap-4 flex flex-col">
                <li>Email Us</li>
                <li>            <div className="flex space-x-4">
                  <a href="#" className="border border-gray-600 rounded-full p-2">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                    </svg>
                  </a>
                  <a href="#" className="border border-gray-600 rounded-full p-2">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a href="#" className="border border-gray-600 rounded-full p-2">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                </div></li>
              </ul>
            </div>
          </div>
          <div>

          </div>
        </div>

        {/* New Footer Bottom Section */}

      </div>
      <div className="border-t border-gray-300 w-full"></div>
      <div className="w-full py-4 px-4 md:px-12 flex flex-row items-center relative">
        {/* Left Aligned: Connect & Supplier */}
        <div className="flex gap-8 md:gap-16 justify-start">
          <div className="flex items-center gap-2 text-black cursor-pointer hover:underline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <span className="font-semibold text-sm md:text-base">Connect School</span>
          </div>
          <div className="flex items-center gap-2 text-black cursor-pointer hover:underline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span className="font-semibold text-sm md:text-base">Become Supplier</span>
          </div>
        <div className="flex items-center gap-2 text-black cursor-pointer hover:underline hidden md:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="font-semibold text-sm md:text-base">Get a Call</span>
        </div>
        </div>

        {/* Center Aligned: Get a Call */}


        {/* Mobile Get a Call (stacks or shows if desktop hidden?) - keeping flexible */}

        {/* Right Aligned: Copyright */}
        <p className="hidden md:block ml-auto text-gray-600 text-sm">
          © 2026 Bukizz. All rights reserved.
        </p>
      </div>

    </footer>
  );
};

export default Footer;
