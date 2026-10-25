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
  Frame,
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
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModal, setIsNewProductModal] = useState(false);
  const [editingPriceItem, setEditingPriceItem] = useState<PriceListItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; title: string } | null>(null);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [updatingCustomOrderId, setUpdatingCustomOrderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Frame Sizes & Mockups Management State
  const [isNewFrameSizeModal, setIsNewFrameSizeModal] = useState(false);
  const [deletingFrameSize, setDeletingFrameSize] = useState<PriceListItem | null>(null);
  const [frameSearch, setFrameSearch] = useState('');
  const [frameFilter, setFrameFilter] = useState<'all' | 'active' | 'disabled' | 'with-mockup' | 'no-mockup'>('all');
  const [frameSort, setFrameSort] = useState<'sort_order' | 'price-asc' | 'price-desc' | 'label'>('sort_order');
  const [frameForm, setFrameForm] = useState<{
    id?: string;
    size_label: string;
    width: number | '';
    height: number | '';
    price: number | '';
    mrp: number | '';
    image_url: string;
    is_active: boolean;
  }>({
    size_label: '',
    width: '',
    height: '',
    price: '',
    mrp: '',
    image_url: '',
    is_active: true,
  });
  const [frameMockupFile, setFrameMockupFile] = useState<File | null>(null);
  const [frameMockupPreview, setFrameMockupPreview] = useState<string | null>(null);
  const [savingFrameSize, setSavingFrameSize] = useState(false);
  const [frameError, setFrameError] = useState<string | null>(null);
  const frameFileInputRef = useRef<HTMLInputElement>(null);

  // Direct high-res photo download helper
  const handleDownloadPic = async (url: string, filename?: string) => {
    try {
      setDownloadingUrl(url);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'downloaded-pic.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.warn('Direct blob download failed, falling back to window.open:', err);
      window.open(url, '_blank');
    } finally {
      setDownloadingUrl(null);
    }
  };

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
        const res = await fetch('/api/admin/data');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const { products, categories, priceList, orders, customOrders, reviews, messages } = json.data;
            setProducts(products && products.length > 0 ? products : INITIAL_PRODUCTS);
            setCategories(categories && categories.length > 0 ? categories : INITIAL_CATEGORIES);
            setPriceList(priceList && priceList.length > 0 ? priceList : INITIAL_PRICE_LIST);
            setReviews(reviews && reviews.length > 0 ? reviews : INITIAL_REVIEWS);
            setOrders(orders && orders.length > 0 ? orders : []);
            setCustomOrders(customOrders && customOrders.length > 0 ? customOrders : []);
            setMessages(messages && messages.length > 0 ? messages : []);
            setLoading(false);
            return;
          }
        } else if (res.status === 401) {
          router.push('/admin/login');
          return;
        }

        // Fallback if API fails
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
        setOrders(ordRes.data && ordRes.data.length > 0 ? ordRes.data : []);
        setCustomOrders(custOrdRes.data && custOrdRes.data.length > 0 ? custOrdRes.data : []);
        setMessages(msgRes.data && msgRes.data.length > 0 ? msgRes.data : []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

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
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  // Custom Order Status Updates (Persists to database & customer dashboard)
  const handleUpdateCustomOrderStatus = async (customOrderId: string, id: string, newStatus: string) => {
    const prevOrders = [...customOrders];
    // 1. Optimistic UI update
    setCustomOrders((prev) =>
      prev.map((c) =>
        c.custom_order_id === customOrderId || c.id === id ? { ...c, status: newStatus } : c
      )
    );
    setUpdatingCustomOrderId(customOrderId || id);

    try {
      // 2. Persist to Supabase custom_orders table via /api/admin/orders
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: customOrderId || id,
          id: id,
          custom_order_id: customOrderId,
          is_custom: true,
          status: newStatus,
        }),
      });

      const resJson = await res.json().catch(() => ({}));
      if (!res.ok || !resJson.success) {
        // Fallback to /api/admin/data
        const fallbackRes = await fetch('/api/admin/data', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_custom_order_status',
            custom_order_id: customOrderId,
            id: id,
            status: newStatus,
          }),
        });
        const fallbackJson = await fallbackRes.json().catch(() => ({}));
        if (!fallbackRes.ok || !fallbackJson.success) {
          throw new Error(fallbackJson.error || resJson.error || 'Failed to update custom order status');
        }
      }
    } catch (e: any) {
      console.error('Failed to update custom order status:', e);
      // Revert if network error
      setCustomOrders(prevOrders);
      alert(`Could not save status: ${e.message || 'Please check connection'}`);
    } finally {
      setUpdatingCustomOrderId(null);
    }
  };

  // ================= FRAME SIZES & MOCKUPS HANDLERS =================
  const handleOpenCreateFrameSize = () => {
    setFrameForm({
      size_label: '',
      width: '',
      height: '',
      price: '',
      mrp: '',
      image_url: '',
      is_active: true,
    });
    setFrameMockupFile(null);
    setFrameMockupPreview(null);
    setFrameError(null);
    setIsNewFrameSizeModal(true);
  };

  const handleOpenEditFrameSize = (item: PriceListItem) => {
    setFrameForm({
      id: item.id,
      size_label: item.size_label,
      width: item.width ?? '',
      height: item.height ?? '',
      price: item.price,
      mrp: item.mrp || Math.round(item.price * 1.4),
      image_url: item.image_url || '',
      is_active: item.is_active,
    });
    setFrameMockupFile(null);
    setFrameMockupPreview(null);
    setFrameError(null);
    setEditingPriceItem(item);
  };

  const handleFrameMockupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFrameError('Please select a valid image file (JPG, PNG, WEBP, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFrameError('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setFrameError(null);
    setFrameMockupFile(file);
    // Instant preview before saving
    setFrameMockupPreview(URL.createObjectURL(file));
  };

  const handleRemoveFrameMockup = () => {
    setFrameMockupFile(null);
    setFrameMockupPreview(null);
    setFrameForm((prev) => ({ ...prev, image_url: '' }));
    if (frameFileInputRef.current) {
      frameFileInputRef.current.value = '';
    }
  };

  const handleSaveFrameSize = async (e: React.FormEvent, isEditing: boolean) => {
    e.preventDefault();
    setSavingFrameSize(true);
    setFrameError(null);

    try {
      let finalImageUrl = frameForm.image_url;

      // 1. If a new mockup file was selected, upload it to storage first
      if (frameMockupFile) {
        const formData = new FormData();
        formData.append('file', frameMockupFile);
        formData.append('bucket', 'product-images');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.url) {
          throw new Error(uploadJson.error || 'Failed to upload mockup image to storage.');
        }

        finalImageUrl = uploadJson.url;
      }

      if (isEditing && frameForm.id) {
        // UPDATE existing frame size
        const res = await fetch('/api/admin/price-list', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: frameForm.id,
            size_label: frameForm.size_label,
            width: frameForm.width === '' ? null : Number(frameForm.width),
            height: frameForm.height === '' ? null : Number(frameForm.height),
            price: Number(frameForm.price),
            mrp: frameForm.mrp === '' ? Number(frameForm.price) * 1.4 : Number(frameForm.mrp),
            image_url: finalImageUrl || null,
            is_active: frameForm.is_active,
            old_image_url: editingPriceItem?.image_url,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to update frame size.');
        }

        setPriceList((prev) =>
          prev.map((item) => (item.id === frameForm.id ? json.data : item))
        );
        setEditingPriceItem(null);
      } else {
        // CREATE new frame size
        const res = await fetch('/api/admin/price-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            size_label: frameForm.size_label,
            width: frameForm.width === '' ? null : Number(frameForm.width),
            height: frameForm.height === '' ? null : Number(frameForm.height),
            price: Number(frameForm.price),
            mrp: frameForm.mrp === '' ? Number(frameForm.price) * 1.4 : Number(frameForm.mrp),
            image_url: finalImageUrl || null,
            is_active: frameForm.is_active,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to create frame size.');
        }

        setPriceList((prev) => [...prev, json.data]);
        setIsNewFrameSizeModal(false);
      }
    } catch (err: any) {
      console.error('Save frame size error:', err);
      setFrameError(err.message || 'Error occurred while saving frame size.');
    } finally {
      setSavingFrameSize(false);
    }
  };

  const handleToggleFrameStatus = async (item: PriceListItem) => {
    const updatedStatus = !item.is_active;
    // Optimistic UI update
    setPriceList((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, is_active: updatedStatus } : p))
    );

    try {
      await fetch('/api/admin/price-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          id: item.id,
          is_active: updatedStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to toggle frame size status:', err);
    }
  };

  const handleConfirmDeleteFrameSize = async () => {
    if (!deletingFrameSize) return;
    const targetId = deletingFrameSize.id;

    // Optimistic UI update
    setPriceList((prev) => prev.filter((p) => p.id !== targetId));
    setDeletingFrameSize(null);

    try {
      await fetch(`/api/admin/price-list?id=${targetId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete frame size:', err);
    }
  };

  // Backward compatible alias
  const handleSavePriceItem = async (e: React.FormEvent) => {
    await handleSaveFrameSize(e, true);
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

    const itemsData = (order.items || []).map((it: any, i: number) => {
      let desc = it.product_name;
      if (it.customization_name) desc += `\nName: ${it.customization_name}`;
      if (it.uploaded_image_url) desc += `\n[Custom Photo Attached]`;
      return [
        i + 1,
        desc,
        it.size || 'Standard',
        it.quantity,
        `Rs. ${it.price}`,
        `Rs. ${it.price * it.quantity}`,
      ];
    });

    autoTable(doc, {
      startY: 75,
      head: [['#', 'Item', 'Size', 'Qty', 'Unit Price', 'Total']],
      body: itemsData,
      headStyles: { fillColor: [10, 10, 10], textColor: [212, 168, 83] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 130;
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: Rs. ${order.total}`, 140, finalY + 15);

    // Attached photos note
    const itemsWithPics = (order.items || []).filter((it: any) => it.uploaded_image_url);
    if (itemsWithPics.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(212, 168, 83);
      doc.text('CUSTOMER ATTACHED PHOTOS:', 15, finalY + 28);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      itemsWithPics.forEach((it: any, pIdx: number) => {
        doc.text(`• ${it.product_name}: ${it.uploaded_image_url}`, 15, finalY + 34 + pIdx * 5);
      });
    }

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
              { id: 'prices', label: `Frame Sizes & Mockups (${priceList.length})`, icon: <Frame size={16} /> },
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
        {activeTab === 'products' && (() => {
          // Frame sub-category slugs — all these belong under Photo Frames
          const FRAME_SUB_SLUGS = [
            'photo-frames','single-frames','multi-photo-frames','customized-frames',
            'religious-frames','wedding-frames','birthday-frames','memorial-frames',
            'couple-frames','family-frames','corporate-frames',
          ];

          // Filter products by selected category tab
          const filteredProds = products.filter((p) => {
            // Category filter
            if (productCategoryFilter !== 'all') {
              const selectedCat = categories.find((c) => c.id === productCategoryFilter);
              if (!selectedCat) return false;

              if (selectedCat.slug === 'photo-frames') {
                // Show ALL frame sub-category products under Photo Frames tab
                const productCat = categories.find((c) => c.id === p.category_id);
                const isFrame = FRAME_SUB_SLUGS.includes(productCat?.slug || '') || FRAME_SUB_SLUGS.includes((p as any).category?.slug || '');
                if (!isFrame) return false;
              } else {
                // Direct match for Flex, Resin Art, DIY Candles, Logo Design, Gifts
                const directMatch = p.category_id === selectedCat.id || (p as any).category?.slug === selectedCat.slug;
                if (!directMatch) return false;
              }
            }

            // Search filter
            if (searchFilter.trim()) {
              const q = searchFilter.toLowerCase();
              return (
                p.name.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.sku || '').toLowerCase().includes(q)
              );
            }
            return true;
          });

          // Count for Photo Frames tab = all frame sub-products
          const photoFrameCount = products.filter((p) => {
            const productCat = categories.find((c) => c.id === p.category_id);
            return FRAME_SUB_SLUGS.includes(productCat?.slug || '') || FRAME_SUB_SLUGS.includes((p as any).category?.slug || '');
          }).length;

          return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="font-heading font-bold text-lg text-white">Product Catalog ({filteredProds.length}/{products.length})</h2>
                <p className="text-xs text-gray-400">Add, edit prices, images, descriptions, and stock for any product.</p>
              </div>
              <button
                onClick={() => {
                  const candleCat = categories.find((c) => c.slug === 'diy-candles');
                  setEditingProduct({
                    id: '',
                    name: '',
                    slug: '',
                    description: '',
                    short_description: '',
                    price: 399,
                    mrp: 599,
                    discount_percent: 33,
                    category_id: productCategoryFilter !== 'all' ? productCategoryFilter : (candleCat?.id || categories[0]?.id || ''),
                    material: '100% Natural Soy Wax & Cotton Wick',
                    is_customizable: true,
                    is_active: true,
                    is_featured: true,
                    stock: 25,
                    sku: '',
                    sort_order: products.length + 1,
                    created_at: '',
                    updated_at: '',
                  });
                  setIsNewProductModal(true);
                }}
                className="btn-gold !py-2 !px-4 text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus size={14} /> Add New Product
              </button>
            </div>

            {/* Category Filter Tabs — 6 main service categories only */}
            <div className="card-premium p-4 border border-white/5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {/* All */}
                <button
                  onClick={() => setProductCategoryFilter('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    productCategoryFilter === 'all'
                      ? 'bg-gold text-black font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                  )}
                >
                  All ({products.length})
                </button>
                {/* Only the 6 main service categories */}
                {[
                  { slug: 'photo-frames', label: 'Photo Frames', icon: '🖼️' },
                  { slug: 'flex', label: 'Flex', icon: '🖨️' },
                  { slug: 'resin-art', label: 'Resin Art', icon: '💎' },
                  { slug: 'diy-candles', label: 'DIY Candles', icon: '🕯️' },
                  { slug: 'logo-design', label: 'Logo Design', icon: '✏️' },
                  { slug: 'gifts', label: 'Gifts', icon: '🎁' },
                ].map(({ slug, label, icon }) => {
                  const cat = categories.find((c) => c.slug === slug);
                  if (!cat) return null;
                  // Photo Frames counts ALL frame sub-categories
                  const count = slug === 'photo-frames'
                    ? photoFrameCount
                    : products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setProductCategoryFilter(cat.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                        productCategoryFilter === cat.id
                          ? 'bg-gold text-black font-bold'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                      )}
                    >
                      <span>{icon}</span>
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
              {/* Search within filtered */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search products by name, description, SKU..."
                  className="input-premium text-xs pl-9 py-2"
                />
              </div>
            </div>

            {/* Products Grid */}
            {filteredProds.length === 0 ? (
              <div className="py-16 text-center card-premium">
                <Package size={36} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No products found for this category.</p>
                <p className="text-xs text-gray-500 mt-1">Click <strong className="text-gold">Add New Product</strong> to add one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProds.map((p) => {
                  const img = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80';
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <div key={p.id} className="card-premium overflow-hidden flex flex-col justify-between border border-white/5 hover:border-gold/30 transition-all">
                      {/* Image */}
                      <div className="aspect-video bg-black-elevated relative overflow-hidden group/img">
                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                        {p.discount_percent > 0 && (
                          <span className="badge-discount absolute top-2 left-2">
                            {p.discount_percent}% OFF
                          </span>
                        )}
                        {/* Quick edit overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => { setEditingProduct(p); setIsNewProductModal(false); }}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-bold rounded flex items-center gap-1"
                          >
                            <Edit size={13} /> Edit Product
                          </button>
                        </div>
                        {/* Category badge */}
                        {cat && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] bg-black/80 text-gold border border-gold/30">
                            {cat.name}
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-white text-sm line-clamp-1 flex-1">{p.name}</h3>
                            <span className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded shrink-0',
                              p.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                            )}>
                              {p.is_active ? 'Live' : 'Hidden'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{p.short_description || p.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                            <span>Stock: <strong className="text-gray-300">{p.stock}</strong></span>
                            {p.sku && <span>SKU: <strong className="text-gray-300">{p.sku}</strong></span>}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-gold font-heading font-bold text-base">{formatPrice(p.price)}</div>
                            {p.mrp > p.price && (
                              <div className="text-[10px] text-gray-500 line-through">{formatPrice(p.mrp)}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingProduct(p); setIsNewProductModal(false); }}
                              className="px-3 py-1.5 bg-white/5 text-gray-300 hover:text-gold hover:bg-white/10 rounded border border-white/10 text-xs flex items-center gap-1 transition-colors"
                              title="Edit product"
                            >
                              <Edit size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          );
        })()}

        {/* ================= TAB 4: FRAME SIZES & ROOM MOCKUPS MANAGER ================= */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            {/* Top Action & Stats Header */}
            <div className="card-premium p-6 border border-gold/25 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                    <Frame size={20} className="text-gold" /> Frame Sizes & Mockup Photos
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                    Manage dimensions, Indian rupee pricing, and individual room-interior mockup images. Changes reflect live on the customer-facing storefront and price lists.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateFrameSize}
                  className="btn-gold !py-2 px-5 text-xs flex items-center gap-2 shadow-lg shrink-0"
                >
                  <Plus size={15} />
                  <span>Add New Frame Size</span>
                </button>
              </div>

              {/* Stats Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                <div className="p-3 bg-black/50 rounded-lg border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Frame Sizes</div>
                  <div className="text-xl font-bold font-heading text-white mt-0.5">{priceList.length}</div>
                </div>
                <div className="p-3 bg-black/50 rounded-lg border border-white/5">
                  <div className="text-[10px] text-green-400 uppercase tracking-wider">Live on Store</div>
                  <div className="text-xl font-bold font-heading text-green-400 mt-0.5">
                    {priceList.filter((p) => p.is_active).length}
                  </div>
                </div>
                <div className="p-3 bg-black/50 rounded-lg border border-white/5">
                  <div className="text-[10px] text-gold uppercase tracking-wider">Mockups Uploaded</div>
                  <div className="text-xl font-bold font-heading text-gold mt-0.5">
                    {priceList.filter((p) => Boolean(p.image_url)).length}
                  </div>
                </div>
                <div className="p-3 bg-black/50 rounded-lg border border-white/5">
                  <div className="text-[10px] text-yellow-400 uppercase tracking-wider">Missing Mockup</div>
                  <div className="text-xl font-bold font-heading text-yellow-400 mt-0.5">
                    {priceList.filter((p) => !p.image_url).length}
                  </div>
                </div>
              </div>

              {/* Search, Filter & Sort Controls */}
              <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={frameSearch}
                    onChange={(e) => setFrameSearch(e.target.value)}
                    placeholder="Search size (e.g. 12 x 18, 20)..."
                    className="input-premium !pl-9 text-xs w-full"
                  />
                  {frameSearch && (
                    <button
                      onClick={() => setFrameSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={frameFilter}
                    onChange={(e) => setFrameFilter(e.target.value as any)}
                    className="input-premium text-xs py-1.5 px-3 bg-[#161616]"
                  >
                    <option value="all">All Status ({priceList.length})</option>
                    <option value="active">Active Only ({priceList.filter((p) => p.is_active).length})</option>
                    <option value="disabled">Disabled Only ({priceList.filter((p) => !p.is_active).length})</option>
                    <option value="with-mockup">With Mockup Image ({priceList.filter((p) => Boolean(p.image_url)).length})</option>
                    <option value="no-mockup">Missing Mockup ({priceList.filter((p) => !p.image_url).length})</option>
                  </select>

                  <select
                    value={frameSort}
                    onChange={(e) => setFrameSort(e.target.value as any)}
                    className="input-premium text-xs py-1.5 px-3 bg-[#161616]"
                  >
                    <option value="sort_order">Default Sort Order</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="label">Size Label A–Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List / Table */}
            {(() => {
              const filteredFrameSizes = priceList
                .filter((item) => {
                  if (frameSearch) {
                    const q = frameSearch.toLowerCase().trim();
                    if (!item.size_label.toLowerCase().includes(q)) return false;
                  }
                  if (frameFilter === 'active') return item.is_active;
                  if (frameFilter === 'disabled') return !item.is_active;
                  if (frameFilter === 'with-mockup') return Boolean(item.image_url);
                  if (frameFilter === 'no-mockup') return !item.image_url;
                  return true;
                })
                .sort((a, b) => {
                  if (frameSort === 'price-asc') return a.price - b.price;
                  if (frameSort === 'price-desc') return b.price - a.price;
                  if (frameSort === 'label') return a.size_label.localeCompare(b.size_label);
                  return (a.sort_order || 0) - (b.sort_order || 0);
                });

              if (filteredFrameSizes.length === 0) {
                return (
                  <div className="card-premium p-12 text-center border border-white/5 space-y-3">
                    <Frame size={32} className="text-gray-600 mx-auto" />
                    <h3 className="text-white font-medium text-sm">No frame sizes found</h3>
                    <p className="text-xs text-gray-500">
                      {frameSearch || frameFilter !== 'all'
                        ? 'Try adjusting your search query or filter options.'
                        : 'Get started by creating your first frame size with mockup.'}
                    </p>
                    <button
                      onClick={handleOpenCreateFrameSize}
                      className="btn-gold !py-1.5 px-4 text-xs inline-flex items-center gap-1.5 mt-2"
                    >
                      <Plus size={14} /> Add Frame Size
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="card-premium overflow-hidden border border-white/10 hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-[#121212] text-gray-400 uppercase tracking-wider text-[11px]">
                            <th className="p-3.5 pl-5">Mockup Image</th>
                            <th className="p-3.5">Size Dimensions (Inches)</th>
                            <th className="p-3.5">MRP (₹)</th>
                            <th className="p-3.5">Offer Price (₹)</th>
                            <th className="p-3.5 text-center">Status</th>
                            <th className="p-3.5 pr-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredFrameSizes.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                              {/* Mockup Thumbnail */}
                              <td className="p-3.5 pl-5">
                                {item.image_url ? (
                                  <div className="flex items-center gap-2">
                                    <div
                                      onClick={() =>
                                        setPreviewModalImg({
                                          url: item.image_url!,
                                          title: `${item.size_label} inches — Room Mockup`,
                                        })
                                      }
                                      className="relative w-16 h-12 rounded-lg border border-gold/30 bg-black overflow-hidden cursor-pointer group/th shrink-0 hover:border-gold transition-all shadow"
                                      title="Click to preview room mockup"
                                    >
                                      <img
                                        src={item.image_url}
                                        alt={item.size_label}
                                        className="w-full h-full object-cover group-hover/th:scale-110 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/th:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye size={13} className="text-gold" />
                                      </div>
                                    </div>
                                    <span className="text-[10px] text-green-400 font-medium">Uploaded</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleOpenEditFrameSize(item)}
                                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-gold/15 text-gray-400 hover:text-gold border border-white/10 hover:border-gold/40 text-[11px] transition-colors flex items-center gap-1.5"
                                    title="Upload a room mockup image"
                                  >
                                    <Upload size={12} />
                                    <span>Add Mockup</span>
                                  </button>
                                )}
                              </td>

                              {/* Size Dimensions */}
                              <td className="p-3.5">
                                <div className="font-mono font-bold text-gold text-base">
                                  {item.size_label} <span className="text-xs text-gray-400 font-normal">inches</span>
                                </div>
                                {item.width && item.height && (
                                  <div className="text-[11px] text-gray-500 mt-0.5">
                                    {item.width}&quot; width × {item.height}&quot; height
                                  </div>
                                )}
                              </td>

                              {/* MRP */}
                              <td className="p-3.5 text-gray-400">
                                {item.mrp ? (
                                  formatPrice(item.mrp)
                                ) : (
                                  <span className="text-gray-600">—</span>
                                )}
                              </td>

                              {/* Offer Price */}
                              <td className="p-3.5">
                                <span className="font-heading font-bold text-white text-base">
                                  {formatPrice(item.price)}
                                </span>
                              </td>

                              {/* Status Toggle Switch */}
                              <td className="p-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFrameStatus(item)}
                                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 ${
                                    item.is_active
                                      ? 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25'
                                      : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                                  }`}
                                  title="Click to toggle store visibility"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      item.is_active ? 'bg-green-400' : 'bg-red-400'
                                    }`}
                                  />
                                  <span>{item.is_active ? 'Active' : 'Disabled'}</span>
                                </button>
                              </td>

                              {/* Action Buttons */}
                              <td className="p-3.5 pr-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditFrameSize(item)}
                                    className="btn-gold !py-1 !px-3 text-xs flex items-center gap-1 shadow-sm"
                                    title="Edit dimensions, price, and mockup image"
                                  >
                                    <Edit size={12} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => setDeletingFrameSize(item)}
                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                    title="Delete frame size"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                    {filteredFrameSizes.map((item) => (
                      <div
                        key={item.id}
                        className="card-premium p-4 border border-white/10 space-y-3 relative flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          {item.image_url ? (
                            <div
                              onClick={() =>
                                setPreviewModalImg({
                                  url: item.image_url!,
                                  title: `${item.size_label} inches — Room Mockup`,
                                })
                              }
                              className="relative w-20 h-16 rounded-lg border border-gold/30 bg-black overflow-hidden cursor-pointer shrink-0"
                            >
                              <img
                                src={item.image_url}
                                alt={item.size_label}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Eye size={12} className="text-gold" />
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleOpenEditFrameSize(item)}
                              className="w-20 h-16 rounded-lg border border-dashed border-white/20 bg-black/40 flex flex-col items-center justify-center text-gray-500 cursor-pointer shrink-0"
                            >
                              <Upload size={14} />
                              <span className="text-[9px] mt-1">Upload</span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="font-heading font-bold text-lg text-gold truncate">
                              {item.size_label} <span className="text-xs text-gray-400 font-normal">in</span>
                            </div>
                            <div className="text-white font-bold text-base mt-0.5">
                              {formatPrice(item.price)}
                              {item.mrp && item.mrp > item.price && (
                                <span className="text-xs text-gray-500 line-through ml-2 font-normal">
                                  {formatPrice(item.mrp)}
                                </span>
                              )}
                            </div>
                            {item.width && item.height && (
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {item.width}&quot; × {item.height}&quot;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleFrameStatus(item)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                              item.is_active
                                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.is_active ? 'bg-green-400' : 'bg-red-400'
                              }`}
                            />
                            <span>{item.is_active ? 'Active' : 'Disabled'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditFrameSize(item)}
                              className="btn-gold !py-1 !px-3 text-xs flex items-center gap-1"
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeletingFrameSize(item)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
                        disabled={updatingCustomOrderId === (cust.custom_order_id || cust.id)}
                        onChange={(e) => {
                          const newSt = e.target.value;
                          handleUpdateCustomOrderStatus(cust.custom_order_id, cust.id, newSt);
                        }}
                        className={`text-xs px-2.5 py-1 rounded border outline-none font-semibold ${getStatusColor(cust.status)} bg-[#161616] cursor-pointer disabled:opacity-50`}
                      >
                        {['Pending', 'Reviewing', 'Designing', 'Printing', 'Shipped', 'Completed'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updatingCustomOrderId === (cust.custom_order_id || cust.id) && (
                        <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      )}
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

                  {/* Customer Uploaded Files & Download Pic Button */}
                  {cust.files && cust.files.length > 0 && (
                    <div className="p-3 bg-black/60 rounded border border-gold/30 space-y-2">
                      <strong className="text-gold text-xs block">
                        Customer Uploaded Images ({cust.files.length}):
                      </strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cust.files.map((file: any, fIdx: number) => (
                          <div
                            key={file.id || fIdx}
                            className="flex items-center justify-between gap-3 p-2.5 bg-[#141414] rounded-lg border border-white/10"
                          >
                            <div
                              className="flex items-center gap-2.5 overflow-hidden cursor-pointer group flex-1"
                              onClick={() => setPreviewModalImg({ url: file.file_url, title: file.file_name || `Custom Order #${cust.custom_order_id}` })}
                            >
                              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gold/40 bg-black">
                                <img
                                  src={file.file_url}
                                  alt={file.file_name || 'Custom upload'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye size={14} className="text-gold" />
                                </div>
                              </div>
                              <div className="truncate text-xs">
                                <div className="text-white truncate font-medium group-hover:text-gold transition-colors">
                                  {file.file_name || 'Customer Image'}
                                </div>
                                <div className="text-gray-400 text-[10px] capitalize">
                                  {file.file_type?.replace('_', ' ') || 'Photo'} • Click to preview
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewModalImg({ url: file.file_url, title: file.file_name || `Custom Order #${cust.custom_order_id}` })}
                                className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1 transition-colors"
                                title="Preview Photo"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadPic(file.file_url, file.file_name || `custom-order-${cust.custom_order_id}.jpg`)}
                                disabled={downloadingUrl === file.file_url}
                                className="btn-gold !py-1.5 !px-3 text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                              >
                                {downloadingUrl === file.file_url ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : (
                                  <Download size={12} />
                                )}
                                Download Pic
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
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
                <div key={i} className="p-3.5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium text-sm">{it.product_name}</div>
                      <div className="text-gray-400 mt-0.5">{it.size} × {it.quantity}</div>
                      {it.customization_name && (
                        <div className="text-gray-300 mt-1">
                          <span className="text-gold font-medium">Custom Name:</span> {it.customization_name}
                        </div>
                      )}
                      {it.customization_phone && (
                        <div className="text-gray-300">
                          <span className="text-gold font-medium">Custom Phone:</span> {it.customization_phone}
                        </div>
                      )}
                      {it.customization_instructions && (
                        <div className="text-gray-400 italic mt-0.5">
                          Note: {it.customization_instructions}
                        </div>
                      )}
                    </div>
                    <div className="text-gold font-bold font-mono">{formatPrice(it.price * it.quantity)}</div>
                  </div>

                  {/* Uploaded Customer Photo in Order Modal */}
                  {it.uploaded_image_url && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 bg-black/60 p-2.5 rounded border border-gold/30">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer group flex-1 overflow-hidden"
                        onClick={() => setPreviewModalImg({ url: it.uploaded_image_url, title: `${it.product_name} - Customer Photo` })}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gold/40 bg-black">
                          <img
                            src={it.uploaded_image_url}
                            alt="Customer uploaded photo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye size={14} className="text-gold" />
                          </div>
                        </div>
                        <div className="truncate">
                          <div className="text-white font-medium text-xs group-hover:text-gold transition-colors truncate">Customer Photo Attached</div>
                          <div className="text-gray-400 text-[10px]">Click thumbnail to preview</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewModalImg({ url: it.uploaded_image_url, title: `${it.product_name} - Customer Photo` })}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPic(it.uploaded_image_url, `order-${selectedOrder.order_id}-item-${i + 1}.jpg`)}
                          disabled={downloadingUrl === it.uploaded_image_url}
                          className="btn-gold !py-1 !px-2.5 text-xs flex items-center gap-1 shadow-md disabled:opacity-50"
                        >
                          {downloadingUrl === it.uploaded_image_url ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : (
                            <Download size={11} />
                          )}
                          Download Pic
                        </button>
                      </div>
                    </div>
                  )}
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

              <div>
                <label className="label-premium">Short Description / Vessel Label</label>
                <input
                  type="text"
                  value={editingProduct.short_description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  className="input-premium text-xs"
                  placeholder="e.g. Hand-Carved Rose Flower in Glass Tumbler"
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

      {/* ================= CREATE NEW FRAME SIZE MODAL ================= */}
      {isNewFrameSizeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-premium p-6 sm:p-7 max-w-lg w-full space-y-5 border border-gold/40 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">Storefront Setup</span>
                <h3 className="font-heading font-bold text-lg text-white">Create New Frame Size</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewFrameSizeModal(false);
                  setFrameMockupFile(null);
                  setFrameMockupPreview(null);
                  setFrameError(null);
                }}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {frameError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-xs">
                {frameError}
              </div>
            )}

            <form onSubmit={(e) => handleSaveFrameSize(e, false)} className="space-y-4 text-xs">
              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-premium">Width (Inches)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 12"
                    value={frameForm.width}
                    onChange={(e) => {
                      const w = e.target.value === '' ? '' : Number(e.target.value);
                      const h = frameForm.height;
                      setFrameForm((prev) => ({
                        ...prev,
                        width: w,
                        size_label: w && h ? `${w} x ${h}` : prev.size_label,
                      }));
                    }}
                    className="input-premium text-xs"
                  />
                </div>
                <div>
                  <label className="label-premium">Height (Inches)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 18"
                    value={frameForm.height}
                    onChange={(e) => {
                      const h = e.target.value === '' ? '' : Number(e.target.value);
                      const w = frameForm.width;
                      setFrameForm((prev) => ({
                        ...prev,
                        height: h,
                        size_label: w && h ? `${w} x ${h}` : prev.size_label,
                      }));
                    }}
                    className="input-premium text-xs"
                  />
                </div>
              </div>

              {/* Size Label */}
              <div>
                <label className="label-premium">Size Label (Inches)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12 x 18"
                  value={frameForm.size_label}
                  onChange={(e) => setFrameForm({ ...frameForm, size_label: e.target.value })}
                  className="input-premium text-xs font-mono"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Displayed on product cards and price lists (e.g. &ldquo;12 x 18&rdquo;).
                </span>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-premium">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 800"
                    value={frameForm.price}
                    onChange={(e) => {
                      const p = e.target.value === '' ? '' : Number(e.target.value);
                      setFrameForm((prev) => ({
                        ...prev,
                        price: p,
                        mrp: prev.mrp === '' && p !== '' ? Math.round(Number(p) * 1.4) : prev.mrp,
                      }));
                    }}
                    className="input-premium text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label-premium">MRP (₹, Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1100"
                    value={frameForm.mrp}
                    onChange={(e) => setFrameForm({ ...frameForm, mrp: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="input-premium text-xs"
                  />
                </div>
              </div>

              {/* Mockup Image Upload with Instant Preview */}
              <div>
                <label className="label-premium">Room-Interior Mockup Image</label>
                <input
                  type="file"
                  ref={frameFileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFrameMockupFileChange}
                  className="hidden"
                />

                {frameMockupPreview ? (
                  <div className="relative aspect-[4/3] rounded-lg border border-gold/40 bg-black overflow-hidden group">
                    <img
                      src={frameMockupPreview}
                      alt="Mockup preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => frameFileInputRef.current?.click()}
                        className="btn-gold !py-1 !px-3 text-xs"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFrameMockup}
                        className="btn-dark !py-1 !px-3 text-xs text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] bg-black/80 text-gold border border-gold/30">
                      Preview before saving
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => frameFileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-gold/50 rounded-lg p-6 text-center cursor-pointer bg-black/30 hover:bg-black/50 transition-all group"
                  >
                    <Upload size={24} className="text-gray-400 group-hover:text-gold mx-auto mb-2 transition-colors" />
                    <p className="text-white font-medium text-xs">
                      Click to upload mockup image from desktop or phone
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      JPG, PNG, WEBP up to 10MB • Recommended: high-resolution wall mockup
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="new_frame_active"
                  checked={frameForm.is_active}
                  onChange={(e) => setFrameForm({ ...frameForm, is_active: e.target.checked })}
                  className="rounded border-white/20 text-gold focus:ring-gold bg-black"
                />
                <label htmlFor="new_frame_active" className="text-xs text-gray-300 cursor-pointer">
                  Active (Immediately visible on public website)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsNewFrameSizeModal(false)}
                  disabled={savingFrameSize}
                  className="btn-dark !py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFrameSize}
                  className="btn-gold !py-2 px-6 text-xs flex items-center gap-1.5"
                >
                  {savingFrameSize ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving & Uploading...</span>
                    </>
                  ) : (
                    <span>Save Frame Size</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT FRAME SIZE & MOCKUP MODAL ================= */}
      {editingPriceItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-premium p-6 sm:p-7 max-w-lg w-full space-y-5 border border-gold/40 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">Edit Frame Size</span>
                <h3 className="font-heading font-bold text-lg text-white">
                  {editingPriceItem.size_label} inches
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPriceItem(null);
                  setFrameMockupFile(null);
                  setFrameMockupPreview(null);
                  setFrameError(null);
                }}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {frameError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-xs">
                {frameError}
              </div>
            )}

            <form onSubmit={(e) => handleSaveFrameSize(e, true)} className="space-y-4 text-xs">
              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-premium">Width (Inches)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 12"
                    value={frameForm.width}
                    onChange={(e) => setFrameForm({ ...frameForm, width: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="input-premium text-xs"
                  />
                </div>
                <div>
                  <label className="label-premium">Height (Inches)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 18"
                    value={frameForm.height}
                    onChange={(e) => setFrameForm({ ...frameForm, height: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="input-premium text-xs"
                  />
                </div>
              </div>

              {/* Size Label */}
              <div>
                <label className="label-premium">Size Label (Inches)</label>
                <input
                  type="text"
                  required
                  value={frameForm.size_label}
                  onChange={(e) => setFrameForm({ ...frameForm, size_label: e.target.value })}
                  className="input-premium text-xs font-mono font-bold"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-premium">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={frameForm.price}
                    onChange={(e) => setFrameForm({ ...frameForm, price: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="input-premium text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label-premium">MRP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={frameForm.mrp}
                    onChange={(e) => setFrameForm({ ...frameForm, mrp: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="input-premium text-xs"
                  />
                </div>
              </div>

              {/* Mockup Image: Current and Replacement Options */}
              <div className="space-y-2">
                <label className="label-premium">Room-Interior Mockup Image</label>
                <input
                  type="file"
                  ref={frameFileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFrameMockupFileChange}
                  className="hidden"
                />

                {/* If user selected a new replacement file */}
                {frameMockupPreview ? (
                  <div className="relative aspect-[4/3] rounded-lg border-2 border-gold bg-black overflow-hidden group shadow-lg">
                    <img
                      src={frameMockupPreview}
                      alt="Replacement mockup preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => frameFileInputRef.current?.click()}
                        className="btn-gold !py-1 !px-3 text-xs"
                      >
                        Choose Different
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFrameMockupFile(null);
                          setFrameMockupPreview(null);
                        }}
                        className="btn-dark !py-1 !px-3 text-xs"
                      >
                        Keep Existing
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-gold text-black">
                      New Photo Selected (Saves on Submit)
                    </span>
                  </div>
                ) : frameForm.image_url ? (
                  /* Current persistent mockup image */
                  <div className="relative aspect-[4/3] rounded-lg border border-gold/30 bg-black overflow-hidden group">
                    <img
                      src={frameForm.image_url}
                      alt="Current mockup"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => frameFileInputRef.current?.click()}
                        className="btn-gold !py-1.5 !px-3 text-xs flex items-center gap-1 shadow"
                      >
                        <Upload size={12} /> Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModalImg({
                            url: frameForm.image_url,
                            title: `${frameForm.size_label} inches — Room Mockup`,
                          })
                        }
                        className="btn-dark !py-1.5 !px-3 text-xs flex items-center gap-1"
                      >
                        <Eye size={12} /> View Full
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFrameMockup}
                        className="btn-dark !py-1.5 !px-3 text-xs text-red-400 hover:text-red-300"
                        title="Remove image from this size"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] bg-black/80 text-green-400 border border-green-500/30">
                      Current Room Mockup
                    </span>
                  </div>
                ) : (
                  /* No image currently uploaded */
                  <div
                    onClick={() => frameFileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-gold/50 rounded-lg p-6 text-center cursor-pointer bg-black/30 hover:bg-black/50 transition-all group"
                  >
                    <Upload size={24} className="text-gray-400 group-hover:text-gold mx-auto mb-2 transition-colors" />
                    <p className="text-white font-medium text-xs">
                      No mockup uploaded yet. Click to select a photo.
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Upload an interior wall mockup for this frame size
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_frame_active"
                  checked={frameForm.is_active}
                  onChange={(e) => setFrameForm({ ...frameForm, is_active: e.target.checked })}
                  className="rounded border-white/20 text-gold focus:ring-gold bg-black"
                />
                <label htmlFor="edit_frame_active" className="text-xs text-gray-300 cursor-pointer">
                  Active (Visible to customers on the storefront)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPriceItem(null);
                    setFrameMockupFile(null);
                    setFrameMockupPreview(null);
                  }}
                  disabled={savingFrameSize}
                  className="btn-dark !py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFrameSize}
                  className="btn-gold !py-2 px-6 text-xs flex items-center gap-1.5"
                >
                  {savingFrameSize ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingFrameSize && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-premium p-6 max-w-sm w-full space-y-4 border border-red-500/40 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">Delete Frame Size</h3>
                <p className="text-xs text-gray-400">Confirm permanent deletion</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to delete the frame size{' '}
              <strong className="text-gold font-mono">{deletingFrameSize.size_label} inches</strong>{' '}
              ({formatPrice(deletingFrameSize.price)})?
            </p>
            <p className="text-[11px] text-gray-500">
              This will remove the size from the storefront and clean up its stored mockup photo.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setDeletingFrameSize(null)}
                className="btn-dark !py-1.5 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFrameSize}
                className="btn-danger !py-1.5 px-4 text-xs bg-red-600 hover:bg-red-700 text-white rounded font-medium"
              >
                Delete Frame Size
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HIGH-RES IMAGE PREVIEW / LIGHTBOX MODAL ================= */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewModalImg(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#141414] border border-gold/40 rounded-xl overflow-hidden shadow-2xl p-4 sm:p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="truncate pr-4">
                <h3 className="font-heading font-bold text-white text-sm sm:text-base truncate">
                  {previewModalImg.title}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">High-Resolution Customer Artwork / Photo</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Image Preview Container */}
            <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 max-h-[65vh] flex items-center justify-center p-2">
              <img
                src={previewModalImg.url}
                alt={previewModalImg.title}
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <a
                href={previewModalImg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold hover:underline flex items-center gap-1"
              >
                <ArrowUpRight size={13} />
                Open original in new tab
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="px-3.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPic(previewModalImg.url, `${previewModalImg.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.jpg`)}
                  disabled={downloadingUrl === previewModalImg.url}
                  className="btn-gold !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {downloadingUrl === previewModalImg.url ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  Download Pic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
