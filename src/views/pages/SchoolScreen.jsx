import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import CategoryCard from "../components/ReusableCard/CategoryCard";
import { BookSetCard } from "../components/ReusableCard/BookSetCard";
import { UniformCard } from "../components/ReusableCard/UniformCard";
import useUserProfileStore from "../store/userProfileStore";

const SchoolCategory = [
  { name: "Book Sets", color: "blue", img: "bookset_cat.svg" },
  { name: "School Uniform", color: "yellow", img: "uniform_cat.svg" },
  { name: "Stationary", color: "green", img: "stationary_cat.svg" },
  { name: "Admissions", color: "purple", img: "admissions_cat.svg" },
];

// Dynamic book sets based on school catalog
const getBookSetsForSchool = (schoolCatalog) => {
  if (schoolCatalog && schoolCatalog.products) {
    // Filter for book sets from the school's actual product catalog
    return schoolCatalog.products
      .filter((product) => product.product_type === "bookset")
      .map((product) => ({
        class: product.schoolInfo?.grade || "General",
        originalPrice: (product.min_price || product.base_price || 0) + 200, // Mock original price for discount display
        discountedPrice: product.min_price || product.base_price || 0,
        rating: 4.5, // Mock rating
        name: product.title,
        id: product.product_id,
      }));
  }

  // Fallback mock data if no products available
  return [
    { class: "1st", originalPrice: 1200, discountedPrice: 980, rating: 4.5 },
    { class: "2nd", originalPrice: 1350, discountedPrice: 1120, rating: 4.0 },
    { class: "3rd", originalPrice: 1475, discountedPrice: 1260, rating: 4.2 },
    { class: "4th", originalPrice: 1590, discountedPrice: 1370, rating: 4.7 },
    { class: "5th", originalPrice: 1720, discountedPrice: 1480, rating: 4.3 },
    { class: "6th", originalPrice: 1850, discountedPrice: 1590, rating: 4.6 },
    { class: "7th", originalPrice: 1980, discountedPrice: 1720, rating: 4.4 },
    { class: "8th", originalPrice: 2150, discountedPrice: 1890, rating: 4.8 },
  ];
};

// Dynamic uniforms based on school catalog
const getUniformsForSchool = (schoolCatalog) => {
  if (schoolCatalog && schoolCatalog.products) {
    // Filter for uniforms from the school's actual product catalog
    return schoolCatalog.products
      .filter((product) => product.product_type === "uniform")
      .map((product) => ({
        name: product.title,
        originalPrice: (product.min_price || product.base_price || 0) + 150,
        discountedPrice: product.min_price || product.base_price || 0,
        rating: 4.3,
        category: product.category || "School Uniform",
        image:
          product.image_url ||
          product.images?.[0] ||
          `https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop&auto=format`,
        id: product.product_id,
        discount: "25% off",
      }));
  }

  // Fallback mock uniform data if no products available
  return [
    {
      name: "Summer Shirt",
      originalPrice: 800,
      discountedPrice: 600,
      rating: 4.5,
      category: "Shirts",
      image:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop&auto=format",
      discount: "25% off",
    },
    {
      name: "School Trousers",
      originalPrice: 1200,
      discountedPrice: 900,
      rating: 4.2,
      category: "Trousers",
      image:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=200&fit=crop&auto=format",
      discount: "25% off",
    },
    {
      name: "School Tie",
      originalPrice: 400,
      discountedPrice: 300,
      rating: 4.7,
      category: "Accessories",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&auto=format",
      discount: "25% off",
    },
    {
      name: "School Blazer",
      originalPrice: 2000,
      discountedPrice: 1500,
      rating: 4.4,
      category: "Blazers",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&auto=format",
      discount: "25% off",
    },
    {
      name: "School Skirt",
      originalPrice: 900,
      discountedPrice: 675,
      rating: 4.3,
      category: "Skirts",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=200&fit=crop&auto=format",
      discount: "25% off",
    },
    {
      name: "School Socks",
      originalPrice: 200,
      discountedPrice: 150,
      rating: 4.1,
      category: "Socks",
      image:
        "https://images.unsplash.com/photo-1586523969132-a3cf25b48d1c?w=300&h=200&fit=crop&auto=format",
      discount: "25% off",
    },
  ];
};

const SchoolScreen = () => {
  const { id } = useParams();
  const { getSchool, getSchoolCatalog, loading, error } = useUserProfileStore();

  const [schoolData, setSchoolData] = useState(null);
  const [schoolCatalog, setSchoolCatalog] = useState(null);
  const [loadingSchool, setLoadingSchool] = useState(true);
  const [schoolError, setSchoolError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Book Sets"); // Default to Book Sets

  const fetchSchoolData = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingSchool(true);
      setSchoolError(null);

      // Clear previous school data immediately when starting to fetch new school
      setSchoolData(null);
      setSchoolCatalog(null);

      // Fetch school details and catalog in parallel
      const [school, catalog] = await Promise.all([
        getSchool(id),
        getSchoolCatalog(id, { limit: 20 }).catch(() => ({ products: [] })), // Don't fail if catalog is empty
      ]);

      console.log("Fetched school:", school);
      console.log("Fetched catalog:", catalog);

      setSchoolData(school);
      setSchoolCatalog(catalog);
    } catch (err) {
      console.error("Error fetching school data:", err);
      setSchoolError(err.message);
    } finally {
      setLoadingSchool(false);
    }
  }, [id, getSchool, getSchoolCatalog]);

  useEffect(() => {
    // Reset selected category when school changes
    setSelectedCategory("Book Sets");

    // Clear old data immediately when school ID changes
    setSchoolData(null);
    setSchoolCatalog(null);
    setSchoolError(null);

    fetchSchoolData();
  }, [id, fetchSchoolData]); // Added 'id' as dependency to trigger reset on school change

  // Handle category selection
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // Loading state
  if (loadingSchool || loading) {
    return (
      <div className="mx-12 my-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-600">
            Loading school details...
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (schoolError || error) {
    return (
      <div className="mx-12 my-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading School
          </h2>
          <p className="text-gray-500 mb-4">{schoolError || error}</p>
          <a
            href="/school"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to Schools
          </a>
        </div>
      </div>
    );
  }

  // School not found
  if (!schoolData) {
    return (
      <div className="mx-12 my-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            School Not Found
          </h2>
          <p className="text-gray-500">
            The school you're looking for doesn't exist or has been moved.
          </p>
          <a
            href="/school"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to Schools
          </a>
        </div>
      </div>
    );
  }

  const bookSets = getBookSetsForSchool(schoolCatalog);
  const uniforms = getUniformsForSchool(schoolCatalog);

  // Format location display
  const formatLocation = (school) => {
    if (school.city && school.state) {
      return `${school.city}, ${school.state}`;
    }
    return school.city || school.address?.city || "Location not specified";
  };

  // Format address display
  const formatAddress = (school) => {
    if (school.address && typeof school.address === "object") {
      const addr = school.address;
      return `${addr.line1 || ""} ${addr.line2 || ""}, ${
        addr.city || school.city
      }, ${addr.state || school.state} - ${
        addr.postalCode || school.postalCode
      }`.trim();
    }
    return school.address || "Address not available";
  };

  // Get default image
  const getSchoolImage = (school) => {
    return (
      school.image_url ||
      school.img ||
      "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg="
    );
  };

  return (
    <div className="mx-12">
      {/* School Header Image and Info */}
      <div className="relative max-w-7xl mx-auto rounded-lg shadow-md mb-8">
        <img
          src={getSchoolImage(schoolData)}
          alt={schoolData.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/70 to-transparent"></div>
        <p className="absolute bottom-6 left-6 text-white text-4xl font-semibold mb-4">
          {schoolData.name}
        </p>
        <div className="absolute bottom-2 left-6 flex items-center gap-1">
          <img src="/map_svg.svg" alt="location" className="w-4 h-4" />
          <p className="text-white text-xl">{formatLocation(schoolData)}</p>
        </div>

        {/* School Info Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm">
          <div className="flex flex-col gap-1">
            <div>
              <span className="font-semibold">Board:</span>{" "}
              {schoolData.board || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Type:</span>{" "}
              {schoolData.type || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              {schoolData.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* School Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">School Categories</h2>
        <div className="grid grid-cols-4 gap-6">
          {SchoolCategory.map((category, idx) => (
            <CategoryCard
              key={idx}
              props={category}
              onClick={() => handleCategoryClick(category.name)}
              isSelected={selectedCategory === category.name}
            />
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory} for {schoolData.name}
          </h2>
          <div className="text-right">
            <p className="text-gray-600">
              {schoolData.board &&
                `All products are ${schoolData.board} curriculum compliant`}
            </p>
            {schoolCatalog && schoolCatalog.products && (
              <p className="text-sm text-gray-500">
                {selectedCategory === "School Uniform"
                  ? uniforms.length
                  : selectedCategory === "Book Sets"
                  ? bookSets.length
                  : schoolCatalog.products.filter(
                      (p) =>
                        p.product_type ===
                        selectedCategory.toLowerCase().replace(" ", "")
                    ).length}{" "}
                products available
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 items-center justify-center">
          {selectedCategory === "School Uniform" ? (
            uniforms.map((uniform, idx) => (
              <UniformCard key={idx} props={uniform} />
            ))
          ) : selectedCategory === "Book Sets" ? (
            bookSets.map((book, idx) => <BookSetCard key={idx} props={book} />)
          ) : (
            // Placeholder for other categories
            <div className="col-span-4 text-center py-16">
              <p className="text-gray-500 text-lg">
                {selectedCategory} products coming soon...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* School Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">School Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-3">
              <span className="font-semibold text-gray-700">Full Name:</span>
              <p className="text-gray-600">{schoolData.name}</p>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-700">Board:</span>
              <p className="text-gray-600">
                {schoolData.board || "Not specified"}
              </p>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-700">Type:</span>
              <p className="text-gray-600 capitalize">
                {schoolData.type || "Not specified"}
              </p>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-700">Status:</span>
              <p
                className={`font-medium ${
                  schoolData.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {schoolData.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <div>
            <div className="mb-3">
              <span className="font-semibold text-gray-700">Location:</span>
              <p className="text-gray-600">{formatLocation(schoolData)}</p>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-700">Address:</span>
              <p className="text-gray-600">{formatAddress(schoolData)}</p>
            </div>
            {schoolData.phone && (
              <div className="mb-3">
                <span className="font-semibold text-gray-700">Phone:</span>
                <p className="text-gray-600">{schoolData.phone}</p>
              </div>
            )}
            {schoolData.email && (
              <div className="mb-3">
                <span className="font-semibold text-gray-700">Email:</span>
                <p className="text-gray-600">{schoolData.email}</p>
              </div>
            )}
            <div className="mb-3">
              <span className="font-semibold text-gray-700">School ID:</span>
              <p className="text-gray-600 text-sm font-mono">{schoolData.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolScreen;
