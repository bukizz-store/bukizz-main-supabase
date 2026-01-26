import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Validates if a URL string is a valid image source
 * @param {string} url 
 * @returns {boolean}
 */
const isValidUrl = (url) => {
    try {
        return Boolean(new URL(url));
    } catch (e) {
        return false;
    }
};

const HomeCarousel = () => {
    // TODO: Fetch these from Supabase 'carousel_images' bucket or a database table in the future
    const [slides, setSlides] = useState([
        {
            id: 1,
            image: "https://qgufxqbsgewczleennbu.supabase.co/storage/v1/object/public/carousel_images/first/banner_1.svg", // Using the existing banner for now
            alt: "School Supplies Delivery",
        },
        {
            id: 2,
            // Placeholder for second image - User will provide links
            // Using a solid color or gradient placeholder if image fails, or reusing banner for demo
            image: "https://qgufxqbsgewczleennbu.supabase.co/storage/v1/object/public/carousel_images/first/banner_2.svg",
            alt: "Uniforms and Books",
        },
        {
            id: 3,
            image: "https://qgufxqbsgewczleennbu.supabase.co/storage/v1/object/public/carousel_images/first/banner_3.svg",
            alt: "Stationery Essentials",
        },
    ]);
    const [slidesMobile, setSlidesMobile] = useState([
        {
            id: 1,
            image: "https://qgufxqbsgewczleennbu.supabase.co/storage/v1/object/public/carousel_images/first/banner_1_mobile.svg", // Using the existing banner for now
            alt: "School Supplies Delivery",
        },
        {
            id: 2,
            // Placeholder for second image - User will provide links
            // Using a solid color or gradient placeholder if image fails, or reusing banner for demo
            image: "https://qgufxqbsgewczleennbu.supabase.co/storage/v1/object/public/carousel_images/first/banner_2_mobile.svg",
            alt: "Uniforms and Books",
        },
        {
            id: 3,
            image: "https://qgufxqbsgewczleennbu.supabase.co/storage/v1/object/public/carousel_images/first/banner_3_mobile.svg",
            alt: "Stationery Essentials",
        }
    ]);

    const [currentSlide, setCurrentSlide] = useState(0);

    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null); // Reset touch end
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    // State to manage transition effect
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Extended slides with a clone of the first slide at the end for smooth looping
    const extendedSlides = [...slides, { ...slides[0], id: 'clone-first' }];
    const extendedSlidesMobile = [...slidesMobile, { ...slidesMobile[0], id: 'clone-first-mobile' }];

    // Auto-play is now handled by the progress bar animation's onAnimationEnd event

    const nextSlide = () => {
        if (currentSlide >= slides.length) return; // Prevent extra clicks during reset
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
    };

    const prevSlide = () => {
        // If at start (0), jump to end (slide 2)
        // Note: For smooth infinite reverse loop, we'd need a clone at start too.
        // Current request focused on "reaches end -> 0", so we accept the rewind on Prev for now
        // or effectively jump to last slide.
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
        setIsTransitioning(true);
        setCurrentSlide(index);
    };

    // Handle seamless loop reset
    useEffect(() => {
        if (currentSlide === slides.length) {
            // We reached the clone (visually looks like slide 0)
            // Wait for transition to finish, then snap to real slide 0
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentSlide(0);
            }, 500); // Matches duration-500
            return () => clearTimeout(timer);
        }
    }, [currentSlide, slides.length]);

    // Re-enable transition if it was disabled
    useEffect(() => {
        if (!isTransitioning) {
            // We just snapped. Next action should be animated.
            // We don't necessarily need a timeout here if nextSlide sets isTransitioning(true)
            // But purely reactive state is safer.
        }
    }, [isTransitioning]);


    return (
        <div className="mx-4 md:mx-12 my-4 mb-4 md:mb-5 max-w">
            {/* Aspect Ratio Container - Mobile: 16:9 or taller, Desktop: 21:9 or similar */}
            <div
                className="relative group w-full h-auto sm:h-[300px] md:h-[250px] lg:h-[250px] overflow-hidden rounded-2xl shadow-lg bg-white"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >

                {/* Slides Desktop*/}
                <div
                    className={`hidden md:flex w-full h-full ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {extendedSlides.map((slide, index) => (
                        <div key={`${slide.id}-${index}`} className="w-full h-full relative flex-shrink-0">
                            <img
                                src={slide.image}
                                alt={slide.alt}
                                className="w-full h-full object-cover object-center"
                            />
                            {/* Optional: Add gradient overlay for better text readability if we add text later */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Slides Mobile*/}
                <div
                    className={`flex md:hidden w-full h-[178px] ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {extendedSlidesMobile.map((slide, index) => (
                        <div key={`${slide.id}-${index}`} className="w-full h-full relative flex-shrink-0">
                            <img
                                src={slide.image}
                                alt={slide.alt}
                                className="w-full h-full object-cover object-center"
                            />
                            {/* Optional: Add gradient overlay for better text readability if we add text later */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Left Arrow */}
                <button
                    onClick={prevSlide}
                    className="hidden sm:block absolute top-1/2 left-0 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-sm backdrop-blur-sm transition-all"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft width={32} height={64} />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={nextSlide}
                    className="hidden sm:block absolute top-1/2 right-0 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-sm backdrop-blur-sm transition-all "
                    aria-label="Next Slide"
                >
                    <ChevronRight width={32} height={64} />
                </button>

                {/* Progress Bar Indicators */}
                <div className="hidden sm:block md:flex absolute bottom-4 left-1/2 -translate-x-1/2 space-x-2 z-20">
                    <style>
                        {`
                        @keyframes progress {
                            from { width: 0%; }
                            to { width: 100%; }
                        }
                        `}
                    </style>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="group/indicator relative h-8 w-8 sm:w-10 flex items-center justify-center focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            {/* Visual Track */}
                            <div className="absolute h-1.5 w-full bg-gray-300/50 rounded-full overflow-hidden">
                                {currentSlide === index && (
                                    <div
                                        className="h-full bg-black rounded-full"
                                        style={{
                                            animation: "progress 5000ms linear forwards",
                                            animationPlayState: isHovered ? "paused" : "running",
                                        }}
                                        onAnimationEnd={nextSlide}
                                    />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mobile Progress Bar Indicators */}
                <div className="block sm:hidden absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    <style>
                        {`
                        @keyframes progress {
                            from { width: 0%; }
                            to { width: 100%; }
                        }
                        `}
                    </style>
                    {slidesMobile.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="group/indicator relative h-8 w-8 sm:w-10 flex items-center justify-center focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            {/* Visual Track */}
                            <div className="absolute h-1.5 w-full bg-gray-300/50 rounded-full overflow-hidden">
                                {currentSlide === index && (
                                    <div
                                        className="h-full bg-black rounded-full"
                                        style={{
                                            animation: "progress 5000ms linear forwards",
                                            animationPlayState: isHovered ? "paused" : "running",
                                        }}
                                        onAnimationEnd={nextSlide}
                                    />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeCarousel;
