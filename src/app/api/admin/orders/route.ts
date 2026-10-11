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

// PATCH to update order status
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { order_id, status } = await req.json();

    if (!order_id || !status) {
      return NextResponse.json({ error: 'order_id and status are required' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('order_id', order_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also record status change history
    if (data?.id) {
      await supabaseAdmin.from('order_status_history').insert({
        order_id: data.id,
        status,
        notes: `Status changed to ${status} by Admin`,
      });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
