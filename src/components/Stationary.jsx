import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiRoutesStore from "../store/apiRoutesStore";

const Stationary = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStationaryProducts();
  }, []);

  const fetchStationaryProducts = async () => {
    try {
      setLoading(true);
      const apiRoutes = useApiRoutesStore.getState();

      const response = await fetch(
        `${apiRoutes.products.search}?productType=stationary&limit=5`,
        {
          headers: apiRoutes.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stationary products");
      }

      const result = await response.json();
      setProducts(result.data?.products || []);
      setError("");
    } catch (err) {
      console.error("Error fetching stationary products:", err);
      setError(err.message);
      // Fallback to static data if API fails
      setProducts([
        {
          id: 1,
          title: "School Bag",
          img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
          category: "stationary",
        },
        {
          id: 2,
          title: "Stationery Kit",
          img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
          category: "stationary",
        },
        {
          id: 3,
          title: "Lunch Box",
          img: "https://m.media-amazon.com/images/I/51eiw+NsxpL._UF1000,1000_QL80_.jpg",
          category: "stationary",
        },
        {
          id: 4,
          title: "School Bag",
          img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
          category: "stationary",
        },
        {
          id: 5,
          title: "Stationery Kit",
          img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
          category: "stationary",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product list filtered by category
    navigate("/products", {
      state: { categorySlug: "stationary", source: "School Essentials" },
    });
  };

  const displayProducts = products.length > 0 ? products : [
    {
      id: 1,
      title: "School Bag",
      img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
    },
    {
      id: 2,
      title: "Stationery Kit",
      img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
    },
    {
      id: 3,
      title: "Lunch Box",
      img: "https://m.media-amazon.com/images/I/51eiw+NsxpL._UF1000,1000_QL80_.jpg",
    },
    {
      id: 4,
      title: "School Bag",
      img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?cs=srgb&dl=pexels-bertellifotografia-2905238.jpg&fm=jpg",
    },
    {
      id: 5,
      title: "Stationery Kit",
      img: "https://www.thestapleberry.in/cdn/shop/files/image_70e48829-3a4a-419d-b1c6-2a3ea4fb3cf9_2048x.jpg?v=1689778176",
    },
  ];

  return (
    <div className="my-6 mx-12">
      <div className="grid grid-cols-5 gap-4">
        {displayProducts.slice(0, 5).map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => handleProductClick(item)}
            className="relative w-full bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform hover:cursor-pointer"
          >
            <img
              src={item.img || item.primaryImage?.url}
              alt={item.title || item.name}
              className="w-full h-[200px] object-cover rounded-2xl"
            />
            <div className="px-4 py-2 flex flex-col items-start justify-start gap-1">
              <p className="font-nunito font-semibold">{item.title || item.name}</p>
              <p className="text-sm text-gray-500 font-nunito font-bold">
                Min. 50% Off
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stationary;
