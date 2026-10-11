import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSK VISUALS | Photo Frames, Printing, Resin Art & Creative Designs",
  description:
    "MSK VISUALS offers premium photo frames, high-quality printing, resin art, DIY candles and logo design services in Madurai with delivery across Tamil Nadu.",
  keywords: [
    "MSK VISUALS",
    "photo frames",
    "custom frames",
    "printing",
    "resin art",
    "DIY candles",
    "logo design",
    "Madurai",
    "Tamil Nadu",
    "custom gifts",
    "personalized frames",
  ],
  authors: [{ name: "MSK VISUALS" }],
  openGraph: {
    title: "MSK VISUALS | Photo Frames, Printing, Resin Art & Creative Designs",
    description:
      "MSK VISUALS offers premium photo frames, high-quality printing, resin art, DIY candles and logo design services in Madurai with delivery across Tamil Nadu.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://mskvisuals.com",
    siteName: "MSK VISUALS",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MSK VISUALS | Photo Frames, Printing, Resin Art & Creative Designs",
    description:
      "MSK VISUALS offers premium photo frames, high-quality printing, resin art, DIY candles and logo design services in Madurai with delivery across Tamil Nadu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://mskvisuals.com"} />
        <link rel="icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className="bg-black-deep text-gray-200 antialiased min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "MSK VISUALS",
              "image": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
              "telephone": "+91 93612 53338",
              "email": "meganathan2174@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Madurai",
                "addressRegion": "Tamil Nadu",
                "addressCountry": "IN"
              },
              "priceRange": "₹100 - ₹4500",
              "url": "https://mskvisuals.com",
              "openingHours": "Mo-Sa 09:30-20:30",
              "sameAs": ["https://instagram.com/msk.vsls"]
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
