'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import type { PriceListItem } from '@/lib/types';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import Link from 'next/link';

interface QuickCustomOrderModalProps {
  item: PriceListItem;
  onClose: () => void;
}

const FRAME_FINISHES = [
  { id: 'matte_black', name: 'Matte Black', borderClass: 'border-[#1a1a1a] bg-[#1a1a1a]' },
  { id: 'royal_gold', name: 'Metallic Gold', borderClass: 'border-[#d4af37] bg-[#d4af37]' },
  { id: 'natural_wood', name: 'Synthetic Wood', borderClass: 'border-[#8b5a2b] bg-[#8b5a2b]' },
  { id: 'classic_white', name: 'Studio White', borderClass: 'border-[#f5f5f5] bg-[#f5f5f5]' },
];

export default function QuickCustomOrderModal({ item, onClose }: QuickCustomOrderModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customText, setCustomText] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('matte_black');

  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Photo file size exceeds 15MB limit.');
      return;
    }
    setErrorMsg(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
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

  const handleSubmitOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Please enter your Name and WhatsApp Phone Number.');
      return;
    }

    setSubmitting(true);

    try {
      const uploadedFiles: Array<{ file_url: string; file_name: string; file_type: string }> = [];

      if (photoFile) {
        const url = await uploadFileToServer(photoFile);
        if (url) {
          uploadedFiles.push({
            file_url: url,
            file_name: photoFile.name,
            file_type: 'main_photo',
          });
        }
      }

      const finishObj = FRAME_FINISHES.find((f) => f.id === selectedFinish);
      const fullDetails = [
        customText ? `Custom text/instructions: ${customText}` : '',
        finishObj ? `Frame Finish: ${finishObj.name}` : '',
        `Price: ${formatPrice(item.price)}`,
      ]
        .filter(Boolean)
        .join(' | ');

      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: null,
          product_type: 'Photo Frames',
          frame_size: `${item.size_label} inches`,
          quantity: 1,
          customization_details: fullDetails,
          delivery_address: deliveryAddress.trim() || 'To be shared on WhatsApp',
          files: uploadedFiles,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit custom order.');
      }

      setSubmittedOrderId(result.custom_order_id);
    } catch (err: any) {
      console.error('Custom order submission error:', err);
      setErrorMsg(err.message || 'Failed to submit. Please try ordering via WhatsApp directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const finishObj = FRAME_FINISHES.find((f) => f.id === selectedFinish);
    let msg = `Hello MSK VISUALS,\n\nI want to place a *CUSTOM PHOTO FRAME ORDER*:\n`;
    msg += `📐 *Frame Size:* ${item.size_label} inches\n`;
    msg += `💰 *Price:* ${formatPrice(item.price)}\n`;
    if (finishObj) msg += `🎨 *Finish Preference:* ${finishObj.name}\n`;
    if (name.trim()) msg += `👤 *Customer Name:* ${name.trim()}\n`;
    if (phone.trim()) msg += `📞 *Phone:* ${phone.trim()}\n`;
    if (customText.trim()) msg += `✍️ *Custom Text / Notes:* ${customText.trim()}\n`;
    if (photoFile) {
      msg += `📸 *Photo Uploaded:* Yes (${photoFile.name})\n`;
      msg += `\nI am attaching my photo here for framing. Please confirm design mockup!`;
    } else {
      msg += `\nI will send the photo now for preview and framing.`;
    }

    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card-premium p-5 sm:p-7 max-w-2xl w-full border border-gold/40 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                Custom Frame Order
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Size: <strong className="text-white">{item.size_label} inches</strong>
              </span>
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-white mt-1">
              Upload Photo & Customize Frame
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold text-gold">
              {formatPrice(item.price)}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {submittedOrderId ? (
          /* Submission Success State */
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mx-auto text-gold">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              Custom Order Placed Successfully!
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm max-w-md mx-auto">
              Your Custom Order ID is:
            </p>
            <div className="inline-block bg-black-elevated border border-gold/40 px-5 py-2 rounded font-mono text-xl font-bold text-gold">
              {submittedOrderId}
            </div>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              Send this ID on WhatsApp with your high-res photo for instant preview & express crafting.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
              <button
                onClick={handleWhatsAppOrder}
                className="btn-whatsapp !py-2.5 px-6 text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} /> Confirm on WhatsApp Now
              </button>
              <button onClick={onClose} className="btn-dark !py-2.5 px-6 text-xs">
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmitOnline} className="mt-4 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Photo Upload Area */}
            <div>
              <label className="label-premium flex items-center justify-between">
                <span>Upload Your Photo to Frame *</span>
                <span className="text-[10px] text-gray-400">JPG, PNG, WEBP (Max 15MB)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileInputChange}
              />

              {photoPreview ? (
                /* Photo Preview with Simulated Frame */
                <div className="relative rounded-lg p-3 bg-black-elevated border border-gold/30 flex items-center gap-4">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden border-4 border-[#1c1c1c] shadow-lg shrink-0 bg-black flex items-center justify-center">
                    <img
                      src={photoPreview}
                      alt="Uploaded frame photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-gold font-medium">
                      <Check size={14} /> Photo Selected for Framing
                    </div>
                    <p className="text-white text-xs font-medium truncate mt-1">
                      {photoFile?.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {photoFile ? `${(photoFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-xs text-gold underline hover:text-white"
                    >
                      Change Photo
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded"
                    title="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-5 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-gold bg-gold/10'
                      : 'border-white/15 hover:border-gold/50 bg-[#141414] hover:bg-[#181818]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-2">
                    <Upload size={18} />
                  </div>
                  <p className="text-white text-xs sm:text-sm font-semibold">
                    Click to select photo or drag and drop
                  </p>
                  <p className="text-gray-400 text-[11px] mt-1">
                    Family photo, portrait, wedding picture, or artwork
                  </p>
                </div>
              )}
            </div>

            {/* Frame Finish Preference */}
            <div>
              <label className="label-premium">Choose Frame Finish</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FRAME_FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFinish(f.id)}
                    className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      selectedFinish === f.id
                        ? 'border-gold bg-gold/15 text-white shadow-sm'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${f.borderClass}`} />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-premium">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arun Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-premium !py-2 text-xs"
                />
              </div>
              <div>
                <label className="label-premium">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-premium !py-2 text-xs"
                />
              </div>
            </div>

            {/* Custom Notes / Text on Frame */}
            <div>
              <label className="label-premium">
                Text on Frame / Custom Request (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 'Together Forever - 2026', or specific collage arrangement"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="input-premium !py-2 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href={`/custom-orders?size=${encodeURIComponent(item.size_label)}&type=Photo%20Frames`}
                onClick={onClose}
                className="text-xs text-gold hover:underline flex items-center gap-1 order-last sm:order-first"
              >
                Detailed Customizer Form <ArrowRight size={12} />
              </Link>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="btn-whatsapp !py-2 px-4 text-xs flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-md"
                  title="Send details directly on WhatsApp"
                >
                  <MessageCircle size={14} />
                  <span>Order on WhatsApp</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold !py-2 px-4 text-xs flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Submit Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
