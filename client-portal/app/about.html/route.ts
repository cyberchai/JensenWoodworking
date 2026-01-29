import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Force dynamic rendering - this route reads files at runtime
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'nordic', 'about.html');
    let html = readFileSync(filePath, 'utf-8');
    
    // Add professional CTA section before footer
    const ctaSection = `
		<!-- Professional CTA Section -->
		<section class="professional-cta-section" style="padding: 56px 0; background-color: #f8f8f8; border-top: 1px solid #eee;">
			<div class="auto-container">
				<div class="sec-title centered">
					<div class="title" style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 10px;">Ready to Begin</div>
					<h2 style="font-size: 28px; font-weight: 400; color: #1a1a1a; margin-bottom: 14px; line-height: 1.25;">Start Your Project</h2>
					<p style="max-width: 440px; margin: 0 auto 24px; font-size: 14px; line-height: 1.65; color: #666; font-weight: 400;">Every piece begins with a conversation. Let's discuss how we can bring your vision to life.</p>
					<a href="contact.html" class="theme-btn btn-style-one" style="display: inline-block; font-size: 13px; padding: 10px 24px;"><span class="txt">Get in Touch</span></a>
				</div>
			</div>
		</section>
		<!-- End Professional CTA Section -->`;
    
    // Insert CTA before footer
    html = html.replace(/(<!-- Main Footer -->)/, `${ctaSection}\n\n\t\t$1`);
    
    // Fix asset paths to work from root
    html = html.replace(/href="css\//g, 'href="/css/');
    html = html.replace(/src="js\//g, 'src="/js/');
    html = html.replace(/src="images\//g, 'src="/images/');
    html = html.replace(/href="fonts\//g, 'href="/fonts/');
    
    // Fix font paths in CSS - inject CSS that overrides font-face declarations with correct paths
    // Note: Font filenames contain ? characters, so we reference them with query strings
    const fontPathFix = `
	<style>
	/* Fix font paths - fonts are in /nordic/fonts/ but CSS references ../fonts/ */
	@font-face {
		font-family: 'linearicons-free';
		src: url('/nordic/fonts/Linearicons-Free.woff2?w118d') format('woff2');
		font-weight: 400;
		font-style: normal;
	}
	@font-face {
		font-family: 'ionicons';
		src: url('/nordic/fonts/ionicons.ttf?v=2.0.0') format('truetype');
		font-weight: 400;
		font-style: normal;
	}
	</style>`;
    html = html.replace(/<\/head>/i, `${fontPathFix}\n\t$&`);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error serving nordic about.html:', error);
    return new NextResponse('Not Found', { status: 404 });
  }
}
