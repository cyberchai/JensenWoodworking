import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Force dynamic rendering - this route reads files at runtime
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try multiple possible paths for the public folder
    const possiblePaths = [
      join(process.cwd(), 'public', 'nordic', 'index.html'),
      join(process.cwd(), 'client-portal', 'public', 'nordic', 'index.html'),
    ];

    let filePath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        filePath = path;
        break;
      }
    }

    if (!filePath) {
      console.error('index.html not found. Tried paths:', possiblePaths);
      console.error('Current working directory:', process.cwd());
      return new NextResponse(
        `File not found. CWD: ${process.cwd()}`, 
        { status: 404 }
      );
    }

    let html = readFileSync(filePath, 'utf-8');
    
    // Fix asset paths to work from root (same as other route handlers)
    html = html.replace(/href="css\//g, 'href="/css/');
    html = html.replace(/src="js\//g, 'src="/js/');
    html = html.replace(/src="images\//g, 'src="/images/');
    html = html.replace(/href="fonts\//g, 'href="/fonts/');
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error serving nordic index.html:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return new NextResponse(
      `Error loading page: ${errorMessage}${errorStack ? '\n' + errorStack : ''}`, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
  }
}
