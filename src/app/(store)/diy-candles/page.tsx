import CategoryPageTemplate from '@/components/store/CategoryPageTemplate';

export const metadata = {
  title: 'Handmade Luxury Soy Candles | MSK VISUALS Madurai',
  description: '100% natural organic soy wax candles with essential oils, clean cotton wicks, and luxury matte black containers.',
};

export default function DiyCandlesPage() {
  return (
    <CategoryPageTemplate
      categorySlug="candle"
      title="Handmade DIY Candles"
      subtitle="Pure Aromatherapy. Crafted With Perfection."
      description="Indulge in our soothing artisanal candles made with 100% natural soy wax, lead-free cotton wicks, and pure essential oil infusions. Designed to bring serenity and warm aesthetic ambiance to any space."
    />
  );
}
