import { NextRequest, NextResponse } from 'next/server';
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

// Helper function to generate testimonial card HTML
function generateTestimonialCard(testimonial: Feedback): string {
  const comment = escapeHtml(testimonial.comment);
  const clientName = escapeHtml(testimonial.clientName || 'Anonymous');
  const projectName = escapeHtml(testimonial.projectName || '');
  const testimonialId = escapeHtml(testimonial.id || '');
  
  // Check if text needs truncation (show snippet if longer than 200 chars)
  const needsTruncation = comment.length > 200;
  const snippet = needsTruncation ? comment.substring(0, 200) + '...' : comment;
  const fullText = comment;
  
  return `
					<!-- Testimonial Card -->
					<div class="testimonial-card" data-testimonial-id="${testimonialId}">
						<div class="testimonial-card-content">
							<div class="testimonial-quote">"</div>
							<div class="testimonial-text${needsTruncation ? '' : ' expanded'}">
								<span class="testimonial-text-snippet">${snippet}</span>
								<span class="testimonial-text-full">${fullText}</span>
							</div>
							<div class="testimonial-text-fade"${needsTruncation ? '' : ' style="display: none;"'}></div>
							<div class="testimonial-expand-container"${needsTruncation ? '' : ' style="display: none;"'}>
								<button class="testimonial-expand-btn${needsTruncation ? '' : ' hidden'}" onclick="toggleTestimonial(this)">
									<span class="expand-text">Read More</span>
									<span class="expand-icon">▼</span>
								</button>
							</div>
						</div>
						<div class="testimonial-author">
							<span class="testimonial-author-name">${clientName}</span>
							<span class="testimonial-author-location">${projectName}</span>
						</div>
					</div>`;
}

export async function GET(request: NextRequest) {
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
    
    // Generate testimonial cards HTML
    if (testimonials.length > 0) {
      const testimonialCards = testimonials.map(testimonial => generateTestimonialCard(testimonial)).join('\n');
      
      // Replace the testimonials wall content
      const testimonialsWallRegex = /(<div class="testimonials-wall">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/;
      html = html.replace(testimonialsWallRegex, `$1\n${testimonialCards}\n\t\t\t\t$2`);
    } else {
      // If no testimonials, show empty state
      const emptyState = '<div class="text-center py-20"><p class="text-stone-400">No testimonials available at this time.</p></div>';
      const testimonialsWallRegex = /(<div class="testimonials-wall">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/;
      html = html.replace(testimonialsWallRegex, `$1\n${emptyState}\n\t\t\t\t$2`);
    }
    
    // Add script to handle URL parameter for expanding specific testimonial
    const urlParamScript = `
	<!-- Testimonial URL Parameter Handler -->
	<script>
		(function() {
			document.addEventListener('DOMContentLoaded', function() {
				const urlParams = new URLSearchParams(window.location.search);
				const testimonialId = urlParams.get('id');
				
				if (testimonialId) {
					const testimonialCard = document.querySelector('[data-testimonial-id="' + testimonialId + '"]');
					if (testimonialCard) {
						// Scroll to the testimonial
						setTimeout(function() {
							testimonialCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
							
							// Expand the testimonial if it has an expand button
							const expandBtn = testimonialCard.querySelector('.testimonial-expand-btn:not(.hidden)');
							if (expandBtn) {
								setTimeout(function() {
									toggleTestimonial(expandBtn);
								}, 500);
							}
						}, 100);
					}
				}
			});
		})();
	</script>`;
    
    // Insert script before closing body tag
    html = html.replace('</body>', urlParamScript + '\n</body>');
    
    // Fix asset paths to work from root
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
    console.error('Error serving nordic testimonials.html:', error);
    return new NextResponse('Not Found', { status: 404 });
  }
}
