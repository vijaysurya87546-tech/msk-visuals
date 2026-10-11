import CategoryPageTemplate from '@/components/store/CategoryPageTemplate';

export const metadata = {
  title: 'Artisan Resin Art & Coasters | MSK VISUALS Madurai',
  description: 'Handcrafted ocean wave geode wall art, botanical floral resin coasters, and custom clocks made with real 24K gold foil.',
};

export default function ResinArtPage() {
  return (
    <CategoryPageTemplate
      categorySlug="resin-art"
      title="Customized Resin Art"
      subtitle="Liquid Elegance. Frozen in Crystal Time."
      description="Each resin creation is an original fluid abstract work of art. Poured by hand with multi-tier pigments, ocean waves, genuine quartz crystals, and sealed with high-gloss heat resistant epoxy."
    />
  );
}
