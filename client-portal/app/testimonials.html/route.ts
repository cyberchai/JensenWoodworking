import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Feedback } from '@/lib/mockStore';
import { store } from '@/lib/store';

// Force dynamic rendering - this route reads files at runtime
export const dynamic = 'force-dynamic';

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function truncateAtWord(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const safeTruncate = lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated;
  return `${safeTruncate.trim()}...`;
}

function formatCommentHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function generateTestimonialEntry(testimonial: Feedback, index: number): string {
  const comment = testimonial.comment?.trim() || '';
  const clientName = escapeHtml(testimonial.clientName?.trim() || 'Anonymous Client');
  const projectName = escapeHtml(testimonial.projectName?.trim() || 'Custom Commission');
  const testimonialId = escapeHtml(testimonial.id || '');
  const needsTruncation = comment.replace(/\s+/g, ' ').trim().length > 340;
  const snippetHtml = formatCommentHtml(truncateAtWord(comment, 320));
  const fullHtml = formatCommentHtml(comment);

  return `
						<article class="testimonial-entry" data-testimonial-id="${testimonialId}">
							<div class="testimonial-meta">
								<div class="testimonial-index">${String(index + 1).padStart(2, '0')}</div>
								<div class="testimonial-client">${clientName}</div>
								<div class="testimonial-project">${projectName}</div>
							</div>
							<div class="testimonial-panel">
								<div class="testimonial-quote-mark">&ldquo;</div>
								<div class="testimonial-copy">
									<span class="testimonial-copy-snippet"${needsTruncation ? '' : ' hidden'}>${snippetHtml}</span>
									<span class="testimonial-copy-full"${needsTruncation ? ' hidden' : ''}>${fullHtml}</span>
								</div>
								${needsTruncation ? `
								<button class="testimonial-toggle" type="button" aria-expanded="false">
									<span class="testimonial-toggle-label">Read the full note</span>
									<span class="testimonial-toggle-icon">+</span>
								</button>` : ''}
							</div>
						</article>`;
}

function generateStreamHtml(testimonials: Feedback[]): string {
  if (testimonials.length === 0) {
    return `
					<div class="testimonials-empty">
						<p>No testimonials are published just yet. When clients approve feedback for the site, their notes will appear here.</p>
						<a href="contact.html" class="theme-btn btn-style-one"><span class="txt">Start a Conversation</span></a>
					</div>`;
  }

  return `
					<div class="testimonials-stream" id="testimonialsStream">
${testimonials.map((testimonial, index) => generateTestimonialEntry(testimonial, index)).join('\n')}
					</div>`;
}

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'nordic', 'testimonials.html');
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    let html = readFileSync(filePath, 'utf-8');
    
    // Fetch testimonials from store
    let testimonials: Feedback[] = [];
    try {
      testimonials = (await store.getTestimonials()) as Feedback[];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }

    const seen = new Set<string>();
    testimonials = testimonials.filter((testimonial) => {
      const key =
        testimonial.id ||
        `${testimonial.projectToken}::${testimonial.clientName ?? ''}::${testimonial.projectName ?? ''}::${testimonial.comment}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    html = html.replace(
      /<!-- Testimonials Stream -->[\s\S]*?<!-- End Testimonials Stream -->/,
      `<!-- Testimonials Stream -->\n${generateStreamHtml(testimonials)}\n\t\t\t\t\t<!-- End Testimonials Stream -->`
    );
    
    // Fix asset paths to work from root
    html = html.replace(/href="css\//g, 'href="/css/');
    html = html.replace(/src="js\//g, 'src="/js/');
    html = html.replace(/src="images\//g, 'src="/images/');
    html = html.replace(/href="fonts\//g, 'href="/fonts/');
    
    // Fix font paths - inject CSS that overrides font-face declarations with correct paths
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
    console.error('Error serving nordic testimonials.html:', error);
    return new NextResponse('Not Found', { status: 404 });
  }
}
