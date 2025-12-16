import React from "react";

const PromoCard = () => {
  return (
    <div className="relative">
      <img
        src="/promo_card.png"
        alt="Promo Card"
        className="w-full h-auto my-4"
      />
      <div className="absolute inset-0 flex items-center justify-start pl-36">
        <div className="text-start text-white">
          <h2 className="text-4xl font-bold mb-2 ">
            One App for all your
          </h2>
          <h2 className="text-4xl font-bold mb-4">School Needs</h2>
          <button>
            <img src="/image 54.png" alt="Menu" className="h-12 mx-4 " />
          </button>
          <button>
            <img src="/image 55.png" alt="Search" className="h-12 mx-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoCard;
