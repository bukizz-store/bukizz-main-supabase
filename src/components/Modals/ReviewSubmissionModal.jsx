import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Star,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import useApiRoutesStore from "../../store/apiRoutesStore";
import useNotificationStore from "../../store/notificationStore";
import { simplifyErrorMessage } from "../../utils/errorHandler";

const RATING_LABELS = {
  1: { label: "Poor", color: "text-rose-600 bg-rose-50 border-rose-200" },
  2: { label: "Fair", color: "text-orange-600 bg-orange-50 border-orange-200" },
  3: { label: "Good", color: "text-amber-600 bg-amber-50 border-amber-200" },
  4: { label: "Very Good", color: "text-teal-600 bg-teal-50 border-teal-200" },
  5: { label: "Excellent", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * ReviewSubmissionModal
 *
 * Modal for submitting and updating product ratings & reviews with Cloudflare R2 image uploads.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Dismiss callback
 * @param {Object} props.item - Order item being reviewed
 * @param {Object} props.order - Order containing this item
 * @param {Function} props.onReviewSubmitted - Callback after successful review submission
 * @param {Object} [props.existingReview] - Pre-existing user review for editing
 */
const ReviewSubmissionModal = ({
  isOpen,
  onClose,
  item,
  order,
  onReviewSubmitted,
  existingReview = null,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize or reset form state when modal opens or item/existingReview changes
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(Number(existingReview.rating) || 5);
        setTitle(existingReview.title || "");
        setComment(existingReview.comment || "");
        setExistingImages(
          Array.isArray(existingReview.images) ? existingReview.images : []
        );
      } else {
        setRating(0);
        setTitle("");
        setComment("");
        setExistingImages([]);
      }
      setSelectedFiles([]);
      setFilePreviews([]);
      setErrorMessage("");
      setHoverRating(0);
    }
  }, [isOpen, existingReview, item]);

  // Clean up object URLs on unmount or when files change
  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [filePreviews]);

  // Auto-expand textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [comment]);

  if (!isOpen || !item) return null;

  const productId =
    item.productId ||
    item.product_id ||
    item.productSnapshot?.id ||
    item.productSnapshot?._id;

  // Extract school or grade subtitle from attributes
  const schoolName =
    item.productSnapshot?.attributes?.school_name ||
    item.productSnapshot?.school_name ||
    null;
  const gradeLabel =
    item.productSnapshot?.attributes?.grade ||
    item.productSnapshot?.grade ||
    null;

  const totalImageCount = existingImages.length + selectedFiles.length;

  const handleFilesSelected = (newFiles) => {
    setErrorMessage("");
    const validFiles = [];
    const validPreviews = [];

    for (const file of newFiles) {
      if (existingImages.length + selectedFiles.length + validFiles.length >= MAX_IMAGES) {
        setErrorMessage(`You can upload a maximum of ${MAX_IMAGES} photos.`);
        break;
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setErrorMessage("Only JPEG, PNG, and WebP images are supported.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`"${file.name}" exceeds the 10MB limit.`);
        continue;
      }

      validFiles.push(file);
      validPreviews.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setFilePreviews((prev) => [...prev, ...validPreviews]);
    }
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveSelectedFile = (indexToRemove) => {
    const previewToRemove = filePreviews[indexToRemove];
    if (previewToRemove?.url) {
      URL.revokeObjectURL(previewToRemove.url);
    }
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFilePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage("Please select a star rating from 1 to 5.");
      return;
    }

    const trimmedComment = comment.trim();
    if (!trimmedComment || trimmedComment.length < 10) {
      setErrorMessage("Please provide a review comment with at least 10 characters.");
      return;
    }

    if (trimmedComment.length > 2000) {
      setErrorMessage("Review comment cannot exceed 2000 characters.");
      return;
    }

    if (!productId) {
      setErrorMessage("Unable to identify product ID for review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("custom_token");

      const formData = new FormData();
      formData.append("rating", rating.toString());
      if (title.trim()) {
        formData.append("title", title.trim());
      }
      formData.append("comment", trimmedComment);

      // Append existing retained images (if editing)
      if (existingImages.length > 0) {
        formData.append("images", JSON.stringify(existingImages));
      }

      // Append new image files
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const isUpdate = Boolean(existingReview && existingReview.id);
      const endpoint = isUpdate
        ? useApiRoutesStore.getState().reviews.update(existingReview.id)
        : useApiRoutesStore.getState().reviews.byProduct(productId);

      const response = await fetch(endpoint, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && (result.success || response.status === 200 || response.status === 201)) {
        useNotificationStore
          .getState()
          .showSuccess(
            "Review Submitted",
            "Review submitted! Thank you for helping other parents"
          );

        if (onReviewSubmitted) {
          onReviewSubmitted(result.data || {
            productId,
            rating,
            title: title.trim(),
            comment: trimmedComment,
            images: existingImages,
          });
        }
        onClose();
      } else {
        const errorMsg =
          result.message ||
          result.error ||
          "Failed to submit your review. Please try again.";
        setErrorMessage(simplifyErrorMessage(errorMsg));
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setErrorMessage(simplifyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[activeRating];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
              {item.productSnapshot?.image_url ? (
                <img
                  src={item.productSnapshot.image_url}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="review-modal-title"
                className="text-base font-semibold text-slate-900 leading-snug line-clamp-1"
                title={item.title}
              >
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {schoolName && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200/70">
                    {schoolName}
                  </span>
                )}
                {gradeLabel && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    Grade {gradeLabel}
                  </span>
                )}
                {order?.id && (
                  <span className="text-[11px] text-slate-400">
                    Order #{order.id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex-shrink-0"
            aria-label="Close review dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERIFIED PURCHASE BADGE */}
        <div className="px-4 sm:px-5 py-2 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-800 tracking-wide">
            Verified Buyer Review
          </span>
          <span className="text-[11px] text-emerald-600 ml-auto hidden sm:inline">
            Helps parents shop with confidence
          </span>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {/* INLINE ERROR BANNER */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* INTERACTIVE STAR RATING */}
          <div className="text-center py-2 bg-slate-50/70 rounded-xl border border-slate-100">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2.5">
              Rate This Product
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = (hoverRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg transition-transform duration-150 hover:scale-115 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    aria-label={`Rate ${starValue} out of 5 stars`}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-200 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "fill-slate-100 text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* HELPER LABEL */}
            <div className="h-6 mt-2 flex items-center justify-center">
              {ratingInfo ? (
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200 ${ratingInfo.color}`}
                >
                  {ratingInfo.label} ({activeRating}/5)
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Select 1 to 5 stars
                </span>
              )}
            </div>
          </div>

          {/* REVIEW TITLE INPUT */}
          <div>
            <label
              htmlFor="review-title"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Review Title <span className="text-slate-400 normal-case">(optional)</span>
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience (optional)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            />
          </div>

          {/* REVIEW COMMENT TEXTAREA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="review-comment"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Detailed Review <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  comment.length > 2000
                    ? "text-rose-600 font-bold"
                    : comment.length < 10 && comment.length > 0
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {comment.length} / 2000
              </span>
            </div>
            <textarea
              id="review-comment"
              ref={textareaRef}
              rows={3}
              value={comment}
              maxLength={2000}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the quality, print, or fit? Share details to help other parents..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none leading-relaxed"
            />
            {comment.length > 0 && comment.trim().length < 10 && (
              <p className="text-[11px] text-amber-600 mt-1">
                Minimum 10 characters required ({10 - comment.trim().length} more needed).
              </p>
            )}
          </div>

          {/* PHOTO UPLOAD ZONE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Add Photos <span className="text-slate-400 normal-case">(up to 5 images)</span>
              </label>
              <span className="text-xs text-slate-400">
                {totalImageCount} / {MAX_IMAGES}
              </span>
            </div>

            {/* DROPZONE */}
            {totalImageCount < MAX_IMAGES && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-teal-500 bg-teal-50/60"
                    : "border-slate-200 hover:border-teal-400 hover:bg-slate-50/50 bg-slate-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesSelected(Array.from(e.target.files));
                    }
                    e.target.value = "";
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    <span className="text-teal-600 hover:underline">Click to upload</span> or drag & drop
                  </div>
                  <p className="text-[11px] text-slate-400">
                    JPEG, PNG, WebP up to 10MB each
                  </p>
                </div>
              </div>
            )}

            {/* THUMBNAIL PREVIEWS GRID */}
            {totalImageCount > 0 && (
              <div className="grid grid-cols-5 gap-2.5 mt-3">
                {/* Existing Images */}
                {existingImages.map((imageUrl, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative aspect-square rounded-xl border border-slate-200 bg-slate-100 overflow-hidden group shadow-xs"
                  >
                    <img
                      src={imageUrl}
                      alt={`Review photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                      Saved
                    </span>
                  </div>
                ))}

                {/* Newly Selected Local Files */}
                {filePreviews.map((preview, idx) => (
                  <div
                    key={preview.id}
                    className="relative aspect-square rounded-xl border border-teal-200 bg-teal-50/30 overflow-hidden group shadow-xs"
                  >
                    <img
                      src={preview.url}
                      alt={preview.file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-teal-700 text-white text-[9px] px-1 rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-3 focus:ring-teal-500/25 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : existingReview ? (
                <span>Update Review</span>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewSubmissionModal;
