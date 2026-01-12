import { NextRequest, NextResponse } from 'next/server';
import { getImageKit, isValidImageFile, isValidFileSize, generateUniqueFilename } from '@/lib/imagekit';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageFile(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (!isValidFileSize(file, 10)) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);

    // Upload to ImageKit
    const imagekit = getImageKit();
    const result = await imagekit.upload({
      file: buffer,
      fileName: filename,
      folder: '/media/', // Organize uploads in a media folder
      useUniqueFileName: false, // We're handling uniqueness ourselves
    });

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
