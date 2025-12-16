import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import MyCitySection from "../../components/MyCitySection";
import OrdersSection from "../../components/ReusableCard/OrdersSection";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";

function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    profile,
    addresses,
    loading,
    error,
    getProfile,
    getAddresses,
    updateProfile,
  } = useUserProfileStore();

  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const tabParam = searchParams.get("tab");
    return tabParam || "profile"; // "profile", "orders" or "city"
  });
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

  // Load profile data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const loadProfileData = async () => {
      try {
        await getProfile();
        await getAddresses();
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user, isAuthenticated, navigate, getProfile, getAddresses]);

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

  const handleEditAddress = (address) => {
    // Navigate to address editing (can be expanded based on your requirements)
    console.log("Edit address:", address);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <SearchBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              {/* Profile Header */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hello</p>
                    <h3 className="text-lg font-semibold text-blue-600">
                      {formData.firstName} {formData.lastName}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSection("profile");
                    setEditMode(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center space-x-3 transition-colors ${
                    activeSection === "profile"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>👤</span>
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setActiveSection("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center space-x-3 transition-colors ${
                    activeSection === "orders"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>📦</span>
                  <span>Orders</span>
                </button>

                <button
                  onClick={() => setActiveSection("city")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center space-x-3 transition-colors ${
                    activeSection === "city"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>🏙️</span>
                  <span>My city</span>
                </button>

                <button
                  onClick={() => console.log("Notifications")}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium flex items-center space-x-3 transition-colors"
                >
                  <span>🔔</span>
                  <span>Notifications</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium flex items-center space-x-3 transition-colors"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content - Full Width When Active */}
          <div className={activeSection === "profile" ? "lg:col-span-4" : "lg:col-span-4 hidden"}>
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
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editMode ? "bg-gray-50 text-gray-800" : "bg-white"
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
                        className={`text-sm font-semibold mt-1 ${
                          profile?.email_verified || profile?.emailVerified
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {profile?.email_verified || profile?.emailVerified
                          ? "Verified"
                          : "Unverified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                        Phone Status
                      </p>
                      <p
                        className={`text-sm font-semibold mt-1 ${
                          profile?.phone_verified || profile?.phoneVerified
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

            {/* Address Section */}
            {addresses && addresses.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Saved Addresses
                </h2>

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 ${
                              address.is_default
                                ? "border-blue-500 bg-blue-100"
                                : "border-gray-300"
                            }`}
                          ></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-800">
                                {address.recipientName || "Address"}
                              </h3>
                              {address.label && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                  {address.label}
                                </span>
                              )}
                              {address.is_default && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            {address.phone && (
                              <p className="text-sm text-gray-600 mt-1">
                                📞 {address.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          EDIT
                        </button>
                      </div>

                      <p className="text-sm text-gray-700 ml-8">
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}
                      </p>
                      <p className="text-sm text-gray-700 ml-8">
                        {address.city}
                        {address.state && `, ${address.state}`}{" "}
                        {address.postal_code && `- ${address.postal_code}`}
                      </p>
                      {address.landmark && (
                        <p className="text-xs text-gray-500 ml-8 mt-1">
                          📍 Landmark: {address.landmark}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
              </div>
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
    </div>
  );
}

export default ProfilePage;
