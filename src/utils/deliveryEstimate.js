/**
 * Utility to calculate delivery estimate strings and target dates based on
 * Retailer Packaging Time + Admin Delivery/Transit Time.
 * 
 * Business rules:
 * - Working hours: 8 AM to 10 PM.
 * - Same day delivery if order time + total hours <= 10 PM today.
 * - Next day delivery if order time + total hours lands tomorrow.
 * - Formatted date (e.g. "Delivery by Thu, 27 Aug") for multi-day lead times.
 */

/**
 * Calculates the target Date object for delivery.
 * @param {number|object} packagingOrProduct - Packaging hours or product object
 * @param {number} deliveryHours - Delivery / transit hours
 * @param {Date|string} referenceDate - Base date (order createdAt or now)
 * @returns {Date} Target delivery Date
 */
export const calculateEstimatedDeliveryDate = (
  packagingOrProduct = 4,
  deliveryHours = 24,
  referenceDate = new Date()
) => {
  let packHours = 4;
  let delHours = 24;

  if (typeof packagingOrProduct === "object" && packagingOrProduct !== null) {
    const p = packagingOrProduct;
    packHours =
      p.packaging_hours ??
      p.packagingHours ??
      p.metadata?.packagingHours ??
      p.productData?.packagingHours ??
      4;
    delHours =
      p.delivery_hours ??
      p.deliveryHours ??
      p.metadata?.deliveryHours ??
      p.productData?.deliveryHours ??
      24;
  } else {
    packHours = Number(packagingOrProduct) || 0;
    delHours = Number(deliveryHours) || 0;
  }

  const totalLeadHours = (packHours + delHours) || 24;
  const current = new Date(referenceDate);

  // If order is placed after 10 PM (22:00), shift base time to next day 8 AM
  let startTimestamp = current.getTime();
  if (current.getHours() >= 22) {
    const nextDay = new Date(current);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(8, 0, 0, 0);
    startTimestamp = nextDay.getTime();
  } else if (current.getHours() < 8) {
    const sameDayMorning = new Date(current);
    sameDayMorning.setHours(8, 0, 0, 0);
    startTimestamp = sameDayMorning.getTime();
  }

  return new Date(startTimestamp + totalLeadHours * 60 * 60 * 1000);
};

/**
 * Generates user-friendly delivery estimate label.
 * @param {number|object} packagingOrProduct - Packaging hours or product object
 * @param {number} deliveryHours - Delivery / transit hours
 * @param {Date|string} referenceDate - Reference date
 * @returns {string} e.g. "Same Day Delivery", "Delivery by Tomorrow", "Delivery by Wed, 26 Aug"
 */
export const getDeliveryEstimate = (
  packagingOrProduct = 4,
  deliveryHours = 24,
  referenceDate = new Date()
) => {
  const targetDate = calculateEstimatedDeliveryDate(
    packagingOrProduct,
    deliveryHours,
    referenceDate
  );
  const current = new Date(referenceDate);

  const isToday =
    targetDate.getDate() === current.getDate() &&
    targetDate.getMonth() === current.getMonth() &&
    targetDate.getFullYear() === current.getFullYear();

  const tomorrow = new Date(current);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    targetDate.getDate() === tomorrow.getDate() &&
    targetDate.getMonth() === tomorrow.getMonth() &&
    targetDate.getFullYear() === tomorrow.getFullYear();

  if (isToday && targetDate.getHours() <= 22) {
    return "Same Day Delivery";
  }

  if (isTomorrow) {
    return "Delivery by Tomorrow";
  }

  const options = { weekday: "short", month: "short", day: "numeric" };
  return `Delivery by ${targetDate.toLocaleDateString("en-IN", options)}`;
};
