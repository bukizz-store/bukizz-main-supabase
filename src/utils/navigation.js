/**
 * Check if the app is running in webview mode (mobile app).
 */
export const isWebViewMode = () => {
    return (
        localStorage.getItem("isMobileApp") === "true" ||
        window.location.search.includes("mode=webview")
    );
};

/**
 * Navigate back: goes to homepage in webview mode, otherwise does history.back().
 * @param {Function} navigate - React Router's navigate function
 */
export const handleBackNavigation = (navigate) => {
    if (isWebViewMode()) {
        navigate("/");
    } else {
        window.history.back();
    }
};
