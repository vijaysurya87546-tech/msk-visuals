'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Download,
  MessageCircle,
  Truck,
  ArrowRight,
  Package,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import Logo from '@/components/brand/Logo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      // 1. Try reading from sessionStorage snapshot
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(`order_${orderId}`);
        if (cached) {
          try {
            setOrder(JSON.parse(cached));
            setLoading(false);
            return;
          } catch (e) {}
        }
      }

      // 2. Fetch from Supabase
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('order_id', orderId)
          .maybeSingle();

        if (data) {
          setOrder(data);
        } else {
          // Fallback order display
          setOrder({
            order_id: orderId,
            customer_name: 'Valued Customer',
            customer_phone: '+91 93612 53338',
            customer_email: 'meganathan2174@gmail.com',
            address_line1: 'Tamil Nadu, India',
            city: 'Madurai',
            pincode: '625001',
            subtotal: 800,
            delivery_charge: 0,
            total: 800,
            status: 'Pending',
            created_at: new Date().toISOString(),
            items: [
              {
                product_name: 'Custom Luxury Photo Frame',
                size: '12 x 18',
                quantity: 1,
                price: 800,
              },
            ],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) loadOrder();
  }, [orderId]);

  const handleDownloadInvoice = () => {
    if (!order) return;

    const doc = new jsPDF();

    // Background & Header styling
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 40, 'F');

    // Brand Name
    doc.setTextColor(212, 168, 83); // Gold
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MSK VISUALS', 15, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 220, 220);
    doc.text('WE DESIGN. YOU IMPRESS.', 15, 28);
    doc.text('Madurai, Tamil Nadu, India | Mobile & WhatsApp: +91 93612 53338', 15, 34);

    // Invoice Title & Meta
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE / ORDER RECEIPT', 15, 52);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Order ID: ${order.order_id}`, 15, 60);
    doc.text(`Order Date: ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}`, 15, 66);
    doc.text(`Payment Status: Cash on Delivery / Pay on Confirmation`, 15, 72);

    // Customer Info Box
    doc.setDrawColor(212, 168, 83);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, 80, 180, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text('DELIVERY TO:', 20, 88);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`${order.customer_name} | Phone: ${order.customer_phone}`, 20, 95);
    const addr = `${order.address_line1 || ''}, ${order.city || ''} - ${order.pincode || ''}, ${order.state || 'Tamil Nadu'}`;
    doc.text(addr, 20, 102);

    // Items Table
    const tableData = (order.items || []).map((item: any, idx: number) => [
      idx + 1,
      item.product_name,
      item.size || 'Standard',
      item.quantity,
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.quantity}`,
    ]);

    autoTable(doc, {
      startY: 120,
      head: [['#', 'Item Description', 'Size', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      headStyles: {
        fillColor: [10, 10, 10],
        textColor: [212, 168, 83],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      theme: 'striped',
    });

    const finalY = (doc as any).lastAutoTable.finalY || 180;

    // Totals section
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 130, finalY + 12);
    doc.text(`Rs. ${order.subtotal}`, 175, finalY + 12, { align: 'right' });

    doc.text(`Delivery Charge (Pan TN):`, 130, finalY + 18);
    doc.text(`${order.delivery_charge === 0 ? 'FREE' : `Rs. ${order.delivery_charge}`}`, 175, finalY + 18, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(10, 10, 10);
    doc.text(`Grand Total:`, 130, finalY + 28);
    doc.text(`Rs. ${order.total}`, 175, finalY + 28, { align: 'right' });

    // Footer note
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for ordering with MSK VISUALS - Madurai, Tamil Nadu.', 15, 280);
    doc.text('For support or custom inquiries: meganathan2174@gmail.com | +91 93612 53338', 15, 285);

    doc.save(`Invoice_${order.order_id}.pdf`);
  };

  const handleWhatsAppContact = () => {
    if (!order) return;
    const msg = `Hello MSK VISUALS,\n\nI have placed an order!\n\nOrder ID: ${order.order_id}\nName: ${order.customer_name}\nTotal: ${formatPrice(order.total)}\n\nPlease confirm my order and dispatch timeline. Thank you!`;
    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-gold w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 md:px-6 max-w-4xl mx-auto">
      {/* Success Badge & Official Logo */}
      <div className="text-center mb-10">
        <div className="mb-4 flex justify-center">
          <Logo size="lg" />
        </div>
        <span className="text-xs uppercase tracking-widest text-gold font-bold">
          Order Placed Successfully
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
          Thank you for ordering from MSK VISUALS.
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Your Order ID is <strong className="text-gold font-mono text-base">{orderId}</strong>.
        </p>
      </div>

      {/* Confirmation Card */}
      <div className="card-premium p-6 sm:p-8 space-y-6 border border-gold/30">
        {/* Order Meta Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-5 border-b border-white/10 gap-3">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Order Reference</div>
            <div className="font-mono text-lg font-bold text-gold">{orderId}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Current Status:</span>
            <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-3 py-1 rounded-full font-semibold">
              {order.status || 'Pending Verification'}
            </span>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-300">
          <div className="space-y-1.5 p-4 bg-black-elevated rounded-lg border border-white/5">
            <div className="text-gold font-semibold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Phone size={13} /> Customer Details
            </div>
            <div><strong className="text-white">Name:</strong> {order.customer_name}</div>
            <div><strong className="text-white">Phone:</strong> {order.customer_phone}</div>
            {order.customer_email && <div><strong className="text-white">Email:</strong> {order.customer_email}</div>}
          </div>

          <div className="space-y-1.5 p-4 bg-black-elevated rounded-lg border border-white/5">
            <div className="text-gold font-semibold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <MapPin size={13} /> Delivery Destination
            </div>
            <div className="text-white">{order.address_line1}</div>
            {order.address_line2 && <div>{order.address_line2}</div>}
            <div>{order.city} - {order.pincode}, {order.state || 'Tamil Nadu'}</div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3 flex items-center gap-1.5">
            <Package size={14} /> Purchased Items
          </h2>
          <div className="border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5 bg-black-elevated">
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} className="p-3.5 flex justify-between items-center text-xs">
                <div>
                  <div className="text-white font-medium">{item.product_name}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    Size: <strong className="text-gray-300">{item.size || 'Standard'}</strong> | Qty: {item.quantity}
                  </div>
                </div>
                <div className="text-gold font-bold font-mono">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Breakdown */}
        <div className="p-4 bg-black-elevated rounded-lg border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span className="text-white">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Delivery Across Tamil Nadu</span>
            <span className="text-green-400 uppercase font-semibold">
              {order.delivery_charge === 0 ? 'FREE' : formatPrice(order.delivery_charge)}
            </span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
            <span>Total Payable</span>
            <span className="text-gold font-heading text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownloadInvoice}
            className="btn-gold !py-3 flex-1 flex items-center justify-center gap-2 text-xs"
          >
            <Download size={16} />
            Download Official Invoice (PDF)
          </button>

          <button
            onClick={handleWhatsAppContact}
            className="btn-whatsapp !py-3 flex-1 flex items-center justify-center gap-2 text-xs"
          >
            <MessageCircle size={16} />
            Connect on WhatsApp (+91 93612 53338)
          </button>
        </div>
      </div>

      {/* Next Steps Guide */}
      <div className="mt-8 text-center text-xs text-gray-500 space-y-2">
        <p>A confirmation email has been logged for our studio team.</p>
        <p>If you uploaded photos for customized frames, our designer will verify the crop with you before printing.</p>
        <div className="pt-4">
          <Link href="/shop" className="text-gold hover:underline inline-flex items-center gap-1">
            ← Continue shopping our creative collection
          </Link>
        </div>
      </div>
    </div>
  );
}
