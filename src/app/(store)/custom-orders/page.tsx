'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  MessageCircle,
  FileText,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { generateCustomOrderId, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';

function CustomOrderContent() {
  const searchParams = useSearchParams();
  const prefilledSize = searchParams.get('size') || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productType, setProductType] = useState('Photo Frames');
  const [frameSize, setFrameSize] = useState(prefilledSize || '12 x 18');
  const [quantity, setQuantity] = useState(1);
  const [customizationDetails, setCustomizationDetails] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Uploaded files
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [refDesignPreview, setRefDesignPreview] = useState<string | null>(null);
  const [refDesignName, setRefDesignName] = useState<string | null>(null);
  const [refDesignFile, setRefDesignFile] = useState<File | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'reference'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit.');
        return;
      }
      if (type === 'photo') {
        setPhotoFile(file);
        setPhotoName(file.name);
        setPhotoPreview(URL.createObjectURL(file));
      } else {
        setRefDesignFile(file);
        setRefDesignName(file.name);
        setRefDesignPreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadFileToServer = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'custom-order-files');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.url || null;
    } catch (err) {
      console.warn('File upload failed:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !phone.trim() || !deliveryAddress.trim()) {
      setErrorMsg('Please fill in your Name, Phone Number, and Delivery Address.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload files to server if selected
      const uploadedFiles: Array<{ file_url: string; file_name: string; file_type: string }> = [];

      if (photoFile) {
        const url = await uploadFileToServer(photoFile);
        if (url) {
          uploadedFiles.push({
            file_url: url,
            file_name: photoName || photoFile.name,
            file_type: 'main_photo',
          });
        }
      }

      if (refDesignFile) {
        const url = await uploadFileToServer(refDesignFile);
        if (url) {
          uploadedFiles.push({
            file_url: url,
            file_name: refDesignName || refDesignFile.name,
            file_type: 'reference_design',
          });
        }
      }

      // 2. Submit to server-side authenticated custom orders API
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          product_type: productType,
          frame_size: frameSize,
          quantity,
          customization_details: customizationDetails || null,
          delivery_address: deliveryAddress.trim(),
          files: uploadedFiles,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit custom order.');
      }

      setSubmittedOrderId(result.custom_order_id);
    } catch (err: any) {
      console.error('Submit custom order error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (!submittedOrderId) return;
    let msg = `Hello MSK VISUALS,\n\nI have submitted a Custom Order request!\n\n`;
    msg += `Custom Order ID: ${submittedOrderId}\n`;
    msg += `Product Type: ${productType}\n`;
    msg += `Frame Size: ${frameSize}\n`;
    msg += `Quantity: ${quantity}\n`;
    msg += `Name: ${name}\n`;
    msg += `Phone: ${phone}\n`;
    if (customizationDetails) msg += `Details: ${customizationDetails}\n`;
    msg += `Delivery Address: ${deliveryAddress}\n\n`;
    msg += `I am attaching my images here. Please review and confirm quote.`;

    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center justify-center gap-1.5">
          <Sparkles size={14} /> Bespoke Creative Design Studio
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-2">
          YOUR MEMORY, <span className="text-gold-gradient">YOUR DESIGN</span>
        </h1>
        <div className="gold-divider-short mt-4 mb-4" />
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Share your vision, upload your photos or reference designs, and our Madurai studio artisans will craft a one-of-a-kind masterpiece for you.
        </p>
      </div>

      {submittedOrderId ? (
        /* Success Confirmation Card */
        <div className="card-premium p-8 text-center animate-fade-in border border-gold/40 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mx-auto mb-4 text-gold">
            <CheckCircle2 size={36} />
          </div>
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Custom Order Submitted Successfully
          </span>
          <h2 className="font-heading text-3xl font-bold text-white mt-1 mb-2">
            Your Custom Order ID
          </h2>
          <div className="inline-block bg-black-elevated border border-gold/40 px-6 py-2 rounded-md font-mono text-xl font-bold text-gold my-3 tracking-wider">
            {submittedOrderId}
          </div>
          <p className="text-gray-300 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Thank you, <strong className="text-white">{name}</strong>! Our design specialists are reviewing your request. For the fastest preview and priority dispatch, connect with us on WhatsApp now with your Order ID.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleWhatsAppRedirect}
              className="btn-whatsapp !py-3.5 px-8 text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Continue to WhatsApp Chat (+91 93612 53338)
            </button>
            <button
              onClick={() => {
                setSubmittedOrderId(null);
                setName('');
                setPhone('');
                setEmail('');
                setCustomizationDetails('');
                setDeliveryAddress('');
                setPhotoPreview(null);
                setRefDesignPreview(null);
              }}
              className="btn-dark !py-3.5 px-6 text-sm"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        /* Custom Order Form */
        <form onSubmit={handleSubmit} className="card-premium p-6 sm:p-10 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-lg flex items-center gap-3 text-red-300 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div>
            <h2 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-bold">1</span>
              Customer Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-premium">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anandha Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="label-premium">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 93612 53338"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-premium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-premium">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Specifications */}
          <div>
            <h2 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-bold">2</span>
              Product & Design Requirements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-premium">Product Category *</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="input-premium bg-[#161616]"
                >
                  <option value="Photo Frames">Photo Frames</option>
                  <option value="Resin Art">Resin Art</option>
                  <option value="DIY Candles">DIY Candles</option>
                  <option value="Flex">Flex</option>
                  <option value="Logo Design">Logo Design</option>
                  <option value="Customized Creative Products">Customized Creative Products</option>
                </select>
              </div>

              <div>
                <label className="label-premium">Estimated Frame Size</label>
                <input
                  type="text"
                  placeholder="e.g. 12 x 18 inches"
                  value={frameSize}
                  onChange={(e) => setFrameSize(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="label-premium">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="input-premium"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="label-premium">Customization Details & Vision</label>
                <textarea
                  rows={4}
                  placeholder="Describe your design concept: quotes to include, couple names, wedding dates, color preferences (black, gold, royal blue), background lighting, or special layout instructions..."
                  value={customizationDetails}
                  onChange={(e) => setCustomizationDetails(e.target.value)}
                  className="input-premium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: File Uploads */}
          <div>
            <h2 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-bold">3</span>
              Upload Photos & Reference Designs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Upload */}
              <div>
                <label className="label-premium">Primary Photo (To Frame / Print)</label>
                {!photoPreview ? (
                  <label className="border-2 border-dashed border-white/15 hover:border-gold/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black-elevated text-center">
                    <Upload size={24} className="text-gold mb-2" />
                    <span className="text-xs text-white font-medium">Upload Main Photo</span>
                    <span className="text-[10px] text-gray-500 mt-1">JPG, PNG, WebP up to 15MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative border border-gold/30 rounded-lg p-3 flex items-center gap-3 bg-black-elevated">
                    <img src={photoPreview} alt="Primary" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate font-medium">{photoName}</div>
                      <div className="text-[10px] text-green-400 mt-0.5">Attached ✓</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoName(null);
                      }}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Reference Design Upload */}
              <div>
                <label className="label-premium">Reference Design / Sample Inspiration</label>
                {!refDesignPreview ? (
                  <label className="border-2 border-dashed border-white/15 hover:border-gold/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black-elevated text-center">
                    <FileText size={24} className="text-gold/70 mb-2" />
                    <span className="text-xs text-white font-medium">Upload Reference / Sketch</span>
                    <span className="text-[10px] text-gray-500 mt-1">Image or mockup sample</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'reference')}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative border border-gold/30 rounded-lg p-3 flex items-center gap-3 bg-black-elevated">
                    <img src={refDesignPreview} alt="Reference" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate font-medium">{refDesignName}</div>
                      <div className="text-[10px] text-green-400 mt-0.5">Attached ✓</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRefDesignPreview(null);
                        setRefDesignName(null);
                      }}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Delivery Location */}
          <div>
            <h2 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-bold">4</span>
              Delivery Address in Tamil Nadu *
            </h2>
            <textarea
              rows={3}
              required
              placeholder="Door No, Street Name, Area, City/Town, District, Pincode (e.g. No. 12, West Masi Street, Madurai - 625001)"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="input-premium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold !py-4 w-full text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-gold/10"
            >
              {submitting ? (
                <>
                  <div className="loading-gold w-5 h-5 mr-2" />
                  Generating Order ID & Saving to Supabase...
                </>
              ) : (
                <>
                  Submit Custom Order
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
              Official WhatsApp & Support: +91 93612 53338 | Madurai, Tamil Nadu
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CustomOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-gold w-10 h-10" />
      </div>
    }>
      <CustomOrderContent />
    </Suspense>
  );
}
