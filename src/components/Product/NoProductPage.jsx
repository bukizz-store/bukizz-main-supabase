import React from 'react'
import SearchBar from '../SearchBar'
import { useNavigate } from 'react-router-dom';

const NoProductPage = () => {
    const navigate = useNavigate();
  return (
    <div>
            <div className="min-h-screen bg-[#F3F8FF] flex flex-col relative">
        <SearchBar />
        <div className="mx-12 my-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-500">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoProductPage
