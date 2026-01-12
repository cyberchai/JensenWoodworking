import { NextRequest, NextResponse } from 'next/server';
import { getImageKit } from '@/lib/imagekit';

export async function GET(request: NextRequest) {
  try {
    const imagekit = getImageKit();
    // Get authentication parameters from ImageKit
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    console.error('ImageKit auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get authentication parameters' },
      { status: 500 }
    );
  }
}
