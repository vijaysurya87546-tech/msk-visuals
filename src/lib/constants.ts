// =============================================
// MSK VISUALS - Constants
// =============================================

export const BUSINESS = {
  name: 'MSK VISUALS',
  tagline: 'WE DESIGN. YOU IMPRESS.',
  subtitle: 'Framing Memories. Creating Smiles.',
  description: 'Premium photo frames, high-quality printing, resin art, DIY candles and creative design solutions — crafted with care.',
  email: 'meganathan2174@gmail.com',
  mobile: '+91 93612 53338',
  whatsapp: '+91 84385 33409',
  whatsappNumber: '918438533409',
  whatsappUrl: 'https://wa.me/918438533409',
  instagram: '@msk.vsls',
  instagramUrl: 'https://instagram.com/msk.vsls',
  address: 'Madurai, Tamil Nadu, India',
  location: {
    city: 'Madurai',
    state: 'Tamil Nadu',
    country: 'India',
  },
} as const;

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Designing',
  'Printing',
  'Processing',
  'Ready',
  'Shipped',
  'Delivered',
  'Cancelled',
] as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: '#F59E0B',
  Confirmed: '#3B82F6',
  Designing: '#8B5CF6',
  Printing: '#6366F1',
  Processing: '#EC4899',
  Ready: '#10B981',
  Shipped: '#06B6D4',
  Delivered: '#22C55E',
  Cancelled: '#EF4444',
};

export const SERVICES = [
  {
    title: 'Photo Frames',
    description: 'Premium quality photo frames crafted with the finest materials to preserve your cherished memories.',
    icon: 'Frame',
    slug: 'photo-frames',
  },
  {
    title: 'Printing',
    description: 'High-quality printing services with vibrant colors and sharp details that bring your photos to life.',
    icon: 'Printer',
    slug: 'printing',
  },
  {
    title: 'Resin Art',
    description: 'Stunning customized resin art creations — each piece uniquely handcrafted with artistic precision.',
    icon: 'Gem',
    slug: 'resin-art',
  },
  {
    title: 'DIY Candles',
    description: 'Handmade candles crafted with perfection, perfect for home décor and thoughtful gifting.',
    icon: 'Flame',
    slug: 'diy-candles',
  },
  {
    title: 'Logo Design',
    description: 'Creative professional logo design solutions that define your brand identity with impact.',
    icon: 'PenTool',
    slug: 'logo-design',
  },
] as const;

export const WHY_CHOOSE_US = [
  {
    title: 'Premium Quality',
    description: 'Every product is crafted with the finest materials and attention to detail.',
    icon: 'Award',
  },
  {
    title: 'Customized Designs',
    description: 'Fully personalized products tailored to your vision and preferences.',
    icon: 'Palette',
  },
  {
    title: 'Safe Packaging',
    description: 'Premium packaging ensures your products arrive in perfect condition.',
    icon: 'Package',
  },
  {
    title: 'Fast Dispatch',
    description: 'Quick processing and fast dispatch for all orders across Tamil Nadu.',
    icon: 'Zap',
  },
  {
    title: 'Pan Tamil Nadu',
    description: 'Reliable delivery service across all districts of Tamil Nadu.',
    icon: 'MapPin',
  },
  {
    title: 'WhatsApp Support',
    description: 'Easy ordering and support through WhatsApp for a seamless experience.',
    icon: 'MessageCircle',
  },
] as const;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
