import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiRoutesStore from "../../store/apiRoutesStore";
import useAuthStore from "../../store/authStore";
import SearchBar from "../../components/Common/SearchBar";
import { Trash2, Edit, Plus, Upload, X, Image as ImageIcon } from "lucide-react";

function AdminCategoryPage() {
    const navigate = useNavigate();
    const { categories: categoryRoutes } = useApiRoutesStore();
    const { isAuthenticated } = useAuthStore();
    const apiRoutes = useApiRoutesStore.getState();

    // Data State
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        image: null,      // For storing the file object
        imagePreview: "", // For displaying the preview
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(categoryRoutes.getAll);
            if (!response.ok) throw new Error("Failed to fetch categories");
            const result = await response.json();
            setCategories(result.data.categories || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file),
            }));
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
            imagePreview: "",
        }));
    };

    const openModal = (category = null) => {
        if (category) {
            setIsEditing(true);
            setCurrentId(category.id);
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || "",
                parentId: category.parentId || "",
                image: null,
                imagePreview: category.image || "",
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                name: "",
                slug: "",
                description: "",
                parentId: "",
                image: null,
                imagePreview: "",
            });
        }
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            name: "",
            slug: "",
            description: "",
            parentId: "",
            image: null,
            imagePreview: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const url = isEditing
                ? categoryRoutes.admin.update(currentId)
                : categoryRoutes.admin.create;

            const method = isEditing ? "PUT" : "POST";

            // Use FormData for file upload
            const data = new FormData();
            data.append("name", formData.name);
            if (formData.slug) data.append("slug", formData.slug);
            data.append("description", formData.description);
            if (formData.parentId) data.append("parentId", formData.parentId);

            // Only append image if a new file is selected
            if (formData.image instanceof File) {
                data.append("image", formData.image);
            }

            const response = await fetch(url, {
                method,
                headers: {
                    // Content-Type is separate-boundary for multipart, so don't set it manually
                    // But we DO need Auth header
                    ...apiRoutes.getAuthHeaders(), // This adds Content-Type: application/json which breaks multipart
                },
                body: data,
            });

            // FIX: Remove Content-Type header for FormData to let browser set boundary
            const headers = apiRoutes.getAuthHeaders();
            delete headers["Content-Type"];

            const uploadResponse = await fetch(url, {
                method,
                headers: headers,
                body: data,
            });

            if (!uploadResponse.ok) {
                const errData = await uploadResponse.json();
                throw new Error(errData.message || "Operation failed");
            }

            setSuccess(isEditing ? "Category updated successfully" : "Category created successfully");
            fetchCategories();
            closeModal();
        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            const response = await fetch(categoryRoutes.admin.delete(id), {
                method: "DELETE",
                headers: apiRoutes.getAuthHeaders(),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Delete failed");
            }

            setSuccess("Category deleted successfully");
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
            <SearchBar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Add Category
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {/* Categories List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Image</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Slug</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No categories found.</td></tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                {cat.image ? (
                                                    <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{cat.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(cat)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? "Edit Category" : "New Category"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="e.g. Science Books"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Optional)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="e.g. science-books"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Brief description..."
                                ></textarea>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />

                                    {formData.imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={formData.imagePreview}
                                                alt="Preview"
                                                className="h-40 mx-auto object-contain rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevent opening file dialog
                                                    e.stopPropagation(); // Stop bubbling
                                                    removeImage();
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Upload className="text-blue-600" size={24} />
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.name}
                                    className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? "Saving..." : (isEditing ? "Update Category" : "Create Category")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategoryPage;
