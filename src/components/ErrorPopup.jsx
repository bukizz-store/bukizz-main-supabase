import React, { useEffect, useState } from "react";

const ErrorPopup = ({
  isOpen,
  onClose,
  title = "Error",
  message,
  type = "error", // error, success, warning, info
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Animation duration
  };

  const getThemeClasses = () => {
    const baseClasses = "border-l-4 p-4 rounded-r-lg shadow-lg";

    switch (type) {
      case "success":
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`;
      case "warning":
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case "info":
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`;
      case "error":
      default:
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
    }
  };

  const getIconClasses = () => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      case "error":
      default:
        return "text-red-500";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "error":
      default:
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`
          relative max-w-md w-full transform transition-all duration-300 ease-in-out
          ${
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "-translate-y-4 opacity-0 scale-95"
          }
        `}
      >
        <div className={`${getThemeClasses()} relative`}>
          {/* Icon and Content */}
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${getIconClasses()}`}>
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold">{title}</h3>
              {message && (
                <div className="mt-1 text-sm opacity-90">{message}</div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress Bar for Auto Close */}
          {autoClose && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
              <div
                className={`
                  h-full transition-all ease-linear
                  ${
                    type === "success"
                      ? "bg-green-500"
                      : type === "warning"
                      ? "bg-yellow-500"
                      : type === "info"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }
                `}
                style={{
                  animation: `shrink ${duration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorPopup;
