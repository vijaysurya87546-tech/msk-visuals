import CategoryPageTemplate from '@/components/store/CategoryPageTemplate';

export const metadata = {
  title: 'High-Definition Printing Services | MSK VISUALS Madurai',
  description: 'Museum-grade canvas wraps, high-gloss luster photo prints, vinyls, and acrylic printing across Tamil Nadu.',
};

export default function PrintingPage() {
  return (
    <CategoryPageTemplate
      categorySlug="printing"
      title="High-Definition Printing"
      subtitle="Vivid Details. 100-Year Archival Inks."
      description="Experience unrivaled clarity with our commercial-grade 12-color archival giclée printing on 380 GSM textured cotton canvas, metallic luster papers, and crystal acrylic."
    />
  );
}
