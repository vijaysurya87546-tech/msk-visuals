'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
  Layers,
  Printer,
} from 'lucide-react';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export interface FlexCustomItem {
  size: string; // e.g. "8x3"
  sqft?: number;
  price: number;
}

interface QuickCustomFlexModalProps {
  item: FlexCustomItem;
  onClose: () => void;
}

const MATERIAL_OPTIONS = [
  { id: 'standard', name: 'Standard Flex', desc: 'Heavy weatherproof banner material' },
  { id: 'starflex', name: 'Starflex (Gloss/Matte)', desc: 'High-tensile premium heavy gauge' },
  { id: 'vinyl', name: 'Vinyl Flex (Ultra HD)', desc: 'Ultra-crisp showroom grade' },
];

const FINISHING_OPTIONS = [
  { id: 'eyelets', name: 'Corner Eyelets / Rings', desc: 'Rings on all 4 corners for easy tying' },
  { id: 'clean_cut', name: 'Clean Edge Cut', desc: 'Flush edge cutting' },
  { id: 'pocket', name: 'Pole Pockets', desc: 'Top/bottom loops for rod insertion' },
];

export default function QuickCustomFlexModal({ item, onClose }: QuickCustomFlexModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Madurai');
  const [selectedMaterial, setSelectedMaterial] = useState('standard');
  const [selectedFinishing, setSelectedFinishing] = useState('eyelets');

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUserId(user.id);
          setUserEmail(user.email || null);
          if (user.user_metadata?.full_name) setName(user.user_metadata.full_name);
          if (user.user_metadata?.phone) setPhone(user.user_metadata.phone);
        }
      });
    } catch {
      // Ignored
    }
  }, []);

  // Artwork / Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sqft = item.sqft || (function () {
    const parts = item.size.toLowerCase().split('x');
    const w = parseFloat(parts[0]) || 0;
    const h = parseFloat(parts[1]) || 0;
    return w * h;
  })();

  const handleFileSelect = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds 15MB limit.');
      return;
    }
    setErrorMsg(null);
    setPhotoFile(file);
    if (file.type.startsWith('image/')) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
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

      const matObj = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial);
      const finishObj = FINISHING_OPTIONS.find((f) => f.id === selectedFinishing);
      const fullDetails = [
        `Flex Size: ${item.size} Feet (${sqft} Sq.Ft)`,
        matObj ? `Material: ${matObj.name}` : '',
        finishObj ? `Finishing: ${finishObj.name}` : '',
        customText ? `Banner Content / Notes: ${customText}` : '',
        `Rate: ${formatPrice(item.price)}`,
        `City: ${deliveryCity}`,
      ]
        .filter(Boolean)
        .join(' | ');

      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || null,
          name: name.trim(),
          phone: phone.trim(),
          email: userEmail || null,
          product_type: 'Flex',
          frame_size: `${item.size} ft (${sqft} sq.ft)`,
          quantity: 1,
          customization_details: fullDetails,
          delivery_address: deliveryCity.trim() || 'To be shared on WhatsApp',
          files: uploadedFiles,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit custom flex order.');
      }

      setSubmittedOrderId(result.custom_order_id);
    } catch (err: any) {
      console.error('Custom flex order submission error:', err);
      setErrorMsg(err.message || 'Failed to submit. Please order directly via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const matObj = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial);
    const finishObj = FINISHING_OPTIONS.find((f) => f.id === selectedFinishing);

    let msg = `Hello MSK VISUALS,\n\nI want to place a *CUSTOM FLEX BANNER ORDER*:\n`;
    msg += `📐 *Size:* ${item.size} Feet (${sqft} Sq.Ft)\n`;
    msg += `💰 *Base Price:* ${formatPrice(item.price)}/-\n`;
    if (matObj) msg += `🖨️ *Material:* ${matObj.name}\n`;
    if (finishObj) msg += `⚙️ *Finishing:* ${finishObj.name}\n`;
    if (name.trim()) msg += `👤 *Customer Name:* ${name.trim()}\n`;
    if (phone.trim()) msg += `📞 *Phone:* ${phone.trim()}\n`;
    if (customText.trim()) msg += `✍️ *Banner Content / Notes:* ${customText.trim()}\n`;
    if (deliveryCity.trim()) msg += `📍 *Location:* ${deliveryCity.trim()}\n`;

    if (photoFile) {
      msg += `\n📸 *Artwork/Photo:* Uploaded (${photoFile.name}). I am attaching it here.`;
    } else {
      msg += `\nI will send my photos, logo, and event details here for the design preview.`;
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
                Custom Flex Order
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Size: <strong className="text-white">{item.size} Feet</strong> ({sqft} Sq.Ft)
              </span>
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-white mt-1">
              Upload Artwork &amp; Customize Flex
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold text-gold">
              {formatPrice(item.price)}/-
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
              Custom Flex Order Placed!
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm max-w-md mx-auto">
              Your Custom Order ID is:
            </p>
            <div className="inline-block bg-black-elevated border border-gold/40 px-5 py-2 rounded font-mono text-xl font-bold text-gold">
              {submittedOrderId}
            </div>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              Connect on WhatsApp now with your Order ID for digital mockup proofing before print.
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

            {/* Photo / Artwork Upload Area */}
            <div>
              <label className="label-premium flex items-center justify-between">
                <span>Upload Photos / Logo / Design *</span>
                <span className="text-[10px] text-gray-400">JPG, PNG, PDF, AI, PSD (Max 15MB)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.ai,.psd"
                className="hidden"
                onChange={onFileInputChange}
              />

              {photoFile ? (
                /* Selected File Preview */
                <div className="relative rounded-lg p-3 bg-black-elevated border border-gold/30 flex items-center gap-4">
                  {photoPreview ? (
                    <div className="relative w-20 h-20 rounded overflow-hidden border border-white/15 bg-black shrink-0">
                      <img
                        src={photoPreview}
                        alt="Uploaded artwork"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded bg-gold/15 text-gold flex items-center justify-center shrink-0">
                      <Printer size={24} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-gold font-medium">
                      <Check size={14} /> File Attached
                    </div>
                    <p className="text-white text-xs font-medium truncate mt-0.5">
                      {photoFile.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {(photoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 text-xs text-gold underline hover:text-white"
                    >
                      Change File
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded"
                    title="Remove file"
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
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-gold bg-gold/10'
                      : 'border-white/15 hover:border-gold/50 bg-[#141414] hover:bg-[#181818]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-1.5">
                    <Upload size={17} />
                  </div>
                  <p className="text-white text-xs sm:text-sm font-semibold">
                    Click to select artwork / photos or drag &amp; drop
                  </p>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Images, family photos, shop logos, or existing design files
                  </p>
                </div>
              )}
            </div>

            {/* Material & Finishing Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-premium">Flex Material</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="input-premium !py-2 text-xs bg-[#161616]"
                >
                  {MATERIAL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-premium">Border Finishing</label>
                <select
                  value={selectedFinishing}
                  onChange={(e) => setSelectedFinishing(e.target.value)}
                  className="input-premium !py-2 text-xs bg-[#161616]"
                >
                  {FINISHING_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label-premium">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh"
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

              <div>
                <label className="label-premium">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Madurai"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="input-premium !py-2 text-xs"
                />
              </div>
            </div>

            {/* Banner Content / Notes */}
            <div>
              <label className="label-premium">
                Text on Banner / Event Details (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 'Opening Ceremony - Shop Name', date, contact info to print, or color themes..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="input-premium !py-2 text-xs resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href={`/custom-orders?size=${encodeURIComponent(item.size + ' feet')}&type=Flex`}
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
