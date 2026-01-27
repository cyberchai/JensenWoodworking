import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Force dynamic rendering - this route reads files at runtime
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'nordic', 'index.html');
    const html = readFileSync(filePath, 'utf-8');
    
    // Note: index.html already has paths fixed to use /css/, /js/, etc.
    // So we don't need to replace them like the other route handlers do
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error serving nordic index.html:', error);
    return new NextResponse('Not Found', { status: 404 });
  }
}
