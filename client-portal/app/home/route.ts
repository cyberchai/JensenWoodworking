import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PastProject } from '@/lib/mockStore';
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

function normalizeAssetUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }
  return `/${url}`;
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

function normalizeQuoteText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["'“”]+/, '')
    .replace(/["'“”]+$/, '');
}

function buildLocationLabel(project?: PastProject): string {
  if (!project) return '';
  if (project.location?.trim()) {
    return project.location.trim();
  }

  const parts = [project.clientCity?.trim(), project.clientState?.trim()].filter(Boolean);
  return parts.join(', ');
}

// Helper function to generate gallery block HTML
function generateGalleryBlock(project: PastProject): string {
  if (!project.selectedImages || project.selectedImages.length === 0) {
    return '';
  }

  const mainImage = project.selectedImages[0];
  const relatedImages = project.selectedImages.slice(1).map(img => img.url);
  const relatedImagesJson = JSON.stringify(relatedImages.map(url => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/images/${url}`;
  }));
  
  const title = escapeHtml(project.title);
  const description = escapeHtml(project.description || '');
  const types = project.projectType && project.projectType.length > 0 ? project.projectType : ['Custom'];
  const displayType = escapeHtml(types[0]);
  const location = displayType;
  let imageUrl = mainImage.url;
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    imageUrl = `/${imageUrl}`;
  }
  
  return `
					<!-- Gallery Block -->
					<div class="gallery-block" data-project-title="${title}" data-project-location="${location}" data-project-image="${imageUrl}" data-project-description="${description}" data-project-related-images='${relatedImagesJson}'>
						<div class="inner-box">
							<div class="image project-clickable">
								<div class="hover-color-layer"></div>
								<a class="arrow ion-android-arrow-forward project-modal-trigger" href="javascript:void(0);"></a>
								<img src="${imageUrl}" alt="${title}" />
								<div class="overlay-box">
									<div class="content">
										<div class="category">${location}</div>
										<h3><a href="javascript:void(0);" class="project-modal-trigger">${title}</a></h3>
									</div>
								</div>
							</div>
						</div>
					</div>`;
}

// Helper function to generate testimonial block HTML
function generateTestimonialBlock(testimonial: Feedback, matchingProject?: PastProject, isActive = false): string {
  const clientName = escapeHtml(testimonial.clientName || 'Anonymous');
  const projectLabel = escapeHtml((testimonial.projectName || matchingProject?.title || testimonial.title || 'Custom Commission').trim());
  const location = escapeHtml(buildLocationLabel(matchingProject));
  const quoteText = escapeHtml(
    truncateAtWord(
      normalizeQuoteText(testimonial.comment || testimonial.title || testimonial.projectName || 'Kind words from a recent commission.'),
      280
    )
  );
  const testimonialId = escapeHtml(testimonial.id || '');
  const activeClass = isActive ? 'testimonial-block is-active' : 'testimonial-block';
  const imageUrls = (matchingProject?.selectedImages || [])
    .map((image) => normalizeAssetUrl(image.url))
    .slice(0, 4);
  const hasImages = imageUrls.length > 0;
  const mediaClass = hasImages ? 'testimonial-media' : 'testimonial-media testimonial-media-placeholder';
  const slidesHtml = hasImages
    ? imageUrls
        .map(
          (imageUrl, index) =>
            `<img class="testimonial-carousel-image${index === 0 ? ' active' : ''}" src="${imageUrl}" alt="${projectLabel} - View ${index + 1}">`
        )
        .join('\n')
    : '';
  const carouselHtml = hasImages
    ? `
							<div class="testimonial-carousel-container">
								<div class="testimonial-carousel-slides">
${slidesHtml}
								</div>
								${imageUrls.length > 1 ? `
								<button class="testimonial-carousel-arrow testimonial-carousel-prev" aria-label="Previous image">‹</button>
								<button class="testimonial-carousel-arrow testimonial-carousel-next" aria-label="Next image">›</button>` : ''}
							</div>`
    : '';
  const locationHtml = location ? `<div class="testimonial-location">${location}</div>` : '';

  return `
					<!-- Testimonial Block -->
					<div class="${activeClass}" data-testimonial-id="${testimonialId}">
						<div class="inner-box">
							<div class="${mediaClass}">
${carouselHtml}
								<div class="testimonial-project-label">${projectLabel}</div>
							</div>
							<div class="testimonial-copy-panel">
								<div class="quote icon_quotations"></div>
								<p class="testimonial-quote-text">${quoteText}</p>
								<div class="testimonial-meta-row">
									<div class="author">${clientName}</div>
									${locationHtml}
								</div>
							</div>
						</div>
					</div>`;
}

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
    
    // Replace banner section background images with bg-masthead.jpg
    // Handle both original path and any manually edited incorrect paths
    html = html.replace(/url\(images\/main-slider\/image-1\.jpg\)/g, 'url(/bg-masthead.jpg)');
    html = html.replace(/url\(client-portal\/public\/bg-masthead\.jpg\)/g, 'url(/bg-masthead.jpg)');
    html = html.replace(/url\(['"]?images\/main-slider\/image-1\.jpg['"]?\)/g, 'url(/bg-masthead.jpg)');
    
    // Fetch dynamic content directly from store
    let allPastProjects: PastProject[] = [];
    let featuredProjects: PastProject[] = [];
    let testimonials: Feedback[] = [];
    
    try {
      allPastProjects = await store.getAllPastProjects();

      featuredProjects = allPastProjects
        .filter((project: PastProject) => project.isFeaturedOnHomePage === true)
        .map((project: PastProject) => {
          const visibleImages = (project.selectedImages || []).filter(img => img.isFeatured);
          const displayImages = visibleImages.length > 0 ? visibleImages : (project.selectedImages || []);
          return { ...project, selectedImages: displayImages };
        })
        .filter((project: PastProject) => (project.selectedImages || []).length > 0)
        .slice(0, 12);
      
      // Get testimonials
      testimonials = (await store.getTestimonials()) as Feedback[];
    } catch (apiError) {
      console.error('Error fetching dynamic content:', apiError);
      // Continue with static content if store fails
    }

    // Dedupe testimonials (avoid duplicates even when only 1 is showing)
    if (testimonials.length > 0) {
      const seen = new Set<string>();
      testimonials = testimonials.filter((t) => {
        const key = t.id || `${t.projectToken}::${t.clientName ?? ''}::${t.projectName}::${t.comment}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    
    // Replace gallery blocks
    // Always replace (so hard-coded items never show)
    const galleryBlocks = featuredProjects.map(project => generateGalleryBlock(project)).join('\n');
    // Find and replace everything between the carousel div opening and closing
    const galleryRegex = /(<div class="project-carousel home-projects">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>\s*<!-- End Projects Section -->)/;
    html = html.replace(galleryRegex, `$1\n\n${galleryBlocks}\n\n\t\t\t\t$2`);
    
    // Replace testimonial blocks
    if (testimonials.length > 0) {
      const testimonialBlocks = testimonials.map((testimonial: Feedback, index: number) => {
        const matchingProject = allPastProjects.find((project) => project.projectToken === testimonial.projectToken);
        return generateTestimonialBlock(testimonial, matchingProject, index === 0);
      }).join('\n');
      
      // Replace testimonial section - only carousel cards (no extra title list)
      const testimonialSectionRegex = /(<div class="sec-title">\s*<div class="clearfix">\s*<div class="pull-left">\s*<h2>What Our Clients Say<\/h2>\s*<\/div>\s*<\/div>\s*<\/div>)(\s*<div class="testimonial-carousel home-testimonials">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>\s*<!-- End Testimonial Section -->)/;
      html = html.replace(testimonialSectionRegex, `$1$2\n\n${testimonialBlocks}\n\n\t\t\t\t$3`);
      
    } else {
      // If 0 testimonials, remove the entire section from the page
      const removeTestimonialSectionRegex = /<section class="testimonial-section">[\s\S]*?<\/section>\s*<!-- End Testimonial Section -->\s*/;
      html = html.replace(removeTestimonialSectionRegex, '');
    }
    
    // Fix asset paths to work from root (same as other route handlers)
    html = html.replace(/href="css\//g, 'href="/css/');
    html = html.replace(/src="js\//g, 'src="/js/');
    html = html.replace(/src="images\//g, 'src="/images/');
    html = html.replace(/href="fonts\//g, 'href="/fonts/');
    // Fix inline background-image URLs so Services/About section images load from /home
    html = html.replace(/url\(images\//g, 'url(/images/');
    
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

    // Ensure "Latest Projects" cards are a fixed size (carousel)
    html = html.replace(
      /<\/head>/i,
      `<style>
/* Injected by Next route: normalize Latest Projects card sizes */
.projects-section .project-carousel .gallery-block{margin-bottom:0;}
.projects-section .project-carousel .gallery-block .inner-box{height:420px;}
.projects-section .project-carousel .gallery-block .inner-box .image{height:420px;overflow:hidden;}
.projects-section .project-carousel .gallery-block .inner-box .image img{width:100%;height:100%;object-fit:cover;object-position:center;}
@media (max-width: 767px){
  .projects-section .project-carousel .gallery-block .inner-box{height:320px;}
  .projects-section .project-carousel .gallery-block .inner-box .image{height:320px;}
}

/* Optional: cap banner height on very short viewports so CTA stays visible */
@media (max-height: 500px) {
  .banner-section,
  .banner-section .slide,
  .banner-section .main-slider-carousel {
    min-height: 300px;
    height: auto;
    max-height: 70vh;
  }
}
</style></head>`
    );
    
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
