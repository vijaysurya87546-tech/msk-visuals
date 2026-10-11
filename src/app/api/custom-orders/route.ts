import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateCustomOrderId, isValidPhone } from '@/lib/utils';
import { sendCustomOrderEmails } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      product_type,
      frame_size,
      quantity = 1,
      customization_details,
      delivery_address,
      files = [],
    } = body;

    if (!name || !phone || !delivery_address) {
      return NextResponse.json(
        { success: false, error: 'Please provide Name, Phone Number, and Delivery Address.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit Indian phone number.' },
        { status: 400 }
      );
    }

    const orderSeq = Math.floor(1000 + Math.random() * 9000);
    const customOrderId = generateCustomOrderId(orderSeq);

    const supabaseAdmin = await createAdminClient();

    // 1. Insert Custom Order
    const { data: customOrderData, error: insertError } = await supabaseAdmin
      .from('custom_orders')
      .insert({
        custom_order_id: customOrderId,
        name,
        phone,
        email: email || null,
        product_type: product_type || 'Custom Design',
        frame_size: frame_size || 'Custom size',
        quantity: parseInt(String(quantity), 10) || 1,
        customization_details: customization_details || null,
        delivery_address,
        status: 'Pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase custom order insert error:', insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // 2. Insert Attached Files (if any)
    if (customOrderData && Array.isArray(files) && files.length > 0) {
      const filesToInsert = files.map((f: any) => ({
        custom_order_id: customOrderData.id,
        file_url: f.file_url,
        file_name: f.file_name || 'custom_photo.jpg',
        file_type: f.file_type || 'main_photo',
      }));

      const { error: filesError } = await supabaseAdmin
        .from('custom_order_files')
        .insert(filesToInsert);

      if (filesError) {
        console.warn('Custom order files insert warning:', filesError.message);
      }
    }

    // 3. Dispatch Automated Emails (Non-blocking)
    try {
      await sendCustomOrderEmails({
        customOrder: {
          custom_order_id: customOrderId,
          name,
          phone,
          email,
          product_type,
          frame_size,
          quantity: parseInt(String(quantity), 10) || 1,
          customization_details,
          delivery_address,
        },
        files,
      });
    } catch (emailErr) {
      console.error('Custom order email error (order saved successfully):', emailErr);
    }

    return NextResponse.json({
      success: true,
      custom_order_id: customOrderId,
      data: customOrderData,
    });
  } catch (err: any) {
    console.error('Custom Order API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit custom order.' },
      { status: 500 }
    );
  }
}
