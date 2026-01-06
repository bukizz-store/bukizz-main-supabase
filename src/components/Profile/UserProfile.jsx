import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";

const UserProfile = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    profile,
    addresses,
    stats,
    loading,
    error,
    getProfile,
    getAddresses,
    getPreferences,
    getStats,
    updateProfile,
    verifyEmail,
    clearError,
  } = useUserProfileStore();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    state: "",
  });

  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        await getProfile();
        await getAddresses();
        await getPreferences();
        await getStats();
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user, getProfile, getAddresses, getPreferences, getStats]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || profile.fullName || "",
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
      await updateProfile(formData);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const message = await verifyEmail();
      alert(message);
    } catch (error) {
      alert("Error verifying email: " + error.message);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={clearError}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {editMode ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2">
                {profile?.full_name || profile?.fullName || "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="flex items-center space-x-2">
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {profile?.email || "Not provided"}
                </p>
              )}
              {!editMode && (
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      profile?.email_verified || profile?.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile?.email_verified || profile?.emailVerified
                      ? "Verified"
                      : "Unverified"}
                  </span>
                  {!(profile?.email_verified || profile?.emailVerified) && (
                    <button
                      onClick={handleVerifyEmail}
                      className="text-blue-500 hover:text-blue-700 text-xs underline"
                    >
                      Verify
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            {editMode ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 py-2">
                  {profile?.phone || "Not provided"}
                </p>
                {profile?.phone && (
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      profile?.phone_verified || profile?.phoneVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile?.phone_verified || profile?.phoneVerified
                      ? "Verified"
                      : "Unverified"}
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            {editMode ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2">
                {profile?.date_of_birth ||
                  profile?.dateOfBirth ||
                  "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            {editMode ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-gray-900 py-2 capitalize">
                {profile?.gender?.replace("_", " ") || "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            {editMode ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2">
                {profile?.city || "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            {editMode ? (
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2">
                {profile?.state || "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <p className="text-gray-900 py-2">
              <span
                className={`px-2 py-1 text-xs rounded ${
                  profile?.is_active || profile?.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {profile?.is_active || profile?.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </p>
          </div>
        </div>

        {editMode && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Account Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Account Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalOrders || 0}
              </p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.completedOrders || 0}
              </p>
              <p className="text-sm text-gray-600">Completed Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalSpent || 0}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {addresses?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Saved Addresses</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold">Manage Addresses</h3>
            <p className="text-sm text-gray-600">
              Add, edit, or delete saved addresses
            </p>
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold">View Order History</h3>
            <p className="text-sm text-gray-600">
              Check your past orders and status
            </p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold">Update Preferences</h3>
            <p className="text-sm text-gray-600">
              Manage notifications and privacy settings
            </p>
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Account Information
        </h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>User ID:</strong> {profile?.id}
          </p>
          <p>
            <strong>Member Since:</strong>{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "Unknown"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {profile?.updated_at
              ? new Date(profile.updated_at).toLocaleDateString()
              : "Unknown"}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            <span className="capitalize">{profile?.role || "Customer"}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
