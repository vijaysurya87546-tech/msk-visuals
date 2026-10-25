import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    let email = searchParams.get('email');
    let phone = searchParams.get('phone');

    // Also check current authenticated session from cookies if available
    try {
      const userSupabase = await createClient();
      const {
        data: { user },
      } = await userSupabase.auth.getUser();

      if (user) {
        if (!userId) userId = user.id;
        if (!email) email = user.email || null;
        if (!phone) phone = user.user_metadata?.phone || null;
      }
    } catch {
      // Fall back to query parameters
    }

    if (!userId && !email && !phone) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : null;

    const supabaseAdmin = await createAdminClient();

    // 1. Fetch standard orders
    let standardOrders: any[] = [];
    try {
      let ordersQuery = supabaseAdmin
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      const filters: string[] = [];
      if (userId) filters.push(`user_id.eq.${userId}`);
      if (cleanEmail) filters.push(`customer_email.eq.${cleanEmail}`);
      if (cleanPhone) filters.push(`customer_phone.ilike.%${cleanPhone}`);

      if (filters.length > 0) {
        ordersQuery = ordersQuery.or(filters.join(','));
      }

      const { data: oData, error: oError } = await ordersQuery;
      if (!oError && oData) {
        standardOrders = oData.map((o: any) => ({
          ...o,
          is_custom: false,
        }));
      }
    } catch (err) {
      console.warn('Orders fetch note:', err);
    }

    // 2. Fetch custom orders
    let customOrders: any[] = [];
    try {
      let customQuery = supabaseAdmin
        .from('custom_orders')
        .select('*, files:custom_order_files(*)')
        .order('created_at', { ascending: false });

      const customFilters: string[] = [];
      if (userId) customFilters.push(`user_id.eq.${userId}`);
      if (cleanEmail) customFilters.push(`email.eq.${cleanEmail}`);
      if (cleanPhone) customFilters.push(`phone.ilike.%${cleanPhone}`);

      if (customFilters.length > 0) {
        customQuery = customQuery.or(customFilters.join(','));
      }

      const { data: cData, error: cError } = await customQuery;
      if (!cError && cData) {
        customOrders = cData.map((c: any) => {
          // Extract price if available in details (e.g. "Price: ₹250" or "Rate: ₹250")
          let priceMatch = 0;
          if (c.customization_details) {
            const match = c.customization_details.match(/(?:Price|Rate):\s*₹?(\d+(?:,\d+)?)/i);
            if (match && match[1]) {
              priceMatch = parseInt(match[1].replace(/,/g, ''), 10);
            }
          }

          return {
            id: c.id,
            order_id: c.custom_order_id,
            is_custom: true,
            customer_name: c.name,
            customer_email: c.email || '',
            customer_phone: c.phone,
            product_type: c.product_type || 'Custom Order',
            frame_size: c.frame_size,
            customization_details: c.customization_details,
            delivery_address: c.delivery_address,
            total: priceMatch,
            status: c.status || 'Pending',
            created_at: c.created_at,
            files: c.files || [],
            payment_method: 'Pay on Confirmation / WhatsApp',
          };
        });
      }
    } catch (err) {
      console.warn('Custom orders fetch note:', err);
    }

    // 3. Merge and sort both by created_at descending
    const allOrders = [...standardOrders, ...customOrders].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      success: true,
      orders: allOrders,
    });
  } catch (err: unknown) {
    console.error('Account orders error:', err);
    return NextResponse.json({ success: false, orders: [] }, { status: 500 });
  }
}
