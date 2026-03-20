/**
 * Utility to calculate delivery estimate strings based on product delivery hours.
 * Business rules:
 * - Working hours: 8 AM to 10 PM.
 * - If current time + delivery hours exceeds 10 PM of the same day, display "Next Day Delivery" (or similar).
 * - Else, display "Same Day Delivery".
 * 
 * @param {number} deliveryHours - Estimated hours for delivery
 * @param {Date} referenceDate - The reference date when the order was created/viewed
 * @returns {string} Delivery estimate message
 */
export const getDeliveryEstimate = (deliveryHours = 24, referenceDate = new Date()) => {
  const current = new Date(referenceDate);
  const deliveryTime = new Date(current.getTime() + deliveryHours * 60 * 60 * 1000);

  // Check if delivery crosses to the next calendar day
  const isNextDay =
    deliveryTime.getDate() > current.getDate() ||
    deliveryTime.getMonth() > current.getMonth() ||
    deliveryTime.getFullYear() > current.getFullYear();

  // If the calculated delivery time is after 10 PM (22:00) of the SAME day, 
  // or it actually lands on a future day, it's next day delivery.
  if (isNextDay || deliveryTime.getHours() >= 22) {
    return "Delivery by Tomorrow";
  }

  // Otherwise, it can be delivered today within working hours
  return "Same Day Delivery";
};
