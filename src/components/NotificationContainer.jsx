import React from "react";
import useNotificationStore from "../store/notificationStore";
import ErrorPopup from "./ErrorPopup";

const NotificationContainer = () => {
  const { notifications, hideNotification } = useNotificationStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{
            zIndex: 1000 + index,
            marginTop: `${index * 80}px`,
          }}
        >
          <ErrorPopup
            isOpen={true}
            onClose={() => hideNotification(notification.id)}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            autoClose={notification.autoClose}
            duration={notification.duration}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
