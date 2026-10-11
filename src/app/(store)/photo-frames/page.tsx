import CategoryPageTemplate from '@/components/store/CategoryPageTemplate';

export const metadata = {
  title: 'Custom Photo Frames | MSK VISUALS Madurai',
  description: 'Handcrafted luxury photo frames, wedding collage frames, gold foil religious frames, and personalized gifts in Tamil Nadu.',
};

export default function PhotoFramesPage() {
  return (
    <CategoryPageTemplate
      categorySlug="photo-frames"
      title="Luxury Photo Frames"
      subtitle="Framing Memories. Creating Smiles."
      description="Preserve your life's most precious celebrations with our bespoke collection of matte black, royal metallic gold, and multi-slot collage photo frames crafted from finest materials."
    />
  );
}
