import { createAdminClient, createClient } from '@/lib/supabase/server';
import { INITIAL_PRICE_LIST } from '@/lib/mockData';
import type { PriceListItem } from '@/lib/types';
import path from 'path';
import { unlink } from 'fs/promises';

const SETTINGS_KEY_MOCKUPS = 'frame_mockup_images';

// Helper to get image mockup map from site_settings
async function getMockupMap(supabaseAdmin: any): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY_MOCKUPS)
      .maybeSingle();

    if (!error && data?.value) {
      try {
        return JSON.parse(data.value);
      } catch (pErr) {
        console.warn('Failed to parse frame_mockup_images JSON:', pErr);
      }
    }
  } catch (err) {
    console.warn('Error reading mockup map from site_settings:', err);
  }
  return {};
}

// Helper to save image mockup map to site_settings
async function saveMockupMap(supabaseAdmin: any, map: Record<string, string>): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        {
          key: SETTINGS_KEY_MOCKUPS,
          value: JSON.stringify(map),
          label: 'Frame Mockup Images Map',
          group_name: 'frames',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
    return !error;
  } catch (err) {
    console.error('Error saving mockup map to site_settings:', err);
    return false;
  }
}

// Safely clean up replaced or deleted storage file
export async function cleanupStorageFile(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl || typeof imageUrl !== 'string') return;

  // Don't delete external stock images (e.g. unsplash)
  if (imageUrl.includes('unsplash.com') || imageUrl.startsWith('http://') && !imageUrl.includes('supabase.co')) {
    return;
  }

  // 1. Check if Supabase Storage URL
  if (imageUrl.includes('supabase.co/storage/v1/object/public/')) {
    try {
      const parts = imageUrl.split('/storage/v1/object/public/');
      if (parts[1]) {
        const [bucket, ...pathParts] = parts[1].split('/');
        const filePath = pathParts.join('/');
        if (bucket && filePath) {
          const supabaseAdmin = await createAdminClient();
          await supabaseAdmin.storage.from(bucket).remove([filePath]);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to delete storage file from Supabase:', err);
    }
  }

  // 2. Check if local /uploads/ URL
  if (imageUrl.startsWith('/uploads/')) {
    try {
      const fileName = imageUrl.replace('/uploads/', '');
      const sanitized = path.basename(fileName);
      const fullPath = path.join(process.cwd(), 'public', 'uploads', sanitized);
      await unlink(fullPath);
    } catch (err) {
      console.warn('Failed to delete local upload file:', err);
    }
  }
}

// Fetch all or active frame sizes with mockup images
export async function getFrameSizes(options?: { activeOnly?: boolean; useAdmin?: boolean }): Promise<PriceListItem[]> {
  try {
    const supabase = options?.useAdmin ? await createAdminClient() : await createClient();
    const supabaseAdmin = await createAdminClient();

    let query = supabase.from('price_list').select('*').order('sort_order', { ascending: true });
    if (options?.activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: dbItems, error } = await query;
    const mockupMap = await getMockupMap(supabaseAdmin);

    let items: PriceListItem[] = [];
    if (!error && dbItems && dbItems.length > 0) {
      items = dbItems as PriceListItem[];
    } else {
      items = (options?.activeOnly
        ? INITIAL_PRICE_LIST.filter((i) => i.is_active)
        : INITIAL_PRICE_LIST) as PriceListItem[];
    }

    // Merge mockups from site_settings if not already present on record
    return items.map((item) => {
      const imageFromMap = mockupMap[item.id] || mockupMap[item.size_label] || null;
      return {
        ...item,
        image_url: item.image_url || imageFromMap || null,
      };
    });
  } catch (err) {
    console.error('getFrameSizes exception:', err);
    return (options?.activeOnly
      ? INITIAL_PRICE_LIST.filter((i) => i.is_active)
      : INITIAL_PRICE_LIST) as PriceListItem[];
  }
}

// Create or update a frame size
export async function saveFrameSize(params: {
  id?: string;
  size_label?: string;
  width?: number | null;
  height?: number | null;
  price?: number;
  mrp?: number | null;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
}): Promise<{ success: boolean; data?: PriceListItem; error?: string }> {
  try {
    const supabaseAdmin = await createAdminClient();
    const mockupMap = await getMockupMap(supabaseAdmin);

    if (params.id) {
      // UPDATE existing frame size: fetch existing to support partial updates
      const { data: existing } = await supabaseAdmin
        .from('price_list')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      const size_label = (params.size_label !== undefined ? params.size_label : existing?.size_label || '').trim();
      if (!size_label) {
        return { success: false, error: 'Size label is required.' };
      }

      const rawPrice = params.price !== undefined ? params.price : existing?.price;
      const price = Number(rawPrice);
      if (isNaN(price) || price < 0) {
        return { success: false, error: 'Price must be a non-negative number.' };
      }

      const rawMrp = params.mrp !== undefined ? params.mrp : existing?.mrp;
      const mrp = rawMrp !== undefined && rawMrp !== null ? Number(rawMrp) : price * 1.4;
      if (isNaN(mrp) || mrp < 0) {
        return { success: false, error: 'MRP must be a non-negative number.' };
      }

      const width = params.width !== undefined ? (params.width !== null ? Number(params.width) : null) : existing?.width;
      const height = params.height !== undefined ? (params.height !== null ? Number(params.height) : null) : existing?.height;
      if ((width !== null && (isNaN(width) || width <= 0)) || (height !== null && (isNaN(height) || height <= 0))) {
        return { success: false, error: 'Width and height must be positive numbers.' };
      }

      const is_active = params.is_active !== undefined ? Boolean(params.is_active) : (existing?.is_active ?? true);
      const image_url = params.image_url !== undefined ? params.image_url : (existing?.image_url || mockupMap[params.id] || null);

      const updatePayloadWithImage: any = {
        size_label,
        width,
        height,
        price,
        mrp,
        image_url,
        is_active,
        updated_at: new Date().toISOString(),
      };
      if (params.sort_order !== undefined) {
        updatePayloadWithImage.sort_order = params.sort_order;
      }

      // Try update with image_url column
      let result = await supabaseAdmin
        .from('price_list')
        .update(updatePayloadWithImage)
        .eq('id', params.id)
        .select()
        .single();

      // If column image_url doesn't exist in Postgres table, update without it
      if (result.error && (result.error.code === '42703' || result.error.message.includes('image_url'))) {
        const { image_url: _, ...payloadWithoutImage } = updatePayloadWithImage;
        result = await supabaseAdmin
          .from('price_list')
          .update(payloadWithoutImage)
          .eq('id', params.id)
          .select()
          .single();
      }

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      // Always persist image_url in mockupMap for rock-solid redundancy
      if (params.image_url !== undefined) {
        if (params.image_url) {
          mockupMap[params.id] = params.image_url;
          mockupMap[size_label] = params.image_url;
        } else {
          delete mockupMap[params.id];
          delete mockupMap[size_label];
        }
        await saveMockupMap(supabaseAdmin, mockupMap);
      }

      const updatedItem: PriceListItem = {
        ...result.data,
        image_url: params.image_url !== undefined ? params.image_url : (result.data.image_url ?? mockupMap[params.id] ?? null),
      };

      return { success: true, data: updatedItem };
    } else {
      // CREATE new frame size
      const size_label = (params.size_label || '').trim();
      if (!size_label) {
        return { success: false, error: 'Size label is required.' };
      }

      const price = Number(params.price);
      if (isNaN(price) || price < 0) {
        return { success: false, error: 'Price must be a non-negative number.' };
      }

      const mrp = params.mrp !== undefined && params.mrp !== null ? Number(params.mrp) : price * 1.4;
      if (isNaN(mrp) || mrp < 0) {
        return { success: false, error: 'MRP must be a non-negative number.' };
      }

      const width = params.width ? Number(params.width) : null;
      const height = params.height ? Number(params.height) : null;
      if ((width !== null && (isNaN(width) || width <= 0)) || (height !== null && (isNaN(height) || height <= 0))) {
        return { success: false, error: 'Width and height must be positive numbers.' };
      }

      // Get current max sort_order
      const { data: maxItems } = await supabaseAdmin
        .from('price_list')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextSort = params.sort_order ?? ((maxItems?.[0]?.sort_order ?? 15) + 1);

      const insertPayloadWithImage: any = {
        size_label,
        width,
        height,
        price,
        mrp,
        image_url: params.image_url ?? null,
        is_active: params.is_active ?? true,
        sort_order: nextSort,
      };

      let result = await supabaseAdmin
        .from('price_list')
        .insert(insertPayloadWithImage)
        .select()
        .single();

      if (result.error && (result.error.code === '42703' || result.error.message.includes('image_url'))) {
        const { image_url: _, ...payloadWithoutImage } = insertPayloadWithImage;
        result = await supabaseAdmin
          .from('price_list')
          .insert(payloadWithoutImage)
          .select()
          .single();
      }

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      const newItem = result.data;
      if (params.image_url) {
        mockupMap[newItem.id] = params.image_url;
        mockupMap[size_label] = params.image_url;
        await saveMockupMap(supabaseAdmin, mockupMap);
      }

      return {
        success: true,
        data: {
          ...newItem,
          image_url: params.image_url ?? null,
        },
      };
    }
  } catch (err: any) {
    console.error('saveFrameSize error:', err);
    return { success: false, error: err.message || 'Internal server error' };
  }
}

// Delete a frame size
export async function deleteFrameSize(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: 'ID is required' };

  try {
    const supabaseAdmin = await createAdminClient();
    const mockupMap = await getMockupMap(supabaseAdmin);

    // Fetch existing item to clean up image
    const { data: item } = await supabaseAdmin
      .from('price_list')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const imageUrl = item?.image_url || mockupMap[id] || (item ? mockupMap[item.size_label] : null);

    const { error } = await supabaseAdmin.from('price_list').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }

    // Clean up from mockupMap
    if (mockupMap[id] || (item && mockupMap[item.size_label])) {
      delete mockupMap[id];
      if (item) delete mockupMap[item.size_label];
      await saveMockupMap(supabaseAdmin, mockupMap);
    }

    // Clean up stored image file if applicable
    if (imageUrl) {
      await cleanupStorageFile(imageUrl);
    }

    return { success: true };
  } catch (err: any) {
    console.error('deleteFrameSize error:', err);
    return { success: false, error: err.message || 'Internal server error' };
  }
}

// Toggle status
export async function toggleFrameSizeStatus(
  id: string,
  is_active: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: 'ID is required' };

  try {
    const supabaseAdmin = await createAdminClient();
    const { error } = await supabaseAdmin
      .from('price_list')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Internal server error' };
  }
}
