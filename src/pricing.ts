// Store pricing — change here and it updates everywhere on the site.
export const PRICE_PKR = 1400;
export const DELIVERY_PKR = 0; // 0 = free delivery (DC free)

export const formatPKR = (n: number) => `Rs ${Math.round(n).toLocaleString('en-US')}`;
