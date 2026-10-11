'use client';

import { useState, useEffect, useId } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Zap,
  MessageCircle,
  Upload,
  CheckCircle2,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, generateWhatsAppUrl, cn } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import { useCartStore } from '@/store/cart';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import type { Product, ProductSize } from '@/lib/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Customization fields
  const [customName, setCustomName] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [frameType, setFrameType] = useState<string>('Matte Black Wood');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Toast / feedback state
  const [addedToast, setAddedToast] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), sizes:product_sizes(*), category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].image_url);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } else {
        // Fallback to mock product
        const fallback = INITIAL_PRODUCTS.find((p) => p.slug === slug) || INITIAL_PRODUCTS[0];
        setProduct(fallback);
        if (fallback.images && fallback.images.length > 0) {
          setSelectedImage(fallback.images[0].image_url);
        }
        if (fallback.sizes && fallback.sizes.length > 0) {
          setSelectedSize(fallback.sizes[0]);
        }
      }
      setLoading(false);
    }

    if (slug) fetchProduct();
  }, [slug]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        alert('Please upload a valid JPG, PNG, or WebP image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size exceeds 10MB limit.');
        return;
      }
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImagePreview(null);
    setUploadedFileName(null);
  };

  const currentPrice = selectedSize ? selectedSize.price : (product?.price || 0);
  const currentMrp = selectedSize ? selectedSize.mrp : (product?.mrp || 0);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: selectedImage || (product.images?.[0]?.image_url || ''),
      size: selectedSize ? selectedSize.size_label : 'Standard',
      price: currentPrice,
      mrp: currentMrp,
      quantity,
      is_customizable: product.is_customizable,
      customization_name: customName || undefined,
      customization_phone: customPhone || undefined,
      customization_instructions: customInstructions || undefined,
      uploaded_image: uploadedImagePreview || undefined,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    const sizeText = selectedSize ? selectedSize.size_label : 'Standard';
    let msg = `Hello MSK VISUALS,\n\nI would like to order this item:\n\n`;
    msg += `Product: ${product.name}\n`;
    msg += `Size: ${sizeText}\n`;
    msg += `Frame Type: ${frameType}\n`;
    msg += `Quantity: ${quantity}\n`;
    msg += `Price: ${formatPrice(currentPrice * quantity)}\n\n`;

    if (customName) msg += `Name on Frame: ${customName}\n`;
    if (customPhone) msg += `Contact: ${customPhone}\n`;
    if (customInstructions) msg += `Instructions: ${customInstructions}\n`;
    if (uploadedFileName) msg += `Note: I will attach my photo to this WhatsApp chat.\n`;

    msg += `\nPlease let me know how to proceed. Thank you!`;

    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-gold w-12 h-12" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="font-heading text-2xl text-white mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6">The requested product could not be located.</p>
        <Link href="/shop" className="btn-gold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', image_url: selectedImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', alt_text: product.name }];

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-gold">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-gold">Shop</Link>
        <ChevronRight size={12} />
        <span className="text-gray-300 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-black-card rounded-lg overflow-hidden border border-gold/15 relative">
            <img
              src={selectedImage || allImages[0]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount_percent > 0 && (
              <span className="badge-discount absolute top-4 left-4 shadow-lg">
                {product.discount_percent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={cn(
                    "w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all",
                    selectedImage === img.image_url
                      ? "border-gold shadow-md shadow-gold/20"
                      : "border-white/10 opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5 text-center">
            <div className="p-3 bg-black-card rounded-lg border border-white/5">
              <Truck size={20} className="text-gold mx-auto mb-1.5" />
              <div className="text-[11px] font-semibold text-white">Safe Packing</div>
              <div className="text-[10px] text-gray-500">Pan Tamil Nadu</div>
            </div>
            <div className="p-3 bg-black-card rounded-lg border border-white/5">
              <Sparkles size={20} className="text-gold mx-auto mb-1.5" />
              <div className="text-[11px] font-semibold text-white">Luxury Finish</div>
              <div className="text-[10px] text-gray-500">Gold & Matte Black</div>
            </div>
            <div className="p-3 bg-black-card rounded-lg border border-white/5">
              <Shield size={20} className="text-gold mx-auto mb-1.5" />
              <div className="text-[11px] font-semibold text-white">Direct WhatsApp</div>
              <div className="text-[10px] text-gray-500">+91 93612 53338</div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Customization */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold font-semibold">
              {product.material || 'Premium Handcrafted'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1 leading-tight">
              {product.name}
            </h1>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-black-card rounded-lg border border-gold/20 flex items-baseline gap-4">
            <span className="text-gold font-bold text-3xl font-heading">
              {formatPrice(currentPrice)}
            </span>
            {currentMrp > currentPrice && (
              <span className="text-gray-500 text-base line-through">
                {formatPrice(currentMrp)}
              </span>
            )}
            {product.discount_percent > 0 && (
              <span className="text-green-400 text-xs font-semibold">
                Save {formatPrice(currentMrp - currentPrice)} ({product.discount_percent}% off)
              </span>
            )}
            <span className="ml-auto text-xs text-green-400 font-medium">In Stock</span>
          </div>

          {/* Sizes Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="label-premium">Select Frame Size (Inches)</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      "p-2.5 rounded border text-center transition-all",
                      selectedSize?.id === s.id
                        ? "border-gold bg-gold/15 text-gold font-bold shadow-md shadow-gold/10"
                        : "border-white/10 text-gray-300 hover:border-gold/50 bg-[#161616]"
                    )}
                  >
                    <div className="text-xs font-semibold">{s.size_label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{formatPrice(s.price)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frame Finish Type */}
          <div>
            <label className="label-premium">Frame Border Style</label>
            <div className="grid grid-cols-2 gap-2.5">
              {['Matte Black + Gold Trim', 'Classic Deep Matte Black', 'Royal Metallic Gold', 'Minimalist Acrylic Frameless'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFrameType(style)}
                  className={cn(
                    "p-2.5 rounded border text-xs text-left transition-all",
                    frameType === style
                      ? "border-gold bg-gold/15 text-gold font-medium"
                      : "border-white/10 text-gray-400 hover:border-white/20 bg-[#161616]"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Customization Form */}
          {product.is_customizable && (
            <div className="p-5 bg-black-card rounded-lg border border-gold/15 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Sparkles size={16} className="text-gold" />
                <h3 className="font-heading text-sm font-semibold text-white">
                  Personalize Your Creation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-premium">Name(s) to Display</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya & Karthik"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="input-premium text-xs"
                  />
                </div>
                <div>
                  <label className="label-premium">Customer Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 93612 53338"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="input-premium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label-premium">Special Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Add date '24.10.2024', warm lighting enhancement, portrait crop"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="input-premium text-xs"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="label-premium">Upload Photo for Printing / Frame</label>
                <div className="mt-1">
                  {!uploadedImagePreview ? (
                    <label className="border-2 border-dashed border-white/15 hover:border-gold/50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black-elevated">
                      <Upload size={22} className="text-gold mb-1.5" />
                      <span className="text-xs text-gray-300 font-medium">Click to upload photo</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">JPG, JPEG, PNG, WebP up to 10MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative border border-gold/30 rounded-lg p-2 flex items-center gap-3 bg-black-elevated">
                      <img
                        src={uploadedImagePreview}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white truncate font-medium">{uploadedFileName}</div>
                        <div className="text-[10px] text-green-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={12} /> Ready for checkout preview
                        </div>
                      </div>
                      <button
                        onClick={removeUploadedImage}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <label className="label-premium mb-0">Quantity</label>
            <div className="flex items-center border border-white/15 rounded bg-black-elevated">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-gray-300 hover:text-gold text-sm font-bold"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-xs text-white font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1.5 text-gray-300 hover:text-gold text-sm font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-gray-400">
              Subtotal: <strong className="text-gold">{formatPrice(currentPrice * quantity)}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="btn-dark !py-3 w-full flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-gold !py-3 w-full flex items-center justify-center gap-2 text-sm"
              >
                <Zap size={16} />
                Buy Now
              </button>
            </div>

            <button
              onClick={handleWhatsAppOrder}
              className="btn-whatsapp !py-3 w-full flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle size={18} />
              Order via WhatsApp (+91 93612 53338)
            </button>
          </div>

          {/* Toast feedback */}
          {addedToast && (
            <div className="toast-gold flex items-center justify-between text-xs animate-slide-down">
              <span className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={16} /> Added &quot;{product.name}&quot; to your cart!
              </span>
              <Link href="/cart" className="text-gold font-bold hover:underline">
                View Cart →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
