import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  User,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  TrendingUp,
  Boxes,
  Sparkles,
} from "lucide-react";
import { handleBackNavigation } from "../../utils/navigation";
import useApiRoutesStore from "../../store/apiRoutesStore";
import useNotificationStore from "../../store/notificationStore";

const ConnectSchoolPage = () => {
  const navigate = useNavigate();
  const apiRoutes = useApiRoutesStore();
  const { addNotification } = useNotificationStore();

  const [formData, setFormData] = useState({
    schoolName: "",
    city: "",
    contactPerson: "",
    contactNumber: "",
    designation: "",
    query: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "contactNumber") {
      // Allow only digits up to 10
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: cleanValue,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.schoolName.trim()) {
      errors.schoolName = "School name is required";
    } else if (formData.schoolName.trim().length < 2) {
      errors.schoolName = "School name must be at least 2 characters";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.contactPerson.trim()) {
      errors.contactPerson = "Contact person name is required";
    } else if (formData.contactPerson.trim().length < 2) {
      errors.contactPerson = "Name must be at least 2 characters";
    }

    const phoneDigits = formData.contactNumber.trim();
    if (!phoneDigits) {
      errors.contactNumber = "Contact number is required";
    } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      errors.contactNumber = "Enter a valid 10-digit mobile number (starts with 6-9)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const connectUrl = apiRoutes.schools?.connect || `${apiRoutes.baseUrl}/schools/connect`;

      const payload = {
        schoolName: formData.schoolName.trim(),
        city: formData.city.trim(),
        contactPerson: formData.contactPerson.trim(),
        contactNumber: formData.contactNumber.trim(),
        designation: formData.designation.trim() || undefined,
        query: formData.query.trim() || undefined,
      };

      const response = await fetch(connectUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to submit inquiry. Please try again.");
      }

      setSubmittedData({ ...formData });
      setIsSubmitted(true);
      if (addNotification) {
        addNotification({
          type: "success",
          message: "School connect query submitted successfully!",
        });
      }
    } catch (err) {
      console.error("Connect school error:", err);
      setServerError(err.message || "An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      schoolName: "",
      city: "",
      contactPerson: "",
      contactNumber: "",
      designation: "",
      query: "",
    });
    setFieldErrors({});
    setIsSubmitted(false);
    setSubmittedData(null);
    setServerError("");
  };

  return (
    <div className="min-h-screen bg-[#F3F8FF] font-nunito flex flex-col py-6 md:py-10 px-4 md:px-12 relative overflow-hidden">
      {/* Background Decorative Blur Spheres matching Bukizz theme */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-200 rounded-full -translate-x-1/3 translate-y-1/3 opacity-40 blur-3xl pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Back Navigation Button */}
        <button
          onClick={() => handleBackNavigation(navigate)}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2 font-semibold w-max transition-transform hover:-translate-x-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to previous</span>
        </button>

        {/* Header Title Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs md:text-sm font-bold mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>School Partnerships</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a202c] tracking-tight">
            Connect Your School With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
              Bukizz
            </span>
          </h1>
          {/* <p className="mt-2 text-gray-600 text-base md:text-lg max-w-2xl">
            Streamline your school's textbooks, stationery, and uniform distribution. Get verified book kits delivered directly to parents with zero administrative burden.
          </p> */}
        </div>

        {/* Content Layout: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Why Choose Us (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Why Choose Us?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">
                      Amazon For Schools
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      A Comprehensive Digital Marketplace Tailored For Schools, Streamlining The Purchase And Distribution Of Educational Supplies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">
                      Empower Existing Retailers
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      Connect Your Existing Book And Uniform Retailers With Bukizz For Seamless Doorstep Delivery Services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-purple-600">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">
                      All-In-One Platform
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      A Single Platform Solution For Admissions, School Inquiries, And Parent-School Communication, Simplifying Educational Administration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Helpdesk Box */}
              <div className="mt-8 pt-6 border-t border-gray-100 bg-[#F9FBFF] rounded-xl p-4">
                <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">
                  Need Immediate Assistance?
                </p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-900">Gurgaon:</span>{" "}
                    <a href="tel:+919369467134" className="text-blue-600 hover:underline">
                      +91 9369467134
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Email:</span>{" "}
                    <a href="mailto:admin@bukizz.com" className="text-blue-600 hover:underline">
                      admin@bukizz.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Connect Form Card */}
          <div className="w-full lg:col-span-7 max-w-2xl mx-auto lg:max-w-none">
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
              {isSubmitted ? (
                /* Success View */
                <div className="text-center py-8 px-2 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                      Inquiry Received!
                    </h2>
                    <p className="text-gray-600 mt-2 max-w-md mx-auto">
                      Thank you for connecting with Bukizz. Our school partnerships manager will reach out to you shortly.
                    </p>
                  </div>

                  {submittedData && (
                    <div className="bg-gray-50 rounded-xl p-5 text-left max-w-md mx-auto border border-gray-200 text-sm space-y-2">
                      <p className="text-gray-500 font-semibold uppercase text-xs">
                        Submission Summary
                      </p>
                      <p>
                        <strong className="text-gray-700">School:</strong>{" "}
                        <span className="text-gray-900">{submittedData.schoolName}</span>
                      </p>
                      <p>
                        <strong className="text-gray-700">City:</strong>{" "}
                        <span className="text-gray-900">{submittedData.city}</span>
                      </p>
                      <p>
                        <strong className="text-gray-700">Contact:</strong>{" "}
                        <span className="text-gray-900">
                          {submittedData.contactPerson} ({submittedData.contactNumber})
                        </span>
                      </p>
                      {submittedData.designation && (
                        <p>
                          <strong className="text-gray-700">Designation:</strong>{" "}
                          <span className="text-gray-900">{submittedData.designation}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                    <Link
                      to="/"
                      className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold shadow-md transition-all text-center"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form View */
                <div>
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      School Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Fill out this quick form and our team will get in touch with you.
                    </p>
                  </div>

                  {serverError && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* School Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        School Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          name="schoolName"
                          value={formData.schoolName}
                          onChange={handleChange}
                          placeholder="e.g. Delhi Public School"
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                            fieldErrors.schoolName
                              ? "border-rose-400 focus:ring-rose-200"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                          } focus:outline-none focus:ring-4 transition-all text-gray-800 text-sm md:text-base`}
                        />
                      </div>
                      {fieldErrors.schoolName && (
                        <p className="text-rose-600 text-xs mt-1.5 font-semibold">
                          {fieldErrors.schoolName}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. Kanpur, Lucknow, Gurgaon"
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                            fieldErrors.city
                              ? "border-rose-400 focus:ring-rose-200"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                          } focus:outline-none focus:ring-4 transition-all text-gray-800 text-sm md:text-base`}
                        />
                      </div>
                      {fieldErrors.city && (
                        <p className="text-rose-600 text-xs mt-1.5 font-semibold">
                          {fieldErrors.city}
                        </p>
                      )}
                    </div>

                    {/* Contact Person Name & Contact Number (2 columns on tablet/desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Person Name */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                          Contact Person Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <User className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            placeholder="e.g. Rajesh Sharma"
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                              fieldErrors.contactPerson
                                ? "border-rose-400 focus:ring-rose-200"
                                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                            } focus:outline-none focus:ring-4 transition-all text-gray-800 text-sm md:text-base`}
                          />
                        </div>
                        {fieldErrors.contactPerson && (
                          <p className="text-rose-600 text-xs mt-1.5 font-semibold">
                            {fieldErrors.contactPerson}
                          </p>
                        )}
                      </div>

                      {/* Contact Number */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                          Contact Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-bold text-sm">
                            +91
                          </div>
                          <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            className={`w-full pl-13 pr-4 py-3 rounded-xl border ${
                              fieldErrors.contactNumber
                                ? "border-rose-400 focus:ring-rose-200"
                                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                            } focus:outline-none focus:ring-4 transition-all text-gray-800 text-sm md:text-base`}
                          />
                        </div>
                        {fieldErrors.contactNumber && (
                          <p className="text-rose-600 text-xs mt-1.5 font-semibold">
                            {fieldErrors.contactNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Designation (Optional) */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Designation <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          placeholder="e.g. Principal, Director, Admin In-charge"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-gray-800 text-sm md:text-base"
                        />
                      </div>
                    </div>

                    {/* Query (Optional) */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Query / Message <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-gray-400">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <textarea
                          name="query"
                          rows={4}
                          value={formData.query}
                          onChange={handleChange}
                          placeholder="Tell us about your requirements, student strength, or preferred callback time..."
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-gray-800 text-sm md:text-base resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base md:text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Submitting Inquiry...</span>
                          </>
                        ) : (
                          <span>Submit Connect Request</span>
                        )}
                      </button>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-2">
                      By submitting, you agree to receive a callback or message from the Bukizz school relations team.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectSchoolPage;
