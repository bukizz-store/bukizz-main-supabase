import React, { useState } from 'react';
import { Check } from 'lucide-react';
import useCityStore from '../../store/cityStore';

const CitySelectionPopup = ({ onClose }) => {
    const [selectedCity, setSelectedCity] = useState(null);
    const setCityInStore = useCityStore((state) => state.setSelectedCity);

    const cities = [
        {
            id: "kanpur",
            name: "Kanpur",
            image: "/city/kanpur.jpg",
            isComingSoon: false,
        },
        {
            id: "gurugram",
            name: "Gurugram",
            image: "/city/gurugram.jpg",
            isComingSoon: false,
        },
        {
            id: "noida",
            name: "Noida",
            image: "/city/noida.jpg",
            isComingSoon: true,
        },
    ];

    const handleSelect = () => {
        if (selectedCity) {
            setCityInStore(selectedCity);
            if (onClose) onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Container */}
            <div className="relative bg-white rounded-3xl w-full max-w-sm md:max-w-4xl lg:max-w-5xl p-6 md:p-10 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                        Select Your City To Get Your
                    </h2>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-500 leading-tight">
                        Essentials Delivered
                    </h2>
                </div>

                {/* Cities Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full mb-6 md:mb-8">
                    {cities.map((city) => {
                        const isComingSoon = city.isComingSoon;
                        const isSelected = selectedCity === city.id;

                        return (
                            <div
                                key={city.id}
                                onClick={() => {
                                    if (!isComingSoon) {
                                        setSelectedCity(city.id);
                                    }
                                }}
                                className={`
                    group relative h-40 md:h-56 rounded-2xl overflow-hidden
                    transition-all duration-300
                    ${isComingSoon
                                        ? 'cursor-not-allowed ring-1 ring-gray-200 opacity-90'
                                        : `cursor-pointer transform hover:scale-[1.02] ${isSelected
                                            ? 'ring-[5px] ring-blue-500 shadow-xl scale-[1.02]'
                                            : 'ring-1 ring-gray-200 shadow-md grayscale hover:grayscale-0'
                                        }`
                                    }
                  `}
                            >
                                {/* Background Image */}
                                <img
                                    src={city.image}
                                    alt={city.name}
                                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${isComingSoon ? 'grayscale-[20%]' : 'group-hover:scale-110'
                                        }`}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* Coming Soon Badge */}
                                {isComingSoon && (
                                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] md:text-xs font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider">
                                        Coming Soon
                                    </div>
                                )}

                                {/* City Name & Status */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                                    <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md block">
                                        {city.name}
                                    </span>
                                    {isComingSoon && (
                                        <span className="text-xs font-semibold text-amber-300 mt-0.5 block tracking-wide">
                                            Launching Soon
                                        </span>
                                    )}
                                </div>

                                {/* Checkmark Badge */}
                                {!isComingSoon && isSelected && (
                                    <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1 shadow-lg animate-in zoom-in spin-in-90 duration-300">
                                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleSelect}
                    disabled={!selectedCity}
                    className={`
            w-full md:max-w-md py-3 md:py-4 px-6 rounded-full text-lg md:text-xl font-bold text-white
            flex items-center justify-center space-x-2 transition-all duration-300
            ${selectedCity
                            ? 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-blue-300 cursor-not-allowed'
                        }
          `}
                >
                    <span>Select Your City</span>
                    <svg
                        className={`w-6 h-6 transition-transform duration-300 ${selectedCity ? 'group-hover:translate-x-1' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>

            </div>
        </div>
    );
};

export default CitySelectionPopup;
