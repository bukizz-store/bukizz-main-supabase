import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiRoutesStore from "../store/apiRoutesStore";

const DealsSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDealsProducts();
  }, []);

  const fetchDealsProducts = async () => {
    try {
      setLoading(true);
      const apiRoutes = useApiRoutesStore.getState();

      const response = await fetch(
        `${apiRoutes.products.search}?productType=stationary&limit=6`,
        {
          headers: apiRoutes.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch deals");
      }

      const result = await response.json();
      setProducts(result.data?.products || []);
      setError("");
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err.message);
      // Fallback to static data
      setProducts([
        {
          id: 1,
          name: "School Bag",
          img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
        },
        {
          id: 2,
          name: "Stationery Kit",
          img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
        },
        {
          id: 3,
          name: "Lunch Box",
          img: "https://m.media-amazon.com/images/I/51eiw+NsxpL._UF1000,1000_QL80_.jpg",
        },
        {
          id: 4,
          name: "School Bag",
          img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
        },
        {
          id: 5,
          name: "Stationery Kit",
          img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
        },
        {
          id: 6,
          name: "Lunch Box",
          img: "https://m.media-amazon.com/images/I/51eiw+NsxpL._UF1000,1000_QL80_.jpg",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = () => {
    // Navigate to product list filtered by category
    navigate("/products", {
      state: { categorySlug: "stationary", source: "Deals for You" },
    });
  };

  const handleShopNowClick = () => {
    // Navigate to product list filtered by category
    navigate("/products", {
      state: { categorySlug: "stationary", source: "Deals for You" },
    });
  };

  const displayProducts = products.length > 0 ? products : [
    {
      id: 1,
      name: "School Bag",
      img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
    },
    {
      id: 2,
      name: "Stationery Kit",
      img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
    },
    {
      id: 3,
      name: "Lunch Box",
      img: "https://m.media-amazon.com/images/I/51eiw+NsxpL._UF1000,1000_QL80_.jpg",
    },
    {
      id: 4,
      name: "School Bag",
      img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
    },
    {
      id: 5,
      name: "Stationery Kit",
      img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
    },
    {
      id: 6,
      name: "Lunch Box",
      img: "https://m.media-amazon.com/images/I/51eiw+NsxpL._UF1000,1000_QL80_.jpg",
    },
  ];

  return (
    <div className="my-6 px-4 mx-12">
      <h2 className="text-4xl font-bold my-8">Deals For You</h2>
      <div className="flex gap-4">
        <div className="w-[550px] bg-[#FF8C22] p-10 flex flex-col justify-center rounded-3xl shadow-lg font-nunito">
          <h3 className="text-white text-4xl font-bold mb-2">
            Special Deals on School Supplies
          </h3>
          <p className="text-white mb-2 font-semibold text-xl">Upto 50% off on selected Items</p>
          <button
            onClick={handleShopNowClick}
            className="bg-white text-orange-500 font-bold px-4 py-2 rounded-xl w-32 shadow-lg hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </button>
        </div>
        <div className="grid grid-cols-3 gap-12 flex-1">
          {displayProducts.slice(0, 6).map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={handleProductClick}
              className="relative bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform hover:cursor-pointer"
            >
              <img
                src={item.img || item.primaryImage?.url}
                alt={item.name || item.title}
                className="w-full h-[180px] object-cover rounded-2xl "
              />
              <div className="px-4 py-2 flex flex-col items-start justify-start gap-1">
                <p>{item.name || item.title}</p>
                <p className="text-sm text-gray-500">Min. 50% Off</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealsSection;
