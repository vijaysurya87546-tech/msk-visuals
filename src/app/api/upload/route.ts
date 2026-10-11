import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'product-images';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${cleanName}`;

    // 1. Try uploading to Supabase Storage first
    try {
      const supabase = await createAdminClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniqueFileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(uniqueFileName);

        if (urlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            fileName: uniqueFileName,
            storage: 'supabase',
          });
        }
      } else if (error) {
        console.warn('Supabase storage upload error, falling back to local storage:', error.message);
      }
    } catch (supabaseErr) {
      console.warn('Supabase upload exception, falling back to local storage:', supabaseErr);
    }

    // 2. Fallback: Save to local public/uploads directory
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, uniqueFileName);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
        storage: 'local',
      });
    } catch (fsErr: any) {
      console.error('Local file write error:', fsErr);
      return NextResponse.json(
        { error: 'Failed to save file: ' + (fsErr.message || 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
