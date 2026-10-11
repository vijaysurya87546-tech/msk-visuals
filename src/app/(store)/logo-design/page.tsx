import CategoryPageTemplate from '@/components/store/CategoryPageTemplate';

export const metadata = {
  title: 'Creative Logo Design & Branding | MSK VISUALS Madurai',
  description: 'Vector logo design, brand identity systems, social media kits, and corporate visual design by senior designers in Madurai.',
};

export default function LogoDesignPage() {
  return (
    <CategoryPageTemplate
      categorySlug="logo"
      title="Creative Logo Design"
      subtitle="Iconic Identity. Unforgettable First Impression."
      description="Elevate your business brand with distinctive, modern, and memorable logo solutions inspired by the MSK wolf aesthetic. Delivered in vector AI, EPS, SVG, and high-res print files with full copyright ownership."
    />
  );
}
