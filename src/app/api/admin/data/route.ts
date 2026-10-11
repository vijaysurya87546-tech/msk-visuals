import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get('msk_admin_session')?.value;
  return Boolean(cookie && cookie.startsWith('msk_') && cookie.length > 20);
}

// GET all dashboard data with admin privileges
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = await createAdminClient();

    const [prodRes, catRes, priceRes, ordRes, custOrdRes, revRes, msgRes] = await Promise.all([
      supabaseAdmin.from('products').select('*, images:product_images(*), sizes:product_sizes(*)').order('sort_order'),
      supabaseAdmin.from('categories').select('*').order('sort_order'),
      supabaseAdmin.from('price_list').select('*').order('sort_order'),
      supabaseAdmin.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false }),
      supabaseAdmin.from('custom_orders').select('*, files:custom_order_files(*)').order('created_at', { ascending: false }),
      supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: prodRes.data || [],
        categories: catRes.data || [],
        priceList: priceRes.data || [],
        orders: ordRes.data || [],
        customOrders: custOrdRes.data || [],
        reviews: revRes.data || [],
        messages: msgRes.data || [],
      },
    });
  } catch (err: any) {
    console.error('Error fetching admin dashboard data:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH for various admin actions
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;
    const supabaseAdmin = await createAdminClient();

    if (action === 'update_order_status') {
      const { order_id, status } = params;
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('order_id', order_id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'update_price_item') {
      const { id, price, mrp, is_active } = params;
      const { data, error } = await supabaseAdmin
        .from('price_list')
        .update({ price, mrp, is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'toggle_review') {
      const { id, is_approved } = params;
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({ is_approved, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
