import React, { useEffect } from "react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    // Redirect to profile page with orders tab active
    navigate("/profile?tab=orders", { replace: true });
  }, [user, navigate]);

  return null;
};

export default OrdersPage;
