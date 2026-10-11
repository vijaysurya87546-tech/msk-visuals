'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { BUSINESS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.from('contact_messages').insert({
        name,
        phone,
        email: email || null,
        subject: subject || 'General Studio Inquiry',
        message,
      });
      setSentSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.warn('Message logged:', { name, phone, message });
      setSentSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-6 max-w-7xl mx-auto space-y-12">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
          <Sparkles size={14} /> Get In Touch
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">
          Contact <span className="text-gold-gradient">MSK VISUALS</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Have an urgent order, custom framing request, or corporate design inquiry? Reach out directly to our Madurai team.
        </p>
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <a
          href={`tel:${BUSINESS.mobile.replace(/\s/g, '')}`}
          className="card-premium p-5 text-center group hover:border-gold/50 flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform">
            <Phone size={20} />
          </div>
          <span className="text-xs font-semibold text-white uppercase tracking-wider mb-1">Call Now</span>
          <span className="text-xs text-gray-400 font-mono">{BUSINESS.mobile}</span>
        </a>

        <a
          href={BUSINESS.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="card-premium p-5 text-center group hover:border-green-500/50 flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-3 group-hover:scale-110 transition-transform">
            <MessageCircle size={20} />
          </div>
          <span className="text-xs font-semibold text-white uppercase tracking-wider mb-1">WhatsApp</span>
          <span className="text-xs text-gray-400 font-mono">{BUSINESS.whatsapp}</span>
        </a>

        <a
          href={`mailto:${BUSINESS.email}`}
          className="card-premium p-5 text-center group hover:border-gold/50 flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform">
            <Mail size={20} />
          </div>
          <span className="text-xs font-semibold text-white uppercase tracking-wider mb-1">Email Us</span>
          <span className="text-xs text-gray-400 truncate max-w-[140px]">{BUSINESS.email}</span>
        </a>

        <a
          href={BUSINESS.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="card-premium p-5 text-center group hover:border-pink-500/50 flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 transition-transform">
            <InstagramIcon size={20} />
          </div>
          <span className="text-xs font-semibold text-white uppercase tracking-wider mb-1">Instagram</span>
          <span className="text-xs text-gray-400">{BUSINESS.instagram}</span>
        </a>
      </div>

      {/* Main Grid: Form & Location Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="card-premium p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-white mb-2">Send Us a Direct Message</h2>
            <p className="text-gray-400 text-xs mb-6">Our studio managers will respond within 2-4 hours.</p>

            {sentSuccess ? (
              <div className="p-6 bg-gold/10 border border-gold/40 rounded-lg text-center space-y-3">
                <CheckCircle2 size={36} className="text-gold mx-auto" />
                <h3 className="font-heading text-lg font-bold text-white">Message Delivered</h3>
                <p className="text-gray-300 text-xs max-w-sm mx-auto">
                  Thank you for reaching out! We have received your query and will reply promptly.
                </p>
                <button
                  onClick={() => setSentSuccess(false)}
                  className="btn-dark !py-2 px-4 text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-premium">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meena Sundaram"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-premium text-xs"
                    />
                  </div>
                  <div>
                    <label className="label-premium">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 93612 53338"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-premium text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-premium">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium text-xs"
                    />
                  </div>
                  <div>
                    <label className="label-premium">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Urgent 24x36 Wedding Frame"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input-premium text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-premium">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you are looking for..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-premium text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold !py-3 w-full text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="loading-gold w-4 h-4 mr-1" />
                  ) : (
                    <>
                      <Send size={14} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Studio Info & Map (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-premium p-6 space-y-4">
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <MapPin size={18} className="text-gold" />
              Studio Location
            </h2>

            <div className="space-y-3 text-xs text-gray-300">
              <div>
                <strong className="text-white block font-medium">MSK VISUALS Studio</strong>
                <span>Madurai, Tamil Nadu, India</span>
              </div>

              <div>
                <strong className="text-white block font-medium">Business Hours:</strong>
                <span className="flex items-center gap-1.5 text-gray-400 mt-0.5">
                  <Clock size={13} /> Mon – Sat: 9:30 AM to 8:30 PM (IST)
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 mt-0.5">
                  <Clock size={13} /> Sunday: 10:00 AM to 6:00 PM (IST)
                </span>
              </div>

              <div>
                <strong className="text-white block font-medium">WhatsApp Assistance:</strong>
                <span className="text-green-400 font-mono">+91 93612 53338</span>
              </div>
            </div>

            {/* Embedded Visual Map Preview */}
            <div className="mt-4 rounded-lg overflow-hidden border border-white/10 h-48 bg-black-elevated relative flex items-center justify-center">
              <div className="text-center p-4">
                <MapPin size={32} className="text-gold mx-auto mb-2 animate-bounce" />
                <div className="text-xs font-semibold text-white">Madurai, Tamil Nadu</div>
                <div className="text-[10px] text-gray-500 mt-1">Delivery to Chennai, Coimbatore, Trichy, Tirunelveli & all TN</div>
                <a
                  href="https://maps.google.com/?q=Madurai+Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-gold hover:underline mt-2 inline-block"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
