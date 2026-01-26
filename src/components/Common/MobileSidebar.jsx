import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    User,
    MapPin,
    Building2,
    Bell,
    LogOut,
    ChevronRight,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useUIStore from "../../store/uiStore";

const MobileSidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout, setModalOpen, setRedirectPath } = useAuthStore();
    const { openCityPopup } = useUIStore();

    const handleNavigation = (path) => {
        // Protected routes that require login
        const protectedRoutes = ["/orders", "/profile"];
        const isProtected = protectedRoutes.some(route => path.startsWith(route));

        // Check if it's the city selection, which should be public
        const isCitySelection = path.includes("tab=city");

        if (isProtected && !user && !isCitySelection) {
            setRedirectPath(path);
            setModalOpen(true);
            onClose();
            return;
        }

        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
        navigate("/");
    };

    // Helper to get initials or default avatar
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const userName = user?.full_name || user?.name || "Guest User";
    const userPhone = user?.phone || "+91 XXXXXXXXXX";

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-x-0 bottom-0 top-[56px] bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-[56px] md:top-0 left-0 h-[calc(100vh-56px)] w-[85%] max-w-[320px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="bg-[#39A7FF] p-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/30 backdrop-blur-sm">
                            {/* Placeholder for avatar if no image, using initials */}
                            <span className="text-white">{getInitials(userName)}</span>
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Hello, {userName}</p>
                            <p className="text-xs text-blue-100">{userPhone}</p>
                        </div>
                    </div>
                </div>

                {/* content */}
                <div className="flex-1 overflow-y-auto py-2">

                    {/* My Orders */}
                    <button
                        onClick={() => handleNavigation("/orders")}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100"
                    >
                        <div className="flex items-center gap-3 text-gray-700">
                            <Package size={20} className="text-gray-500" />
                            <span className="font-medium">My Orders</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </button>

                    {/* Account Settings */}
                    <div className="mt-4 px-4 pb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Account Settings
                        </p>
                    </div>

                    <button
                        onClick={() => handleNavigation("/profile?tab=profile")}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                        <User size={20} className="text-gray-500" />
                        <span className="font-medium">Profile Information</span>
                    </button>

                    <button
                        onClick={() => handleNavigation("/profile?tab=addresses")}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                        <MapPin size={20} className="text-gray-500" />
                        <span className="font-medium">Manage Addresses</span>
                    </button>

                    {/* My Stuff */}
                    <div className="mt-4 px-4 pb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            My Stuff
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            openCityPopup();
                            onClose();
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <Building2 size={20} className="text-gray-500" />
                            <span className="font-medium">My City</span>
                        </div>
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                            {localStorage.getItem('selectedCity') ? localStorage.getItem('selectedCity').toUpperCase() : 'GURGAON'}
                        </span>
                    </button>

                    <button
                        onClick={() => handleNavigation("/notifications")}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                        <Bell size={20} className="text-gray-500" />
                        <span className="font-medium">All Notifications</span>
                    </button>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        disabled={!user}
                        className={`flex items-center gap-3 font-medium w-full p-2 rounded transition-colors ${user
                            ? "text-red-500 hover:bg-red-50"
                            : "text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                    <p className="text-xs text-gray-300 mt-4 text-center">Bukizz App v2.4.1</p>
                </div>
            </div>
        </>
    );
};

export default MobileSidebar;
