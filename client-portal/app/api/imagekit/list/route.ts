import { NextRequest, NextResponse } from 'next/server';
import { getImageKit } from '@/lib/imagekit';

export const dynamic = 'force-dynamic';

// Lists files from ImageKit Media Library.
// By default we list within /media/ (where uploads are stored).
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path') || '/media/';
    const limitParam = searchParams.get('limit');
    const skipParam = searchParams.get('skip');

    const limit = Math.min(Math.max(Number(limitParam ?? 100), 1), 1000);
    const skip = Math.max(Number(skipParam ?? 0), 0);

    const imagekit = getImageKit();

    // ImageKit Node SDK: listFiles({ path, limit, skip, ... })
    const files = await imagekit.listFiles({
      path,
      limit,
      skip,
      // Keep it simple/professional: newest first
      sort: 'DESC_CREATED',
      fileType: 'image',
    } as any);

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('ImageKit list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list images' },
      { status: 500 }
    );
  }
}

