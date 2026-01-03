import React from "react";

// Using Google Fonts Abel
const Card1 = () => {
  return (
    <div className="relative mx-4 md:mx-12 my-4 mb-8 max-w h-auto md:h-[400px] bg-white rounded-2xl shadow-lg p-4 m-4 overflow-hidden">
      <div className="absolute -left-[350px] top-[-100px] transform w-[700px] h-[700px] bg-blue-500 rounded-full opacity-20 md:opacity-100"></div>

      <div className="relative z-10 flex flex-col md:flex-row h-full w-full items-center justify-between">
        <img
          src="/delivery_person.svg"
          alt="Bukizz Logo"
          className="relative z-20 h-40 md:h-auto order-2 md:order-1 mt-4 md:mt-0"
        />
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-center gap-2 order-1 md:order-2 text-center md:text-left items-center md:items-start">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] text-transparent bg-clip-text mb-4 w-full md:w-1/2">
            {"What Bukizz Can Do For Your School"}
          </h2>
          <h2 className="font-abel font-medium text-2xl md:text-3xl">Doorstep Delivery</h2>
          <div className="h-1 bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] w-12 rounded-full"></div>
          <p className="font-nunito w-full md:w-2/3 font-semibold text-green text-sm md:text-base">
            A Platform to doorstep Deliver the School amenities such as Booksets
            , Uniforms, Stationaries ,etc.
          </p>
        </div>

        <img src="/family_svg.svg" alt="Arrow Right" className="m-4 h-32 md:h-auto order-3" />
      </div>
    </div>
  );
};

export default Card1;
