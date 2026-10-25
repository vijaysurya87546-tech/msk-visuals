import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getFrameSizes, saveFrameSize } from '@/lib/priceListService';

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

    const [prodRes, catRes, frameSizes, ordRes, custOrdRes, revRes, msgRes] = await Promise.all([
      supabaseAdmin.from('products').select('*, images:product_images(*), sizes:product_sizes(*)').order('sort_order'),
      supabaseAdmin.from('categories').select('*').order('sort_order'),
      getFrameSizes({ activeOnly: false, useAdmin: true }),
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
        priceList: frameSizes || [],
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
      const { order_id, status, is_custom } = params;

      if (is_custom || (typeof order_id === 'string' && order_id.startsWith('MSK-CUST-'))) {
        let { data, error } = await supabaseAdmin
          .from('custom_orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('custom_order_id', order_id)
          .select()
          .maybeSingle();

        if (!data) {
          const res2 = await supabaseAdmin
            .from('custom_orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', order_id)
            .select()
            .maybeSingle();
          data = res2.data;
          error = res2.error;
        }

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('order_id', order_id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'update_custom_order_status') {
      const { id, custom_order_id, status } = params;
      const targetId = custom_order_id || id;
      let { data, error } = await supabaseAdmin
        .from('custom_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('custom_order_id', targetId)
        .select()
        .maybeSingle();

      if (!data) {
        const fallbackId = id || targetId;
        const res2 = await supabaseAdmin
          .from('custom_orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', fallbackId)
          .select()
          .maybeSingle();
        data = res2.data;
        error = res2.error;
      }

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'update_price_item') {
      const { id, price, mrp, is_active, size_label, width, height, image_url } = params;
      const res = await saveFrameSize({
        id,
        price,
        mrp,
        is_active,
        size_label,
        width,
        height,
        image_url,
      });

      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: res.data });
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
