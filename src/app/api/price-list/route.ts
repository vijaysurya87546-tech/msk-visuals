import { NextRequest, NextResponse } from 'next/server';
import { getFrameSizes } from '@/lib/priceListService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const items = await getFrameSizes({ activeOnly: !all });
    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (err: any) {
    console.error('Error fetching frame sizes:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch frame sizes' },
      { status: 500 }
    );
  }
}
