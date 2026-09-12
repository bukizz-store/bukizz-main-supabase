import React, { useState } from "react";
import { Star, Gift, Sparkles, X, Edit3 } from "lucide-react";

/**
 * SmartReviewPromptBanner
 *
 * Friendly, high-conversion prompt banner displayed exclusively to returning verified buyers
 * who have received the product but have not yet shared a review.
 *
 * @param {Object} props
 * @param {Function} props.onRate - Callback when user clicks a star or "Write a Review" (receives initial star 1-5 or 0)
 * @param {Function} [props.onDismiss] - Optional dismiss callback
 * @param {string} [props.productTitle] - Product title for personalization
 */
const SmartReviewPromptBanner = ({ onRate, onDismiss, productTitle }) => {
  const [hoverStar, setHoverStar] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const handleStarClick = (starValue) => {
    if (onRate) {
      onRate(starValue);
    }
  };

  const handleWriteClick = () => {
    if (onRate) {
      onRate(5); // Default to 5 stars or unselected
    }
  };

  return (
    <div className="relative rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-amber-50/60 to-orange-50/70 p-4 sm:p-5 shadow-xs mb-6 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        {/* Left: Icon & Headline Copy */}
        <div className="flex items-start gap-3.5 max-w-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-100/90 border border-amber-300/60 flex items-center justify-center flex-shrink-0 text-amber-700 shadow-2xs mt-0.5">
            <Sparkles className="w-5 h-5 fill-amber-400 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                <Gift className="w-3 h-3 text-amber-600" /> Verified Delivery
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              You bought this item recently! How was it?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
              Help other parents make the right choice for their children by sharing your genuine feedback.
            </p>
          </div>
        </div>

        {/* Right: Interactive Quick-Rate Stars & Action Button */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center ml-13 md:ml-0">
          {/* Quick-Rate 5-Star Row */}
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xs border border-amber-200/70 px-2.5 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 mr-1 hidden sm:inline">
              Rate now:
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverStar(star)}
                onMouseLeave={() => setHoverStar(0)}
                className="p-1 rounded-md transition-transform duration-150 hover:scale-125 active:scale-95 focus:outline-none"
                title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-150 ${
                    hoverStar >= star
                      ? "fill-amber-400 text-amber-400 drop-shadow-2xs"
                      : "fill-slate-100 text-slate-300 hover:fill-amber-300 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={handleWriteClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-amber-950 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 border border-amber-300/80 shadow-xs transition-all duration-150 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Write a Review</span>
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-amber-700/60 hover:text-amber-900 hover:bg-amber-100/60 transition-colors"
            title="Dismiss"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartReviewPromptBanner;
