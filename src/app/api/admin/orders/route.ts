import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get('msk_admin_session')?.value;
  return Boolean(cookie && cookie.startsWith('msk_') && cookie.length > 20);
}

// GET all orders for Admin Dashboard (bypasses client-side RLS)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = await createAdminClient();
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH to update order status (both standard orders and custom orders)
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { order_id, id, custom_order_id, status, is_custom } = body;
    const targetOrderId = custom_order_id || order_id || id;

    if (!targetOrderId || !status) {
      return NextResponse.json({ error: 'Order identifier and status are required' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    // Check if this is a Custom Order (MSK-CUST-... or flagged as custom)
    const isCustomOrder = is_custom || (typeof targetOrderId === 'string' && targetOrderId.startsWith('MSK-CUST-'));

    if (isCustomOrder) {
      // First try matching custom_order_id
      let { data, error } = await supabaseAdmin
        .from('custom_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('custom_order_id', targetOrderId)
        .select()
        .maybeSingle();

      // If not found, try matching id (uuid)
      if (!data) {
        const fallbackId = id || targetOrderId;
        const res2 = await supabaseAdmin
          .from('custom_orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', fallbackId)
          .select()
          .maybeSingle();
        data = res2.data;
        error = res2.error;
      }

      if (error) {
        console.error('Error updating custom order status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    }

    // Standard Order
    let { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('order_id', order_id)
      .select()
      .single();

    if (error || !data) {
      const res2 = await supabaseAdmin
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', order_id)
        .select()
        .single();
      data = res2.data;
      error = res2.error;
    }

    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also record status change history
    if (data?.id) {
      try {
        await supabaseAdmin.from('order_status_history').insert({
          order_id: data.id,
          status,
          notes: `Status changed to ${status} by Admin`,
        });
      } catch (historyErr) {
        console.warn('Order status history warning:', historyErr);
      }
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
