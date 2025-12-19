// eCom/lib/pricing.ts
// Pricing and commission calculation utilities

/**
 * Calculate GST amount
 */
export function calculateGST(amount: number, gstRate: number): number {
  return (amount * gstRate) / 100;
}

/**
 * Calculate commission amount
 */
export function calculateCommission(
  amount: number,
  commissionRate: number
): number {
  return (amount * commissionRate) / 100;
}

/**
 * Calculate net payout to seller
 */
export function calculateNetPayout(
  grossAmount: number,
  commissionRate: number,
  taxAmount: number = 0
): number {
  const commission = calculateCommission(grossAmount, commissionRate);
  return grossAmount - commission - taxAmount;
}

/**
 * Calculate order totals
 */
export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export function calculateOrderTotals(params: {
  items: Array<{ price: number; quantity: number; gstRate?: number }>;
  shippingCost?: number;
  discountAmount?: number;
}): OrderTotals {
  const subtotal = params.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = params.shippingCost || 0;
  const discount = params.discountAmount || 0;

  // Calculate tax on items (GST)
  const tax = params.items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const gstRate = item.gstRate || 0;
    return sum + calculateGST(itemTotal, gstRate);
  }, 0);

  const total = subtotal + shipping + tax - discount;

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total: Math.max(0, total), // Ensure non-negative
  };
}

/**
 * Format currency (Indian Rupees)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
