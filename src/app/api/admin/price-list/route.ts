import { NextRequest, NextResponse } from 'next/server';
import {
  getFrameSizes,
  saveFrameSize,
  deleteFrameSize,
  toggleFrameSizeStatus,
  cleanupStorageFile,
} from '@/lib/priceListService';

function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get('msk_admin_session')?.value;
  return Boolean(cookie && cookie.startsWith('msk_') && cookie.length > 20);
}

// GET all frame sizes for admin
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await getFrameSizes({ activeOnly: false, useAdmin: true });
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// POST create new frame size
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { size_label, width, height, price, mrp, image_url, is_active } = body;

    if (!size_label || typeof size_label !== 'string' || !size_label.trim()) {
      return NextResponse.json({ error: 'Valid size label is required (e.g. "12 x 18")' }, { status: 400 });
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: 'Price must be a valid non-negative number' }, { status: 400 });
    }

    if (mrp !== undefined && (isNaN(Number(mrp)) || Number(mrp) < 0)) {
      return NextResponse.json({ error: 'MRP must be a valid non-negative number' }, { status: 400 });
    }

    if (width !== undefined && width !== null && (isNaN(Number(width)) || Number(width) <= 0)) {
      return NextResponse.json({ error: 'Width must be a positive number' }, { status: 400 });
    }

    if (height !== undefined && height !== null && (isNaN(Number(height)) || Number(height) <= 0)) {
      return NextResponse.json({ error: 'Height must be a positive number' }, { status: 400 });
    }

    const res = await saveFrameSize({
      size_label: size_label.trim(),
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price) * 1.4,
      image_url: image_url || null,
      is_active: is_active ?? true,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: res.data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create frame size' }, { status: 500 });
  }
}

// PUT / PATCH update existing frame size
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, id, old_image_url, ...params } = body;

    if (!id) {
      return NextResponse.json({ error: 'Frame size ID is required' }, { status: 400 });
    }

    // Quick toggle status action
    if (action === 'toggle_status') {
      const { is_active } = params;
      const res = await toggleFrameSizeStatus(id, Boolean(is_active));
      if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    // Full update
    const { size_label, width, height, price, mrp, image_url, is_active } = params;

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return NextResponse.json({ error: 'Price must be a valid non-negative number' }, { status: 400 });
    }

    if (mrp !== undefined && (isNaN(Number(mrp)) || Number(mrp) < 0)) {
      return NextResponse.json({ error: 'MRP must be a valid non-negative number' }, { status: 400 });
    }

    const res = await saveFrameSize({
      id,
      size_label: size_label?.trim(),
      width: width !== undefined && width !== null ? Number(width) : undefined,
      height: height !== undefined && height !== null ? Number(height) : undefined,
      price: price !== undefined ? Number(price) : undefined as any,
      mrp: mrp !== undefined ? Number(mrp) : undefined,
      image_url: image_url !== undefined ? image_url : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : undefined,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    // If an image was replaced with a new one, clean up old storage file
    if (old_image_url && image_url && old_image_url !== image_url) {
      cleanupStorageFile(old_image_url).catch((cErr) => console.warn('Old file cleanup error:', cErr));
    }

    return NextResponse.json({ success: true, data: res.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update frame size' }, { status: 500 });
  }
}

// DELETE frame size
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Frame size ID is required' }, { status: 400 });
    }

    const res = await deleteFrameSize(id);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Frame size deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete frame size' }, { status: 500 });
  }
}
