-- =============================================
-- MSK VISUALS - Complete Database Schema
-- Supabase PostgreSQL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CATEGORIES
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. PRODUCTS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  mrp DECIMAL(10,2) DEFAULT 0,
  discount_percent INT DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  material TEXT,
  is_customizable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock INT DEFAULT 0,
  sku TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. PRODUCT IMAGES
-- =============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. PRODUCT SIZES
-- =============================================
CREATE TABLE product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  mrp DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. PROFILES (Supabase Auth users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. ADDRESSES
-- =============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  district TEXT,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. ORDERS
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  district TEXT,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  pincode TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_method TEXT DEFAULT 'Cash on Delivery',
  notes TEXT,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. ORDER ITEMS
-- =============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  customization_name TEXT,
  customization_phone TEXT,
  customization_instructions TEXT,
  uploaded_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. CUSTOM ORDERS
-- =============================================
CREATE TABLE custom_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_type TEXT NOT NULL,
  frame_size TEXT,
  quantity INT DEFAULT 1,
  customization_details TEXT,
  delivery_address TEXT,
  status TEXT DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. CUSTOM ORDER FILES
-- =============================================
CREATE TABLE custom_order_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_order_id UUID NOT NULL REFERENCES custom_orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. PRICE LIST
-- =============================================
CREATE TABLE price_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  size_label TEXT NOT NULL,
  width INT,
  height INT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  mrp DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 12. ORDER STATUS HISTORY
-- =============================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. REVIEWS
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  image_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 14. ADMIN USERS
-- =============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. SITE SETTINGS
-- =============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'text',
  label TEXT,
  group_name TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 16. CONTACT MESSAGES
-- =============================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_custom_orders_id ON custom_orders(custom_order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_price_list_active ON price_list(is_active);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_custom_orders_updated BEFORE UPDATE ON custom_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_price_list_updated BEFORE UPDATE ON price_list FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (products, categories, price list, approved reviews)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_sizes" ON product_sizes FOR SELECT USING (is_active = true);
CREATE POLICY "Public read price_list" ON price_list FOR SELECT USING (is_active = true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- PROFILE policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ADDRESS policies
CREATE POLICY "Users read own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- ORDER policies
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items read with order" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.is_guest = true))
);
CREATE POLICY "Anyone insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- CUSTOM ORDER policies
CREATE POLICY "Users read own custom orders" ON custom_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone insert custom orders" ON custom_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone insert custom order files" ON custom_order_files FOR INSERT WITH CHECK (true);

-- ORDER STATUS HISTORY
CREATE POLICY "Users read own order status" ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
);

-- REVIEW policies
CREATE POLICY "Users insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- CONTACT MESSAGES
CREATE POLICY "Anyone insert messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- ADMIN policies (using service role for admin operations, these are fallback)
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins manage price_list" ON price_list FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read all reviews" ON reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins update reviews" ON reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read admin_users" ON admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage site_settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read messages" ON contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins update messages" ON contact_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read custom orders" ON custom_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins update custom orders" ON custom_orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read custom order files" ON custom_order_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins read order status history" ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins insert order status history" ON order_status_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins manage product images" ON product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
CREATE POLICY "Admins manage product sizes" ON product_sizes FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);

-- =============================================
-- SEED DATA: Default Categories
-- =============================================
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Photo Frames', 'photo-frames', 'Premium quality photo frames crafted with care', 'Frame', 1),
  ('Single Frames', 'single-frames', 'Beautiful single photo frames', 'Image', 2),
  ('Multi-photo Frames', 'multi-photo-frames', 'Display multiple memories together', 'LayoutGrid', 3),
  ('Customized Frames', 'customized-frames', 'Create your own unique frame', 'Palette', 4),
  ('Religious Frames', 'religious-frames', 'Spiritual and religious frames', 'Sparkles', 5),
  ('Wedding Frames', 'wedding-frames', 'Celebrate love with elegant frames', 'Heart', 6),
  ('Birthday Frames', 'birthday-frames', 'Perfect birthday gift frames', 'Gift', 7),
  ('Memorial Frames', 'memorial-frames', 'Honor cherished memories', 'Star', 8),
  ('Couple Frames', 'couple-frames', 'Romantic couple photo frames', 'HeartHandshake', 9),
  ('Family Frames', 'family-frames', 'Family portrait frames', 'Users', 10),
  ('Corporate Frames', 'corporate-frames', 'Professional corporate frames', 'Building', 11),
  ('Resin Art', 'resin-art', 'Customized resin art creations', 'Gem', 12),
  ('DIY Candles', 'diy-candles', 'Handmade DIY candles with perfection', 'Flame', 13),
  ('Printing', 'printing', 'High quality printing services', 'Printer', 14),
  ('Logo Design', 'logo-design', 'Creative logo design solutions', 'PenTool', 15);

-- =============================================
-- SEED DATA: Price List
-- =============================================
INSERT INTO price_list (size_label, width, height, price, mrp, sort_order) VALUES
  ('4 x 4', 4, 4, 100, 150, 1),
  ('6 x 4', 6, 4, 150, 200, 2),
  ('5 x 7', 5, 7, 200, 300, 3),
  ('6 x 8', 6, 8, 300, 400, 4),
  ('10 x 8', 10, 8, 400, 550, 5),
  ('12 x 8', 12, 8, 500, 650, 6),
  ('12 x 10', 12, 10, 600, 800, 7),
  ('12 x 15', 12, 15, 700, 950, 8),
  ('12 x 18', 12, 18, 800, 1100, 9),
  ('12 x 20', 12, 20, 900, 1200, 10),
  ('20 x 16', 20, 16, 1300, 1700, 11),
  ('24 x 20', 24, 20, 1500, 2000, 12),
  ('30 x 20', 30, 20, 2000, 2600, 13),
  ('24 x 36', 24, 36, 2500, 3200, 14),
  ('30 x 40', 30, 40, 4500, 5500, 15);

-- =============================================
-- SEED DATA: Site Settings
-- =============================================
INSERT INTO site_settings (key, value, type, label, group_name) VALUES
  ('business_name', 'MSK VISUALS', 'text', 'Business Name', 'general'),
  ('tagline', 'WE DESIGN. YOU IMPRESS.', 'text', 'Tagline', 'general'),
  ('email', 'meganathan2174@gmail.com', 'text', 'Email', 'contact'),
  ('mobile', '+91 93612 53338', 'text', 'Mobile', 'contact'),
  ('whatsapp', '+91 93612 53338', 'text', 'WhatsApp', 'contact'),
  ('whatsapp_number', '919361253338', 'text', 'WhatsApp Number (for URL)', 'contact'),
  ('instagram', '@msk.vsls', 'text', 'Instagram', 'social'),
  ('instagram_url', 'https://instagram.com/msk.vsls', 'text', 'Instagram URL', 'social'),
  ('address', 'Madurai, Tamil Nadu, India', 'text', 'Address', 'contact'),
  ('delivery_charge', '50', 'number', 'Delivery Charge (₹)', 'delivery'),
  ('free_delivery_above', '500', 'number', 'Free Delivery Above (₹)', 'delivery'),
  ('tax_percent', '0', 'number', 'Tax Percentage', 'tax'),
  ('min_order_amount', '100', 'number', 'Minimum Order Amount (₹)', 'orders'),
  ('cod_available', 'true', 'boolean', 'Cash on Delivery Available', 'payment');

-- =============================================
-- SEED DATA: Sample Products
-- =============================================
INSERT INTO products (name, slug, description, short_description, price, mrp, discount_percent, category_id, material, is_customizable, is_featured, stock) VALUES
  ('Classic Single Photo Frame', 'classic-single-photo-frame', 'A beautifully crafted classic photo frame perfect for preserving your cherished memories. Made with premium quality materials and finished with elegant detailing.', 'Premium quality classic photo frame', 200, 300, 33, (SELECT id FROM categories WHERE slug = 'single-frames'), 'Wood + Glass', true, true, 50),
  ('Premium Multi-Photo Collage Frame', 'premium-multi-photo-collage-frame', 'Display your favorite memories together in this stunning multi-photo collage frame. Features multiple photo slots with elegant borders.', 'Elegant multi-photo collage frame', 800, 1200, 33, (SELECT id FROM categories WHERE slug = 'multi-photo-frames'), 'MDF + Acrylic', true, true, 30),
  ('Customized Name Photo Frame', 'customized-name-photo-frame', 'Personalize your frame with custom names and special dates. A perfect gift for birthdays, anniversaries, and special occasions.', 'Personalized name photo frame', 400, 600, 33, (SELECT id FROM categories WHERE slug = 'customized-frames'), 'Wood + Acrylic', true, true, 40),
  ('Lord Ganesha Religious Frame', 'lord-ganesha-religious-frame', 'A divine and beautifully designed Lord Ganesha frame with gold foil detailing. Perfect for your home temple or as a spiritual gift.', 'Divine Lord Ganesha frame', 500, 750, 33, (SELECT id FROM categories WHERE slug = 'religious-frames'), 'Wood + Gold Foil', false, true, 25),
  ('Royal Wedding Photo Frame', 'royal-wedding-photo-frame', 'Celebrate your special day with this royal wedding photo frame. Luxurious design with intricate patterns and premium finish.', 'Luxurious wedding photo frame', 700, 1000, 30, (SELECT id FROM categories WHERE slug = 'wedding-frames'), 'Wood + Velvet', true, true, 20),
  ('Birthday Special Frame', 'birthday-special-frame', 'Make birthdays extra special with this colorful and cheerful birthday photo frame. Includes customizable age and name options.', 'Cheerful birthday photo frame', 350, 500, 30, (SELECT id FROM categories WHERE slug = 'birthday-frames'), 'Acrylic', true, true, 35),
  ('Eternal Memory Frame', 'eternal-memory-frame', 'Honor and preserve the memory of loved ones with this elegant memorial frame. Designed with grace and dignity.', 'Elegant memorial photo frame', 450, 650, 31, (SELECT id FROM categories WHERE slug = 'memorial-frames'), 'Wood + Glass', true, false, 20),
  ('Love Couple Photo Frame', 'love-couple-photo-frame', 'Express your love with this beautiful couple photo frame. Features dual photo slots with heart detailing.', 'Romantic couple photo frame', 500, 700, 29, (SELECT id FROM categories WHERE slug = 'couple-frames'), 'Wood + Acrylic', true, true, 30),
  ('Family Portrait Frame', 'family-portrait-frame', 'Bring your family together in this large family portrait frame. Multiple sizes available to fit your perfect family photo.', 'Large family portrait frame', 900, 1300, 31, (SELECT id FROM categories WHERE slug = 'family-frames'), 'Wood + Glass', true, false, 15),
  ('Corporate Award Frame', 'corporate-award-frame', 'Professional corporate frame perfect for awards, certificates, and recognition plaques. Sleek and sophisticated design.', 'Professional corporate frame', 600, 850, 29, (SELECT id FROM categories WHERE slug = 'corporate-frames'), 'Metal + Glass', false, false, 20),
  ('Ocean Wave Resin Art', 'ocean-wave-resin-art', 'Stunning ocean wave resin art piece that brings the beauty of the sea into your home. Each piece is uniquely handcrafted.', 'Handcrafted ocean wave resin art', 1500, 2200, 32, (SELECT id FROM categories WHERE slug = 'resin-art'), 'Epoxy Resin', true, true, 10),
  ('Floral Resin Art Coaster Set', 'floral-resin-art-coaster-set', 'Beautiful set of 4 floral resin art coasters with real preserved flowers embedded in crystal-clear resin.', 'Floral resin coaster set (4 pcs)', 800, 1100, 27, (SELECT id FROM categories WHERE slug = 'resin-art'), 'Epoxy Resin + Natural Flowers', false, true, 15),
  ('Lavender Dream DIY Candle', 'lavender-dream-diy-candle', 'Handmade lavender scented candle crafted with 100% natural soy wax. Fills your space with calming lavender fragrance.', 'Handmade lavender soy candle', 350, 500, 30, (SELECT id FROM categories WHERE slug = 'diy-candles'), 'Soy Wax', false, true, 40),
  ('Rose Gold Decorative Candle Set', 'rose-gold-decorative-candle-set', 'Elegant rose gold decorative candle set perfect for home decor and gifting. Set of 3 candles with varying heights.', 'Rose gold candle set (3 pcs)', 600, 850, 29, (SELECT id FROM categories WHERE slug = 'diy-candles'), 'Paraffin Wax + Rose Gold Coating', false, true, 25),
  ('Premium Photo Print', 'premium-photo-print', 'High-quality photo printing on premium glossy paper. Vibrant colors and sharp details that bring your photos to life.', 'High-quality premium photo print', 100, 150, 33, (SELECT id FROM categories WHERE slug = 'printing'), 'Glossy Photo Paper', false, false, 100),
  ('Canvas Photo Print', 'canvas-photo-print', 'Gallery-quality canvas photo printing with vivid colors and museum-grade canvas material. Ready to hang.', 'Gallery-quality canvas print', 1200, 1800, 33, (SELECT id FROM categories WHERE slug = 'printing'), 'Canvas', true, true, 20),
  ('Professional Logo Design', 'professional-logo-design', 'Get a professional, unique logo designed for your business. Includes multiple concepts, revisions, and final files in all formats.', 'Professional custom logo design', 2500, 4000, 38, (SELECT id FROM categories WHERE slug = 'logo-design'), 'Digital', true, true, 99),
  ('Brand Identity Package', 'brand-identity-package', 'Complete brand identity package including logo, business card, letterhead, and social media kit. Everything your brand needs.', 'Complete brand identity package', 5000, 7500, 33, (SELECT id FROM categories WHERE slug = 'logo-design'), 'Digital', true, false, 99);

-- =============================================
-- SEED DATA: Product Sizes for sample products
-- =============================================
INSERT INTO product_sizes (product_id, size_label, price, mrp, stock) 
SELECT id, '4 x 4', 100, 150, 50 FROM products WHERE slug = 'classic-single-photo-frame'
UNION ALL
SELECT id, '6 x 4', 150, 200, 50 FROM products WHERE slug = 'classic-single-photo-frame'
UNION ALL
SELECT id, '5 x 7', 200, 300, 50 FROM products WHERE slug = 'classic-single-photo-frame'
UNION ALL
SELECT id, '6 x 8', 300, 400, 40 FROM products WHERE slug = 'classic-single-photo-frame'
UNION ALL
SELECT id, '10 x 8', 400, 550, 30 FROM products WHERE slug = 'classic-single-photo-frame'
UNION ALL
SELECT id, '12 x 8', 500, 650, 25 FROM products WHERE slug = 'classic-single-photo-frame';

INSERT INTO product_sizes (product_id, size_label, price, mrp, stock)
SELECT id, '12 x 10', 800, 1200, 30 FROM products WHERE slug = 'premium-multi-photo-collage-frame'
UNION ALL
SELECT id, '12 x 18', 1200, 1800, 20 FROM products WHERE slug = 'premium-multi-photo-collage-frame'
UNION ALL
SELECT id, '20 x 16', 1500, 2200, 15 FROM products WHERE slug = 'premium-multi-photo-collage-frame';

INSERT INTO product_sizes (product_id, size_label, price, mrp, stock)
SELECT id, '6 x 4', 400, 600, 40 FROM products WHERE slug = 'customized-name-photo-frame'
UNION ALL
SELECT id, '10 x 8', 600, 900, 30 FROM products WHERE slug = 'customized-name-photo-frame'
UNION ALL
SELECT id, '12 x 10', 800, 1200, 20 FROM products WHERE slug = 'customized-name-photo-frame';

-- =============================================
-- SUPABASE STORAGE BUCKETS & POLICIES
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('customer-uploads', 'customer-uploads', false),
  ('custom-order-files', 'custom-order-files', false),
  ('review-images', 'review-images', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage policies
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public read review images" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
CREATE POLICY "Public read site assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Anyone upload customer files" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('customer-uploads', 'custom-order-files'));
CREATE POLICY "Public upload review images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-images');

-- =============================================
-- PROFILE AUTO-CREATE TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
