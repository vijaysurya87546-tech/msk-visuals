import CategoryPageTemplate from '@/components/store/CategoryPageTemplate';

export const metadata = {
  title: 'Flex Printing Services | MSK VISUALS Madurai',
  description: 'High-quality flex banners, hoardings, signboards, vinyl stickers, and commercial display printing across Tamil Nadu.',
};

export default function FlexPage() {
  return (
    <CategoryPageTemplate
      categorySlug="flex"
      title="Flex & Display Printing"
      subtitle="Vibrant Banners. Weatherproof Materials."
      description="Experience unrivaled durability and visual punch with our commercial flex banners, hoardings, frontlit & backlit boards, vinyl adhesives, and crystal acrylic prints."
    />
  );
}
