import React from "react";

// Using Google Fonts Abel
const Card1 = () => {
  return (
    <div className="mx-4 md:mx-12 my-4 mb-4 md:mb-8 max-w">
      {/* Mobile/Tablet Banner */}
      <img
        src="/banner_2.png"
        alt="Bukizz Banner"
        className="w-full h-auto rounded-2xl shadow-lg block lg:hidden"
      />

      {/* Desktop Banner (Original Content) */}
      <div className="relative h-[400px] bg-white rounded-2xl shadow-lg p-4 overflow-hidden hidden lg:flex items-center justify-between">
        <div className="absolute -left-[350px] top-[-100px] transform w-[700px] h-[700px] bg-blue-500 rounded-full opacity-100"></div>

        <div className="relative z-10 flex flex-row h-full w-full items-center justify-between">
          <img
            src="/delivery_person.svg"
            alt="Bukizz Logo"
            className="relative z-20 h-auto order-1"
          />
          <div className="w-1/2 p-4 flex flex-col justify-center gap-2 order-2 text-left items-start">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] text-transparent bg-clip-text mb-4 w-1/2">
              {"What Bukizz Can Do For Your School"}
            </h2>
            <h2 className="font-abel font-medium text-3xl">Doorstep Delivery</h2>
            <div className="h-1 bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] w-12 rounded-full"></div>
            <p className="font-nunito w-2/3 font-semibold text-green text-base">
              A Platform to doorstep Deliver the School amenities such as Booksets
              , Uniforms, Stationaries ,etc.
            </p>
          </div>

          <img src="/family_svg.svg" alt="Arrow Right" className="m-4 h-auto order-3" />
        </div>
      </div>
    </div>
  );
};

export default Card1;
