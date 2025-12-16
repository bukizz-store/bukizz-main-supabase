import { create } from "zustand";

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
      duration: 5000,
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

  // Convenience methods for different types
  showError: (title, message, options = {}) => {
    return get().showNotification({
      type: "error",
      title,
      message,
      ...options,
    });
  },

  showSuccess: (title, message, options = {}) => {
    return get().showNotification({
      type: "success",
      title,
      message,
      ...options,
    });
  },

  showWarning: (title, message, options = {}) => {
    return get().showNotification({
      type: "warning",
      title,
      message,
      ...options,
    });
  },

  showInfo: (title, message, options = {}) => {
    return get().showNotification({
      type: "info",
      title,
      message,
      ...options,
    });
  },
}));

export default useNotificationStore;
