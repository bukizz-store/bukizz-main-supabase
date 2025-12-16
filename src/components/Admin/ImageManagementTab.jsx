import React, { useState } from "react";

const ImageManagementTab = ({
  formData,
  setFormData,
  variants,
  productOptions,
}) => {
  const [images, setImages] = useState([]);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [imageType, setImageType] = useState("product");
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setImageError("Only image files are allowed");
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImageError("File size must be less than 10MB");
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    setImageError("");
  };

  const handleImageUpload = async () => {
    if (uploadMethod === "file" && selectedFiles.length === 0) {
      setImageError("Please select at least one file");
      return;
    }

    if (uploadMethod === "url" && !imageUrl) {
      setImageError("Please enter an image URL");
      return;
    }

    setUploading(true);
    setImageError("");

    try {
      const newImages = [];

      if (uploadMethod === "file") {
        for (const file of selectedFiles) {
          const imageData = {
            tempId: Date.now() + Math.random(), // Use tempId for new images
            isNew: true, // Flag to identify new images
            file: file,
            url: URL.createObjectURL(file),
            variantId: selectedVariant,
            altText: altText || file.name,
            imageType: imageType,
            isPrimary: isPrimary && selectedFiles.indexOf(file) === 0,
            source: "upload",
            fileName: file.name,
            fileSize: file.size,
            sortOrder: images.length + newImages.length,
          };
          newImages.push(imageData);
        }
      } else {
        const imageData = {
          tempId: Date.now() + Math.random(), // Use tempId for new images
          isNew: true, // Flag to identify new images
          url: imageUrl,
          variantId: selectedVariant,
          altText: altText || "Product image",
          imageType: imageType,
          isPrimary: isPrimary,
          source: "url",
          sortOrder: images.length,
        };
        newImages.push(imageData);
      }

      setImages((prev) => [...prev, ...newImages]);
      setFormData((prev) => ({
        ...prev,
        productImages: [...(prev.productImages || []), ...newImages],
      }));

      // Reset form
      setSelectedFiles([]);
      setImageUrl("");
      setAltText("");
      setIsPrimary(false);
    } catch (error) {
      setImageError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId) => {
    // Handle both tempId (new images) and id (existing images)
    const updatedImages = images.filter(
      (img) => img.id !== imageId && img.tempId !== imageId
    );
    setImages(updatedImages);
    setFormData((prev) => ({
      ...prev,
      productImages: (prev.productImages || []).filter(
        (img) => img.id !== imageId && img.tempId !== imageId
      ),
    }));
  };

  const setPrimaryImage = (imageId) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === imageId || img.tempId === imageId,
    }));
    setImages(updatedImages);
    setFormData((prev) => ({
      ...prev,
      productImages: (prev.productImages || []).map((img) => ({
        ...img,
        isPrimary: img.id === imageId || img.tempId === imageId,
      })),
    }));
  };

  // Sync with formData on component mount
  React.useEffect(() => {
    if (formData.productImages && formData.productImages.length > 0) {
      setImages(formData.productImages);
    }
  }, [formData.productImages]);

  const getVariantName = (variantId) => {
    if (!variantId) return "Main Product";
    const variant = variants.find((v) => v.id === variantId);
    return variant ? variant.optionCombination : "Unknown Variant";
  };

  const groupedImages = images.reduce((acc, image) => {
    const key = image.variantId || "main";
    if (!acc[key]) acc[key] = [];
    acc[key].push(image);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">
        Images & Media Management
      </h2>

      {imageError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {imageError}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Add New Images
        </h3>

        {/* Upload Method Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="file"
                checked={uploadMethod === "file"}
                onChange={(e) => setUploadMethod(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Upload Files</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="url"
                checked={uploadMethod === "url"}
                onChange={(e) => setUploadMethod(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Image URL</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* File Upload or URL Input */}
          <div>
            {uploadMethod === "file" ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images (Max 10MB each)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedFiles.length} file(s) selected
                  </div>
                )}
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </>
            )}
          </div>

          {/* Variant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associate with Variant (Optional)
            </label>
            <select
              value={selectedVariant || ""}
              onChange={(e) => setSelectedVariant(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Main Product Images</option>
              {variants.map((variant) => (
                <option
                  key={variant.id || variant.tempId}
                  value={variant.id || variant.tempId}
                >
                  {variant.optionCombination}
                </option>
              ))}
            </select>
          </div>

          {/* Image Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Type
            </label>
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="product">Product Image</option>
              <option value="thumbnail">Thumbnail</option>
              <option value="gallery">Gallery Image</option>
              <option value="variant">Variant Specific</option>
            </select>
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text (SEO)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descriptive text for accessibility"
            />
          </div>
        </div>

        {/* Primary Image Checkbox */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="primaryImage"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="primaryImage"
            className="ml-2 block text-sm text-gray-700"
          >
            Set as primary image for this variant/product
          </label>
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={uploading}
          className={`px-4 py-2 rounded-md font-medium ${
            uploading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Add Image(s)"}
        </button>
      </div>

      {/* Current Images Display */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-700">Current Images</h3>

        {Object.keys(groupedImages).length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p>No images uploaded yet</p>
            <p className="text-sm">Add images using the form above</p>
          </div>
        ) : (
          Object.entries(groupedImages).map(([variantKey, variantImages]) => (
            <div key={variantKey} className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">
                {getVariantName(
                  variantKey === "main" ? null : variants[variantKey]?.id
                )}
                {variantKey !== "main" && (
                  <span className="text-sm text-gray-600 ml-2">
                    ({variantImages.length} image
                    {variantImages.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {variantImages.map((image) => (
                  <div
                    key={image.id || image.tempId}
                    className="relative group"
                  >
                    <div
                      className={`border-2 rounded-lg overflow-hidden ${
                        image.isPrimary ? "border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.altText}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {image.imageType}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600 truncate">
                        {image.altText}
                      </p>
                      <p className="text-xs text-gray-500">
                        Source: {image.source}
                        {image.fileName && ` (${image.fileName})`}
                      </p>
                      {image.fileSize && (
                        <p className="text-xs text-gray-500">
                          Size: {(image.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                      {image.isNew && (
                        <p className="text-xs text-green-600 font-medium">
                          New Image (will be uploaded)
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex space-x-1">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() =>
                            setPrimaryImage(image.id || image.tempId)
                          }
                          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(image.id || image.tempId)}
                        className="text-xs bg-red-200 hover:bg-red-300 text-red-700 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bulk Upload for Variants */}
      {variants.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">
            Bulk Variant Image Upload
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Upload multiple images and automatically assign them to variants
            based on naming convention.
          </p>
          <button
            type="button"
            className="text-sm bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded"
            onClick={() =>
              alert("Bulk upload feature would be implemented here")
            }
          >
            Open Bulk Upload Tool
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageManagementTab;
