import { create } from "zustand";
import { formatUserError } from "../utils/errorHandler";

const useNotificationStore = create((set, get) => ({
  notifications: [],

  // Add a new notification
  showNotification: (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: "error", // default type
      title: "Notification",
      message: "",
      autoClose: true,
      duration: notification.actionLabel ? 6000 : 3500,
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    return id;
  },

  // Remove a notification
  hideNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  // Clear all notifications
  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // Convenience methods for different types with automatic error simplification
  showError: (titleOrError, message, options = {}) => {
    let finalTitle = "Error";
    let finalMessage = "";
    let finalOptions = {};

    if (titleOrError && typeof titleOrError === "object" && typeof message !== "string") {
      // Called as showError(new Error("..."), options)
      finalOptions = message || {};
      const formatted = formatUserError(titleOrError);
      finalTitle = formatted.title;
      finalMessage = formatted.message;
      if (formatted.actionLabel && !finalOptions.actionLabel) {
        finalOptions.actionLabel = formatted.actionLabel;
        finalOptions.onAction = formatted.onAction;
      }
    } else if (typeof titleOrError === "string" && (!message || typeof message === "object")) {
      // Called as showError("Some error string", options)
      finalOptions = (typeof message === "object" ? message : options) || {};
      const formatted = formatUserError(titleOrError);
      finalTitle = formatted.title;
      finalMessage = formatted.message;
      if (formatted.actionLabel && !finalOptions.actionLabel) {
        finalOptions.actionLabel = formatted.actionLabel;
        finalOptions.onAction = formatted.onAction;
      }
    } else {
      // Called as showError("Title", "Message", options)
      finalTitle = titleOrError || "Error";
      finalOptions = options || {};
      const formatted = formatUserError(message || titleOrError);

      // If title is generic, substitute with user-friendly categorized title
      const lowerTitle = String(finalTitle).toLowerCase().trim();
      if (
        !finalTitle ||
        lowerTitle === "error" ||
        lowerTitle === "notification" ||
        lowerTitle === "failed" ||
        lowerTitle === "something went wrong" ||
        lowerTitle === "api error"
      ) {
        finalTitle = formatted.title;
      }
      finalMessage = formatted.message;
      if (formatted.actionLabel && !finalOptions.actionLabel) {
        finalOptions.actionLabel = formatted.actionLabel;
        finalOptions.onAction = formatted.onAction;
      }
    }

    return get().showNotification({
      type: "error",
      title: finalTitle,
      message: finalMessage,
      ...finalOptions,
    });
  },

  showSuccess: (title, message, options = {}) => {
    return get().showNotification({
      type: "success",
      title,
      message,
      duration: 3000,
      ...options,
    });
  },

  showWarning: (title, message, options = {}) => {
    return get().showNotification({
      type: "warning",
      title,
      message,
      duration: 4000,
      ...options,
    });
  },

  showInfo: (title, message, options = {}) => {
    return get().showNotification({
      type: "info",
      title,
      message,
      duration: 3500,
      ...options,
    });
  },
}));

export default useNotificationStore;
