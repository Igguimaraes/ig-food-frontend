// MVP: cupons fixos no frontend
// Depois você pode mover isso para banco e endpoint /coupons

export const COUPONS = {
  DEV10: { type: "percent", value: 10, label: "10% OFF" },
  IGOR20: { type: "percent", value: 20, label: "20% OFF" },
  FRETEGRATIS: { type: "fixed", value: 10, label: "R$ 10 OFF" },
};

export function normalizeCoupon(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function getCoupon(code) {
  const key = normalizeCoupon(code);
  return COUPONS[key] ? { code: key, ...COUPONS[key] } : null;
}

export function calcDiscount(subtotal, coupon) {
  const s = Number(subtotal) || 0;
  if (!coupon || s <= 0) return 0;

  if (coupon.type === "percent") {
    return (s * coupon.value) / 100;
  }

  if (coupon.type === "fixed") {
    return coupon.value;
  }

  return 0;
}

export function clampDiscount(discount, subtotal) {
  const d = Number(discount) || 0;
  const s = Number(subtotal) || 0;
  return Math.max(0, Math.min(d, s));
}
