import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../../components/Common/SearchBar";
import MyCitySection from "../../components/Sections/MyCitySection";
import OrdersSection from "../../components/Cards/OrdersSection";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import { User, Package, Wallet, Folder, ChevronRight, Power } from 'lucide-react';
import AddressManager from "../../components/Profile/AddressManager";

function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    profile,
    loading,
    error,
    getProfile,
    updateProfile,
    verifyEmail,
  } = useUserProfileStore();

  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const tabParam = searchParams.get("tab");
    return tabParam || "profile"; // "profile", "orders" or "city"
  });

  // Sync activeSection with URL search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveSection(tabParam);
    }
  }, [searchParams]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    state: "",
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const loadProfileData = async () => {
      try {
        await getProfile();

      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    if (user) {
      console.log("Profile data loaded:", profile);
      loadProfileData();
    }

  }, [user, isAuthenticated, navigate, getProfile]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      const fullName = profile.full_name || profile.fullName || "";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: profile.email || "",
        phone: profile.phone || "",
        dateOfBirth: profile.date_of_birth || profile.dateOfBirth || "",
        gender: profile.gender || "",
        city: profile.city || "",
        state: profile.state || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const updatedFormData = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        city: formData.city,
        state: formData.state,
      };
      await updateProfile(updatedFormData);
      setEditMode(false);
      await getProfile();
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };


  const handleVerifyEmail = async () => {
    try {
      if (profile?.emailVerified) return;
      const result = await verifyEmail();
      alert("Verification email sent! Please check your inbox.");
    } catch (error) {
      alert("Error sending verification email: " + error.message);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#F3F8FF]">
        <SearchBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F8FF]">
      <SearchBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.firstName}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hello,</p>
                  <h3 className="text-md font-bold text-gray-800">
                    {formData.firstName} {formData.lastName}
                  </h3>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* My Orders */}
                <div className="border-b">
                  <button
                    onClick={() => setActiveSection("orders")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-500 hover:text-blue-600">MY ORDERS</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Account Settings */}
                <div className="border-b">
                  <div className="px-6 py-4 flex items-center space-x-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-500">ACCOUNT SETTINGS</span>
                  </div>
                  <div className="pb-2">
                    <button
                      onClick={() => {
                        setActiveSection("profile");
                        setEditMode(false);
                      }}
                      className={`w-full text-left px-16 py-2 text-sm transition-colors ${activeSection === "profile" ? "text-blue-600 font-medium bg-blue-50" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    >
                      Profile Information
                    </button>
                    <button
                      onClick={() => {
                        setActiveSection("addresses");
                        setEditMode(false);
                      }}
                      className={`w-full text-left px-16 py-2 text-sm transition-colors ${activeSection === "addresses" ? "text-blue-600 font-medium bg-blue-50" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    >
                      Manage Addresses
                    </button>
                  </div>
                </div>



                {/* My Stuff */}
                <div className="border-b">
                  <div className="px-6 py-4 flex items-center space-x-4">
                    <Folder className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-500">MY STUFF</span>
                  </div>
                  <div className="pb-2">
                    <button
                      onClick={() => setActiveSection("city")}
                      className={`w-full text-left px-16 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeSection === "city" ? "text-blue-600 font-medium bg-blue-50" : "text-gray-600"}`}
                    >
                      My City
                    </button>
                    <button className="w-full text-left px-16 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      All Notifications
                    </button>
                  </div>
                </div>

                {/* Logout */}
                <div className="border-b last:border-b-0">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-gray-50 transition-colors text-gray-500 hover:text-blue-600"
                  >
                    <Power className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Full Width When Active */}
          <div className={(activeSection === "profile" || activeSection === "addresses") ? "lg:col-span-4" : "lg:col-span-4 hidden"}>
            {activeSection === "profile" && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Personal Information
                  </h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="First Name"
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                            }`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="Last Name"
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                            }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                        }`}
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                        }`}
                    />
                  </div>

                  {/* Additional Information Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                          }`}
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                          }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="City"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                          }`}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="State"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? "bg-gray-50 text-gray-800" : "bg-white"
                          }`}
                      />
                    </div>
                  </div>

                  {/* Account Status */}
                  {!editMode && (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">
                            Account Status
                          </p>
                          <p className="text-sm font-semibold text-blue-600 mt-1">
                            {profile?.is_active || profile?.isActive
                              ? "Active"
                              : "Inactive"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">
                            Email Status
                          </p>
                          <p
                            className={`text-sm font-semibold mt-1 ${profile?.email_verified || profile?.emailVerified
                              ? "text-green-600"
                              : "text-orange-600"
                              }`}
                          >
                            {profile?.email_verified || profile?.emailVerified
                              ? "Verified"
                              : "Unverified"}
                          </p>
                          {(!profile?.email_verified && !profile?.emailVerified) && (
                            <button
                              onClick={handleVerifyEmail}
                              disabled={loading}
                              className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                            >
                              Verify Now
                            </button>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">
                            Phone Status
                          </p>
                          <p
                            className={`text-sm font-semibold mt-1 ${profile?.phone_verified || profile?.phoneVerified
                              ? "text-green-600"
                              : "text-orange-600"
                              }`}
                          >
                            {profile?.phone_verified || profile?.phoneVerified
                              ? "Verified"
                              : "Unverified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "addresses" && (
              <AddressManager />
            )}
          </div>

          {/* My City Section - Full Width When Active */}
          <div className={activeSection === "city" ? "lg:col-span-4" : "lg:col-span-4 hidden"}>
            {activeSection === "city" && <MyCitySection />}
          </div>

          {/* Orders Section - Full Width When Active */}
          <div className={activeSection === "orders" ? "lg:col-span-4" : "lg:col-span-4 hidden"}>
            {activeSection === "orders" && <OrdersSection />}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
