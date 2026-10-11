import nodemailer from 'nodemailer';
import { BUSINESS } from '@/lib/constants';

interface OrderEmailProps {
  order: {
    order_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    district?: string | null;
    state?: string;
    pincode: string;
    subtotal: number;
    delivery_charge: number;
    discount: number;
    total: number;
    payment_method?: string;
    notes?: string | null;
    created_at?: string;
  };
  items: Array<{
    product_name: string;
    size?: string;
    quantity: number;
    price: number;
    total: number;
    customization_name?: string | null;
    customization_phone?: string | null;
    customization_instructions?: string | null;
    uploaded_image_url?: string | null;
  }>;
}

export function isEmailConfigured(): boolean {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  return Boolean(user && pass && pass !== 'your_app_password');
}

function createTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOrderEmails({ order, items }: OrderEmailProps) {
  if (!isEmailConfigured()) {
    console.warn(
      '[EMAIL NOTIFICATION] SMTP credentials not fully configured in .env.local (EMAIL_PASS is missing or default). Set EMAIL_PASS in .env.local to enable real email dispatch.'
    );
    return { success: false, reason: 'SMTP not configured' };
  }

  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || BUSINESS.email;
  const fromEmail = `"${BUSINESS.name}" <${process.env.EMAIL_USER}>`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 12px 8px; color: #ffffff;">
          <strong>${item.product_name}</strong>
          ${item.size ? `<br><span style="color: #a1a1aa; font-size: 13px;">Size: ${item.size}</span>` : ''}
          ${item.customization_name ? `<br><span style="color: #f59e0b; font-size: 12px;">Custom Name: ${item.customization_name}</span>` : ''}
          ${item.customization_phone ? `<br><span style="color: #f59e0b; font-size: 12px;">Custom Phone: ${item.customization_phone}</span>` : ''}
          ${item.customization_instructions ? `<br><span style="color: #a1a1aa; font-size: 12px;">Notes: ${item.customization_instructions}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #e4e4e7;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #e4e4e7;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 8px; text-align: right; color: #ffffff; font-weight: bold;">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  // 1. Email to Admin
  const adminSubject = `🎨 New Order: #${order.order_id} - ₹${order.total.toLocaleString('en-IN')} from ${order.customer_name}`;
  const adminHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #09090b; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #000000; font-weight: 800;">MSK VISUALS</h1>
        <p style="margin: 6px 0 0 0; color: #18181b; font-weight: 600;">NEW ORDER NOTIFICATION</p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; margin-bottom: 20px;">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #f59e0b;">Order Details</h2>
          <p style="margin: 4px 0; color: #e4e4e7;"><strong>Order ID:</strong> ${order.order_id}</p>
          <p style="margin: 4px 0; color: #e4e4e7;"><strong>Customer:</strong> ${order.customer_name}</p>
          <p style="margin: 4px 0; color: #e4e4e7;"><strong>Phone:</strong> <a href="tel:${order.customer_phone}" style="color: #60a5fa;">${order.customer_phone}</a></p>
          ${order.customer_email ? `<p style="margin: 4px 0; color: #e4e4e7;"><strong>Email:</strong> ${order.customer_email}</p>` : ''}
          <p style="margin: 4px 0; color: #e4e4e7;"><strong>Payment:</strong> ${order.payment_method || 'Pay on Confirmation'}</p>
        </div>

        <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #f59e0b;">Delivery Address</h3>
          <p style="margin: 4px 0; color: #d4d4d8;">
            ${order.address_line1}${order.address_line2 ? `, ${order.address_line2}` : ''}<br>
            ${order.city}${order.district ? `, ${order.district}` : ''}, ${order.state || 'Tamil Nadu'} - ${order.pincode}
          </p>
          ${order.notes ? `<p style="margin: 8px 0 0 0; color: #a1a1aa; font-style: italic;"><strong>Customer Notes:</strong> ${order.notes}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #3f3f46; text-align: left; color: #a1a1aa; font-size: 13px;">
              <th style="padding: 8px;">ITEM</th>
              <th style="padding: 8px; text-align: center;">QTY</th>
              <th style="padding: 8px; text-align: right;">PRICE</th>
              <th style="padding: 8px; text-align: right;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; text-align: right; margin-bottom: 24px;">
          <p style="margin: 4px 0; color: #a1a1aa;">Subtotal: <strong style="color: #ffffff;">₹${order.subtotal.toLocaleString('en-IN')}</strong></p>
          <p style="margin: 4px 0; color: #a1a1aa;">Delivery: <strong style="color: #ffffff;">${order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 20px; color: #f59e0b; font-weight: bold;">Grand Total: ₹${order.total.toLocaleString('en-IN')}</p>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/dashboard" style="display: inline-block; background-color: #f59e0b; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px;">
            Open Admin Dashboard
          </a>
        </div>
      </div>

      <div style="padding: 16px; background-color: #18181b; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a;">
        MSK VISUALS • Premium Photo Frames & Customized Gifts • Madurai
      </div>
    </div>
  `;

  // 2. Email to Customer (if customer email is provided)
  const promises: Promise<any>[] = [];

  // Always send to Admin
  promises.push(
    transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    })
  );

  if (order.customer_email) {
    const customerSubject = `✨ Order Confirmed: #${order.order_id} - MSK Visuals`;
    const customerHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #09090b; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #000000; font-weight: 800;">MSK VISUALS</h1>
          <p style="margin: 6px 0 0 0; color: #18181b; font-weight: 600;">THANK YOU FOR YOUR ORDER!</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #e4e4e7;">Dear <strong>${order.customer_name}</strong>,</p>
          <p style="color: #a1a1aa; line-height: 1.6;">
            We have successfully received your order <strong>#${order.order_id}</strong>! Our design team is reviewing your requirements and crafting your customized frame with highest quality materials.
          </p>

          <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #f59e0b;">Delivery Address</h3>
            <p style="margin: 0; color: #d4d4d8; line-height: 1.5;">
              ${order.address_line1}${order.address_line2 ? `, ${order.address_line2}` : ''}<br>
              ${order.city}${order.district ? `, ${order.district}` : ''}, ${order.state || 'Tamil Nadu'} - ${order.pincode}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #3f3f46; text-align: left; color: #a1a1aa; font-size: 13px;">
                <th style="padding: 8px;">ITEM</th>
                <th style="padding: 8px; text-align: center;">QTY</th>
                <th style="padding: 8px; text-align: right;">PRICE</th>
                <th style="padding: 8px; text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; text-align: right; margin-bottom: 24px;">
            <p style="margin: 4px 0; color: #a1a1aa;">Subtotal: <strong style="color: #ffffff;">₹${order.subtotal.toLocaleString('en-IN')}</strong></p>
            <p style="margin: 4px 0; color: #a1a1aa;">Delivery: <strong style="color: #ffffff;">${order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</strong></p>
            <p style="margin: 8px 0 0 0; font-size: 18px; color: #f59e0b; font-weight: bold;">Total Amount: ₹${order.total.toLocaleString('en-IN')}</p>
          </div>

          <div style="background-color: #1c1917; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #fed7aa;">
              <strong>Need customization changes?</strong> Message us directly on WhatsApp at 
              <a href="https://wa.me/919361253338" style="color: #f59e0b; text-decoration: underline;">+91 93612 53338</a> with your Order ID.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/order-confirmation/${order.order_id}" style="display: inline-block; background-color: #f59e0b; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">
              View Order Details
            </a>
          </div>
        </div>

        <div style="padding: 16px; background-color: #18181b; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a;">
          MSK VISUALS • Madurai, Tamil Nadu • Instagram: @mskvsls • Phone: +91 93612 53338
        </div>
      </div>
    `;

    promises.push(
      transporter.sendMail({
        from: fromEmail,
        to: order.customer_email,
        subject: customerSubject,
        html: customerHtml,
      })
    );
  }

  const results = await Promise.allSettled(promises);
  console.log('[EMAIL NOTIFICATION] Dispatched order emails:', results.map(r => r.status));
  return { success: true, results };
}
