// =============================================
// MSK VISUALS - Utility Functions
// =============================================

import { BUSINESS } from './constants';

/**
 * Format price in Indian Rupees
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Generate order ID: MSK-ORD-YYYY-NNNN
 */
export function generateOrderId(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSeq = String(sequence).padStart(4, '0');
  return `MSK-ORD-${year}-${paddedSeq}`;
}

/**
 * Generate custom order ID: MSK-CUST-YYYY-NNNN
 */
export function generateCustomOrderId(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSeq = String(sequence).padStart(4, '0');
  return `MSK-CUST-${year}-${paddedSeq}`;
}

/**
 * Generate WhatsApp URL with pre-filled message
 */
export function generateWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate WhatsApp order message
 */
export function generateOrderWhatsAppMessage(order: {
  orderId: string;
  items: Array<{ name: string; size?: string; quantity: number; price: number }>;
  total: number;
  customerName: string;
  customerPhone: string;
}): string {
  let message = `Hello MSK VISUALS,\n\nI would like to place an order.\n\n`;
  message += `Order ID: ${order.orderId}\n\n`;

  order.items.forEach((item, index) => {
    message += `Product ${index + 1}: ${item.name}\n`;
    if (item.size) message += `Size: ${item.size}\n`;
    message += `Quantity: ${item.quantity}\n`;
    message += `Price: ${formatPrice(item.price)}\n\n`;
  });

  message += `Total: ${formatPrice(order.total)}\n\n`;
  message += `Name: ${order.customerName}\n`;
  message += `Phone: ${order.customerPhone}\n\n`;
  message += `Thank you.`;

  return message;
}

/**
 * Format date
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indian phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate pincode
 */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Designing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Printing: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    Processing: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    Ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

/**
 * CN utility for conditional classnames
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
