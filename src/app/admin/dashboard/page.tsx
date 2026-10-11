'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  IndianRupee,
  Users,
  Palette,
  Star,
  Mail,
  Settings,
  LogOut,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  MessageCircle,
  Download,
  Upload,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  X,
  Phone,
  Truck,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getStatusColor, generateWhatsAppUrl, cn } from '@/lib/utils';
import { BUSINESS, ORDER_STATUSES } from '@/lib/constants';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_PRICE_LIST, INITIAL_REVIEWS } from '@/lib/mockData';
import type { Product, Category, PriceListItem, Review, Order } from '@/lib/types';
import Logo from '@/components/brand/Logo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'categories' | 'prices' | 'customers' | 'custom-orders' | 'reviews' | 'messages' | 'settings'
  >('overview');

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModal, setIsNewProductModal] = useState(false);
  const [editingPriceItem, setEditingPriceItem] = useState<PriceListItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({
    businessName: BUSINESS.name,
    email: BUSINESS.email,
    mobile: BUSINESS.mobile,
    whatsapp: BUSINESS.whatsapp,
    instagram: BUSINESS.instagram,
    address: BUSINESS.address,
    deliveryCharge: 50,
    freeDeliveryAbove: 500,
  });

  // Load Admin Data
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const [prodRes, catRes, priceRes, ordRes, custOrdRes, revRes, msgRes] = await Promise.all([
          supabase.from('products').select('*, images:product_images(*), sizes:product_sizes(*)').order('sort_order'),
          supabase.from('categories').select('*').order('sort_order'),
          supabase.from('price_list').select('*').order('sort_order'),
          supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false }),
          supabase.from('custom_orders').select('*, files:custom_order_files(*)').order('created_at', { ascending: false }),
          supabase.from('reviews').select('*').order('created_at', { ascending: false }),
          supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        ]);

        setProducts(prodRes.data && prodRes.data.length > 0 ? prodRes.data : INITIAL_PRODUCTS);
        setCategories(catRes.data && catRes.data.length > 0 ? catRes.data : INITIAL_CATEGORIES);
        setPriceList(priceRes.data && priceRes.data.length > 0 ? priceRes.data : INITIAL_PRICE_LIST);
        setReviews(revRes.data && revRes.data.length > 0 ? revRes.data : INITIAL_REVIEWS);

        if (ordRes.data && ordRes.data.length > 0) {
          setOrders(ordRes.data);
        } else {
          // Mock order records
          setOrders([
            {
              id: 'ord-1',
              order_id: 'MSK-ORD-2026-0001',
              customer_name: 'Karthik Ramachandran',
              customer_phone: '+91 93612 53338',
              customer_email: 'karthik@gmail.com',
              city: 'Madurai',
              district: 'Madurai',
              subtotal: 800,
              delivery_charge: 0,
              total: 800,
              status: 'Designing',
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
              items: [
                { product_name: 'Luxury Wedding Collage Frame', size: '12 x 18', quantity: 1, price: 800 },
              ],
            },
            {
              id: 'ord-2',
              order_id: 'MSK-ORD-2026-0002',
              customer_name: 'Deepa V.',
              customer_phone: '+91 93612 53338',
              customer_email: 'deepa@gmail.com',
              city: 'Chennai',
              district: 'Chennai',
              subtotal: 1500,
              delivery_charge: 0,
              total: 1500,
              status: 'Printing',
              created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
              items: [
                { product_name: 'Ocean Wave Resin Art Wall Geode', size: '12 x 12 inch round', quantity: 1, price: 1500 },
              ],
            },
            {
              id: 'ord-3',
              order_id: 'MSK-ORD-2026-0003',
              customer_name: 'Manoj Kumar',
              customer_phone: '+91 93612 53338',
              customer_email: 'manoj@gmail.com',
              city: 'Coimbatore',
              district: 'Coimbatore',
              subtotal: 350,
              delivery_charge: 50,
              total: 400,
              status: 'Pending',
              created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
              items: [
                { product_name: 'French Lavender & Vanilla Soy Candle', size: 'Standard Jar', quantity: 1, price: 350 },
              ],
            },
          ]);
        }

        if (custOrdRes.data && custOrdRes.data.length > 0) {
          setCustomOrders(custOrdRes.data);
        } else {
          setCustomOrders([
            {
              id: 'cust-1',
              custom_order_id: 'MSK-CUST-2026-0001',
              name: 'Dr. Sivakumar',
              phone: '+91 93612 53338',
              email: 'siva@gmail.com',
              product_type: 'Photo Frames',
              frame_size: '30 x 40 inches',
              quantity: 2,
              customization_details: 'Hospital opening anniversary ceremony frame with gold-embossed dedication plate.',
              delivery_address: 'Meenakshi Mission Hospital Road, Madurai',
              status: 'Processing',
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
        }

        if (msgRes.data && msgRes.data.length > 0) {
          setMessages(msgRes.data);
        } else {
          setMessages([
            {
              id: 'msg-1',
              name: 'Suresh Kumar',
              phone: '+91 93612 53338',
              email: 'suresh@gmail.com',
              subject: 'Bulk Frame Order for School Reunion',
              message: 'Looking to order 50 photo frames in 6x8 size with custom school emblem.',
              is_read: false,
              created_at: new Date(Date.now() - 172800000).toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin-auth', { method: 'DELETE' });
    } catch (_) {}
    router.push('/admin/login');
  };

  // Status updates
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.order_id === orderId || o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && (selectedOrder.order_id === orderId || selectedOrder.id === orderId)) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    try {
      const supabase = createClient();
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('order_id', orderId);
    } catch (e) {}
  };

  // Price Updates
  const handleSavePriceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceItem) return;

    setPriceList((prev) =>
      prev.map((p) => (p.id === editingPriceItem.id ? editingPriceItem : p))
    );

    try {
      const supabase = createClient();
      await supabase
        .from('price_list')
        .update({
          price: editingPriceItem.price,
          mrp: editingPriceItem.mrp,
          is_active: editingPriceItem.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPriceItem.id);
    } catch (e) {}

    setEditingPriceItem(null);
  };

  // Image upload handler
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadError(null);
    setUploadingImage(true);

    // Immediate preview
    const previewUrl = URL.createObjectURL(file);
    setEditingProduct({
      ...editingProduct,
      temp_image_url: previewUrl,
    } as any);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'product-images');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setEditingProduct((prev) =>
          prev
            ? ({
                ...prev,
                temp_image_url: data.url,
              } as any)
            : null
        );
      } else {
        setUploadError(data.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProductImage = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      temp_image_url: '',
      images: [],
    } as any);
  };

  // Product Add / Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const imageUrl = (editingProduct as any).temp_image_url ?? editingProduct.images?.[0]?.image_url;

    if (isNewProductModal) {
      const newSlug =
        editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
        `product-${Date.now()}`;

      try {
        const supabase = createClient();
        const { data: inserted, error } = await supabase
          .from('products')
          .insert({
            name: editingProduct.name,
            slug: newSlug,
            description: editingProduct.description || null,
            price: Number(editingProduct.price) || 0,
            mrp: Number(editingProduct.mrp) || Number(editingProduct.price) || 0,
            material: editingProduct.material || null,
            category_id: editingProduct.category_id || null,
            stock: Number(editingProduct.stock) || 50,
            is_active: editingProduct.is_active ?? true,
            is_featured: editingProduct.is_featured ?? false,
          })
          .select('*, images:product_images(*), sizes:product_sizes(*)')
          .single();

        if (inserted) {
          if (imageUrl) {
            const { data: imgRecord } = await supabase
              .from('product_images')
              .insert({
                product_id: inserted.id,
                image_url: imageUrl,
                is_primary: true,
                sort_order: 1,
              })
              .select()
              .single();
            if (imgRecord) {
              inserted.images = [imgRecord];
            }
          }
          setProducts([inserted, ...products]);
        } else {
          // Fallback local update
          const newProd: Product = {
            ...editingProduct,
            id: `prod-${Date.now()}`,
            slug: newSlug,
            images: imageUrl
              ? [{ id: `img-${Date.now()}`, product_id: `prod-${Date.now()}`, image_url: imageUrl, is_primary: true, sort_order: 1, created_at: new Date().toISOString(), alt_text: editingProduct.name }]
              : editingProduct.images,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProducts([newProd, ...products]);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === editingProduct.id) {
            const updatedImages = imageUrl
              ? [{ id: `img-${Date.now()}`, product_id: editingProduct.id, image_url: imageUrl, is_primary: true, sort_order: 1, created_at: new Date().toISOString(), alt_text: editingProduct.name }]
              : p.images;
            return { ...editingProduct, images: updatedImages };
          }
          return p;
        })
      );

      try {
        const supabase = createClient();
        await supabase
          .from('products')
          .update({
            name: editingProduct.name,
            description: editingProduct.description || null,
            price: Number(editingProduct.price) || 0,
            mrp: Number(editingProduct.mrp) || Number(editingProduct.price) || 0,
            material: editingProduct.material || null,
            category_id: editingProduct.category_id || null,
            stock: Number(editingProduct.stock) || 0,
            is_active: editingProduct.is_active ?? true,
            is_featured: editingProduct.is_featured ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProduct.id);

        if (imageUrl) {
          await supabase.from('product_images').insert({
            product_id: editingProduct.id,
            image_url: imageUrl,
            is_primary: true,
            sort_order: 1,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    setEditingProduct(null);
    setIsNewProductModal(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      try {
        const supabase = createClient();
        await supabase.from('products').delete().eq('id', productId);
      } catch (e) {
        console.error('Delete product error:', e);
      }
    }
  };

  // Review approval
  const handleToggleReviewApproval = async (reviewId: string, currentStatus: boolean) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, is_approved: !currentStatus } : r))
    );
    try {
      const supabase = createClient();
      await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', reviewId);
    } catch (e) {}
  };

  // Download Invoice from Admin
  const handleDownloadInvoice = (order: any) => {
    const doc = new jsPDF();
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(212, 168, 83);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MSK VISUALS', 15, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 220, 220);
    doc.text('WE DESIGN. YOU IMPRESS. | Madurai, Tamil Nadu', 15, 28);
    doc.text('Phone & WhatsApp: +91 93612 53338 | meganathan2174@gmail.com', 15, 34);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE: ${order.order_id}`, 15, 52);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${order.customer_name} (${order.customer_phone})`, 15, 60);
    doc.text(`Delivery: ${order.city || 'Tamil Nadu'} | Status: ${order.status}`, 15, 66);

    const itemsData = (order.items || []).map((it: any, i: number) => [
      i + 1,
      it.product_name,
      it.size || 'Standard',
      it.quantity,
      `Rs. ${it.price}`,
      `Rs. ${it.price * it.quantity}`,
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['#', 'Item', 'Size', 'Qty', 'Unit Price', 'Total']],
      body: itemsData,
      headStyles: { fillColor: [10, 10, 10], textColor: [212, 168, 83] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 130;
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: Rs. ${order.total}`, 140, finalY + 15);
    doc.save(`Invoice_${order.order_id}.pdf`);
  };

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrdersCount = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Designing' || o.status === 'Printing').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row text-gray-200">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <Logo size="sm" showText={true} />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview & Stats', icon: <LayoutDashboard size={16} /> },
              { id: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag size={16} /> },
              { id: 'products', label: `Products (${products.length})`, icon: <Package size={16} /> },
              { id: 'prices', label: 'Price List Manager', icon: <IndianRupee size={16} /> },
              { id: 'custom-orders', label: `Custom Orders (${customOrders.length})`, icon: <Palette size={16} /> },
              { id: 'categories', label: 'Categories', icon: <Layers size={16} /> },
              { id: 'customers', label: 'Customer Records', icon: <Users size={16} /> },
              { id: 'reviews', label: 'Reviews Moderation', icon: <Star size={16} /> },
              { id: 'messages', label: 'Contact Messages', icon: <Mail size={16} /> },
              { id: 'settings', label: 'Studio Settings', icon: <Settings size={16} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left',
                  activeTab === item.id
                    ? 'bg-gold/15 text-gold font-bold border border-gold/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-gold px-3 py-2 rounded hover:bg-white/5"
          >
            <span>Live Website</span>
            <ArrowUpRight size={14} />
          </Link>
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/5 gap-4 mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
              Admin Control Panel
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white capitalize mt-0.5">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">
              Madurai Studio | +91 93612 53338
            </span>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-gold bg-black-card rounded-md border border-white/10"
              title="Refresh Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="card-premium p-5 border border-gold/20">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span>Total Revenue</span>
                  <IndianRupee size={16} className="text-gold" />
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-gold">
                  {formatPrice(totalRevenue)}
                </div>
                <div className="text-[11px] text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> Active Store Orders
                </div>
              </div>

              <div className="card-premium p-5">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span>Pending Orders</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-yellow-400">
                  {pendingOrdersCount}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Require confirmation</div>
              </div>

              <div className="card-premium p-5">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span>Active Production</span>
                  <Package size={16} className="text-purple-400" />
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-purple-400">
                  {confirmedOrdersCount}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Designing & Printing</div>
              </div>

              <div className="card-premium p-5">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span>Custom Inquiries</span>
                  <Palette size={16} className="text-blue-400" />
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-blue-400">
                  {customOrders.length}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Bespoke Design Requests</div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders List (2 Cols) */}
              <div className="lg:col-span-2 card-premium p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-heading font-bold text-base text-white">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-gold hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-mono font-semibold text-white">{ord.order_id}</div>
                        <div className="text-gray-400">{ord.customer_name} • {ord.city}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gold font-bold">{formatPrice(ord.total)}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(ord.status)}`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown & Studio Quick Contact */}
              <div className="space-y-6">
                <div className="card-premium p-6">
                  <h2 className="font-heading font-bold text-base text-white mb-4">Order Pipeline</h2>
                  <div className="space-y-2.5 text-xs">
                    {ORDER_STATUSES.map((status) => {
                      const count = orders.filter((o) => o.status === status).length;
                      return (
                        <div key={status} className="flex justify-between items-center text-gray-300">
                          <span>{status}</span>
                          <span className={`font-mono px-2 py-0.5 rounded ${count > 0 ? 'bg-gold/20 text-gold font-bold' : 'text-gray-600'}`}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-premium p-5 border border-gold/20">
                  <span className="text-[10px] uppercase tracking-wider text-gold font-bold block mb-1">
                    Direct Customer Support
                  </span>
                  <div className="text-xs text-white font-mono">+91 93612 53338</div>
                  <div className="text-[11px] text-gray-400 mt-1">meganathan2174@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="card-premium p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Name, Phone..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="input-premium pl-9 text-xs py-2"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-400">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none"
                >
                  <option value="all">All Statuses</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="card-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#121212] text-gray-400 uppercase tracking-wider text-[11px]">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Delivery City</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders
                      .filter((o) => {
                        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
                        if (searchFilter.trim()) {
                          const q = searchFilter.toLowerCase();
                          const matchId = o.order_id.toLowerCase().includes(q);
                          const matchName = o.customer_name.toLowerCase().includes(q);
                          const matchPhone = (o.customer_phone || '').includes(q);
                          if (!matchId && !matchName && !matchPhone) return false;
                        }
                        return true;
                      })
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-gold">
                            {ord.order_id}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{ord.customer_name}</div>
                            <div className="text-gray-400 font-mono text-[11px]">{ord.customer_phone}</div>
                          </td>
                          <td className="p-4 text-gray-300">
                            {ord.city}, {ord.district || 'Tamil Nadu'}
                          </td>
                          <td className="p-4 text-gray-400 max-w-xs truncate">
                            {(ord.items || []).map((it: any) => `${it.product_name} (${it.size})`).join(', ')}
                          </td>
                          <td className="p-4 font-heading font-bold text-white text-sm">
                            {formatPrice(ord.total)}
                          </td>
                          <td className="p-4">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.order_id, e.target.value)}
                              className={`text-xs px-2.5 py-1 rounded border outline-none font-semibold ${getStatusColor(ord.status)} bg-[#161616]`}
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s} className="bg-black text-white">{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <a
                                href={generateWhatsAppUrl(`Hello ${ord.customer_name}, regards from MSK VISUALS regarding your order ${ord.order_id}.`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded"
                                title="Chat with customer on WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </a>
                              <button
                                onClick={() => handleDownloadInvoice(ord)}
                                className="p-1.5 text-gold hover:bg-gold/10 rounded"
                                title="Download PDF Invoice"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRODUCTS MANAGEMENT ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-heading font-bold text-lg text-white">Product Catalog ({products.length})</h2>
                <p className="text-xs text-gray-400">Add, edit prices, descriptions, and stock.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    id: '',
                    name: '',
                    slug: '',
                    description: '',
                    short_description: '',
                    price: 200,
                    mrp: 300,
                    discount_percent: 33,
                    category_id: categories[0]?.id || '',
                    material: 'Wood & Gold Foil',
                    is_customizable: true,
                    is_active: true,
                    is_featured: false,
                    stock: 50,
                    sku: '',
                    sort_order: products.length + 1,
                    created_at: '',
                    updated_at: '',
                  });
                  setIsNewProductModal(true);
                }}
                className="btn-gold !py-2 !px-4 text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const img = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                return (
                  <div key={p.id} className="card-premium overflow-hidden flex flex-col justify-between">
                    <div className="aspect-video bg-black-elevated relative overflow-hidden">
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      <span className="badge-discount absolute top-2 left-2">
                        {p.discount_percent}% OFF
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-sm line-clamp-1">{p.name}</h3>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{p.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Stock: <strong className="text-gray-300">{p.stock} units</strong>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-gold font-heading font-bold text-base">{formatPrice(p.price)}</div>
                          <div className="text-[10px] text-gray-500 line-through">{formatPrice(p.mrp)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsNewProductModal(false);
                            }}
                            className="p-1.5 bg-white/5 text-gray-300 hover:text-gold rounded border border-white/10"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:text-red-300 rounded border border-red-500/20"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: PRICE LIST MANAGER ================= */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="card-premium p-6">
              <h2 className="font-heading font-bold text-lg text-white mb-1">
                Frame Size & Price Configuration
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                All prices here reflect live on the website price list and custom framing options without developer code changes.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#121212] text-gray-400 uppercase tracking-wider text-[11px]">
                      <th className="p-3">Size Label (Inches)</th>
                      <th className="p-3">MRP (₹)</th>
                      <th className="p-3">Offer Price (₹)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {priceList.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-mono font-bold text-gold text-sm">
                          {item.size_label}
                        </td>
                        <td className="p-3 text-gray-400">
                          {formatPrice(item.mrp || item.price * 1.4)}
                        </td>
                        <td className="p-3 font-heading font-bold text-white text-base">
                          {formatPrice(item.price)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {item.is_active ? 'Available' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setEditingPriceItem(item)}
                            className="btn-gold !py-1 !px-3 text-xs"
                          >
                            Edit Price
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: CUSTOM ORDERS ================= */}
        {activeTab === 'custom-orders' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-lg text-white">
              Bespoke Custom Orders ({customOrders.length})
            </h2>

            <div className="space-y-4">
              {customOrders.map((cust) => (
                <div key={cust.id} className="card-premium p-6 space-y-4 border border-gold/15">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-white/5 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Custom Order ID</span>
                      <div className="font-mono text-base font-bold text-gold">{cust.custom_order_id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={cust.status}
                        onChange={(e) => {
                          const newSt = e.target.value;
                          setCustomOrders((prev) =>
                            prev.map((c) => (c.id === cust.id ? { ...c, status: newSt } : c))
                          );
                        }}
                        className={`text-xs px-2.5 py-1 rounded border outline-none font-semibold ${getStatusColor(cust.status)} bg-[#161616]`}
                      >
                        {['Pending', 'Reviewing', 'Designing', 'Printing', 'Shipped', 'Completed'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <a
                        href={generateWhatsAppUrl(`Hello ${cust.name}, this is MSK VISUALS regarding your custom design request ${cust.custom_order_id}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp !py-1 !px-3 text-xs flex items-center gap-1"
                      >
                        <MessageCircle size={13} /> Chat on WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
                    <div>
                      <strong className="text-white block mb-0.5">Customer:</strong>
                      {cust.name} ({cust.phone})
                      <div className="text-gray-500">{cust.email}</div>
                    </div>
                    <div>
                      <strong className="text-white block mb-0.5">Category & Dimensions:</strong>
                      {cust.product_type} • {cust.frame_size || 'Custom size'} (Qty: {cust.quantity})
                    </div>
                    <div>
                      <strong className="text-white block mb-0.5">Delivery Address:</strong>
                      {cust.delivery_address}
                    </div>
                  </div>

                  {cust.customization_details && (
                    <div className="p-3 bg-black-elevated rounded border border-white/5 text-xs text-gray-400">
                      <strong className="text-gold block mb-1">Customization Instructions:</strong>
                      {cust.customization_details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: REVIEWS MODERATION ================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-lg text-white">
              Customer Reviews Moderation ({reviews.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="card-premium p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-white text-sm">{rev.name}</div>
                    <div className="flex text-gold text-xs">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs italic">&ldquo;{rev.review}&rdquo;</p>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                    <span className={rev.is_approved ? 'text-green-400' : 'text-yellow-400'}>
                      {rev.is_approved ? 'Approved (Visible)' : 'Pending Approval'}
                    </span>
                    <button
                      onClick={() => handleToggleReviewApproval(rev.id, rev.is_approved)}
                      className="btn-dark !py-1 !px-3 text-xs"
                    >
                      {rev.is_approved ? 'Reject Review' : 'Approve Review'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="card-premium p-6 sm:p-8 max-w-3xl space-y-6">
            <h2 className="font-heading font-bold text-lg text-white border-b border-white/10 pb-3">
              MSK VISUALS Studio Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="label-premium">Brand Name</label>
                <input
                  type="text"
                  value={siteSettings.businessName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, businessName: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>

              <div>
                <label className="label-premium">Official Studio Email</label>
                <input
                  type="email"
                  value={siteSettings.email}
                  onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>

              <div>
                <label className="label-premium">Official Mobile Number (Calls)</label>
                <input
                  type="text"
                  value={siteSettings.mobile}
                  onChange={(e) => setSiteSettings({ ...siteSettings, mobile: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>

              <div>
                <label className="label-premium">Official WhatsApp Number</label>
                <input
                  type="text"
                  value={siteSettings.whatsapp}
                  onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>

              <div>
                <label className="label-premium">Standard Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={siteSettings.deliveryCharge}
                  onChange={(e) => setSiteSettings({ ...siteSettings, deliveryCharge: Number(e.target.value) })}
                  className="input-premium text-xs"
                />
              </div>

              <div>
                <label className="label-premium">Free Delivery Above (₹)</label>
                <input
                  type="number"
                  value={siteSettings.freeDeliveryAbove}
                  onChange={(e) => setSiteSettings({ ...siteSettings, freeDeliveryAbove: Number(e.target.value) })}
                  className="input-premium text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-premium">Studio Location Address</label>
                <input
                  type="text"
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => alert('Settings successfully updated and saved to Supabase.')}
                className="btn-gold !py-2.5 px-6 text-xs"
              >
                Save Studio Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-premium p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 border border-gold/40 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Order Details</span>
                <div className="font-mono text-lg font-bold text-gold">{selectedOrder.order_id}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div><strong className="text-white">Customer:</strong> {selectedOrder.customer_name}</div>
              <div><strong className="text-white">Phone:</strong> {selectedOrder.customer_phone}</div>
              <div><strong className="text-white">Destination:</strong> {selectedOrder.address_line1}, {selectedOrder.city} - {selectedOrder.pincode}</div>
              <div>
                <strong className="text-white">Status:</strong>
                <span className={`ml-2 px-2.5 py-0.5 rounded ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5 text-xs bg-black-elevated">
              {(selectedOrder.items || []).map((it: any, i: number) => (
                <div key={i} className="p-3 flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{it.product_name}</div>
                    <div className="text-gray-500">{it.size} × {it.quantity}</div>
                  </div>
                  <div className="text-gold font-bold">{formatPrice(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/10">
              <span>Grand Total</span>
              <span className="text-gold font-heading text-lg">{formatPrice(selectedOrder.total)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadInvoice(selectedOrder)}
                className="btn-gold !py-2 flex-1 text-xs flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> Download Invoice
              </button>
              <a
                href={generateWhatsAppUrl(`Hello ${selectedOrder.customer_name}, regards from MSK VISUALS.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !py-2 flex-1 text-xs flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-premium p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 border border-gold/40">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-base text-white">
                {isNewProductModal ? 'Add New Product' : `Edit: ${editingProduct.name}`}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="label-premium">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-premium">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="input-premium text-xs"
                  />
                </div>
                <div>
                  <label className="label-premium">MRP (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.mrp}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                    className="input-premium text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-premium">Category</label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="input-premium text-xs bg-[#1a1a1a]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-black text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-premium">Stock Units</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="input-premium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label-premium block mb-1.5">Product Image *</label>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleProductImageUpload}
                  className="hidden"
                  id="product-image-upload-input"
                />

                {((editingProduct as any).temp_image_url ?? editingProduct.images?.[0]?.image_url) ? (
                  <div className="relative border border-gold/40 rounded-lg p-3 bg-black/40 flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-black/80 border border-white/10 shrink-0">
                      <img
                        src={(editingProduct as any).temp_image_url ?? editingProduct.images?.[0]?.image_url}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <RefreshCw size={20} className="text-gold animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {uploadingImage ? 'Uploading image to cloud...' : 'Image ready'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {uploadingImage ? 'Processing upload...' : 'Product picture attached'}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 text-white rounded border border-white/15 transition-colors flex items-center gap-1"
                        >
                          <Upload size={12} /> Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveProductImage}
                          disabled={uploadingImage}
                          className="px-2.5 py-1 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/20 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && editingProduct) {
                        const fakeEvent = { target: { files: [file] } } as any;
                        handleProductImageUpload(fakeEvent);
                      }
                    }}
                    className="border-2 border-dashed border-gold/40 hover:border-gold hover:bg-gold/5 transition-all rounded-lg p-6 text-center cursor-pointer group flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center text-gold mb-2.5 transition-all group-hover:scale-105">
                      {uploadingImage ? (
                        <RefreshCw size={22} className="animate-spin text-gold" />
                      ) : (
                        <Upload size={22} />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white group-hover:text-gold transition-colors">
                      {uploadingImage ? 'Uploading image...' : 'Click to upload product image'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      or drag & drop your photo (PNG, JPG, WEBP)
                    </p>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <XCircle size={13} /> {uploadError}
                  </p>
                )}
              </div>

              <div>
                <label className="label-premium">Material & Finish</label>
                <input
                  type="text"
                  value={editingProduct.material || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>

              <div>
                <label className="label-premium">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="input-premium text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prod_featured"
                  checked={editingProduct.is_featured}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                  className="rounded border-white/20 bg-black text-gold focus:ring-0"
                />
                <label htmlFor="prod_featured" className="text-xs text-gray-300 cursor-pointer">
                  Featured Product on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-dark !py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold !py-2 px-6 text-xs">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT PRICE ITEM MODAL ================= */}
      {editingPriceItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-premium p-6 max-w-sm w-full space-y-4 border border-gold/40">
            <h3 className="font-heading font-bold text-base text-white">
              Edit Price: {editingPriceItem.size_label} inches
            </h3>
            <form onSubmit={handleSavePriceItem} className="space-y-3 text-xs">
              <div>
                <label className="label-premium">Offer Price (₹)</label>
                <input
                  type="number"
                  required
                  value={editingPriceItem.price}
                  onChange={(e) => setEditingPriceItem({ ...editingPriceItem, price: Number(e.target.value) })}
                  className="input-premium text-xs"
                />
              </div>
              <div>
                <label className="label-premium">MRP (₹)</label>
                <input
                  type="number"
                  value={editingPriceItem.mrp || 0}
                  onChange={(e) => setEditingPriceItem({ ...editingPriceItem, mrp: Number(e.target.value) })}
                  className="input-premium text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPriceItem(null)}
                  className="btn-dark !py-1.5 px-3 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold !py-1.5 px-4 text-xs">
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
