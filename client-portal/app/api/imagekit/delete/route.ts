import { NextRequest, NextResponse } from 'next/server';
import { getImageKit } from '@/lib/imagekit';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Validate fileId format (should be a string, no special characters that could cause issues)
    if (typeof fileId !== 'string' || fileId.length === 0) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    // Delete from ImageKit
    const imagekit = getImageKit();
    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('ImageKit delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
