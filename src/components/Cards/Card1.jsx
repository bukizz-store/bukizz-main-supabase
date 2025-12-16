import React from "react";

// Using Google Fonts Abel
const Card1 = () => {
  return (
    <div className="relative mx-12 my-4 mb-8 max-w h-[400px] bg-white rounded-2xl shadow-lg p-4 m-4 overflow-hidden">
      <div className="absolute -left-[350px] top-[-100px] transform w-[700px] h-[700px] bg-blue-500 rounded-full"></div>

      <div className="relative z-10 flex h-full w-full items-center">
        <img
          src="/delivery_person.svg"
          alt="Bukizz Logo"
          className="relative z-20"
        />
        <div className="w-1/2 p-4 flex flex-col justify-center gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] text-transparent bg-clip-text mb-4 w-1/2">
            {"What Bukizz Can Do For Your School"}
          </h2>
          <h2 className="font-abel font-medium text-3xl">Doorstep Delivery</h2>
          <div className="h-1 bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] w-12 rounded-full"></div>
          <p className="font-nunito w-2/3 font-semibold text-green">
            A Platform to doorstep Deliver the School amenities such as Booksets
            , Uniforms, Stationaries ,etc.
          </p>
        </div>

        <img src="/family_svg.svg" alt="Arrow Right" className="m-4" />
      </div>
    </div>
  );
};

export default Card1;
