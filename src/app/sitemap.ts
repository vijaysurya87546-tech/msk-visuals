import { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mskvisuals.com';

  const staticRoutes = [
    '',
    '/shop',
    '/photo-frames',
    '/printing',
    '/resin-art',
    '/diy-candles',
    '/logo-design',
    '/custom-orders',
    '/price-list',
    '/about',
    '/contact',
    '/cart',
    '/checkout',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = INITIAL_PRODUCTS.map((prod) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
