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
  const location = 'Custom Project'; // Default location, can be enhanced later
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
function generateTestimonialBlock(testimonial: Feedback, projectImages: string[] = []): string {
  const comment = escapeHtml(testimonial.comment);
  const clientName = escapeHtml(testimonial.clientName || 'Anonymous');
  const projectName = escapeHtml(testimonial.projectName || '');
  
  // Only show images if they exist (no default/fallback images)
  const images = projectImages;
  const imagesJson = JSON.stringify(images.map(url => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/images/${url}`;
  }));

  const hasImages = images.length > 0;

  // Generate image slides HTML (only if we have images)
  const imageSlides = hasImages ? images.map((url, index) => {
    let imageUrl = url;
    if (!url.startsWith('http') && !url.startsWith('/')) {
      imageUrl = `/${url}`;
    }
    const altText = `${projectName || clientName} - View ${index + 1}`;
    return `<img class="testimonial-carousel-image${index === 0 ? ' active' : ''}" src="${imageUrl}" alt="${escapeHtml(altText)}">`;
  }).join('\n\t\t\t\t\t\t\t\t\t\t') : '';

  // Show arrows only if more than one image
  const arrowsHtml = hasImages && images.length > 1
    ? `<button class="testimonial-carousel-arrow testimonial-carousel-prev" aria-label="Previous image">‹</button>
								<button class="testimonial-carousel-arrow testimonial-carousel-next" aria-label="Next image">›</button>`
    : '';

  const imageContainerHtml = hasImages ? `
							<div class="testimonial-carousel-container">
								<div class="testimonial-carousel-slides">
									${imageSlides}
								</div>
								${arrowsHtml}
							</div>` : '';

  const shouldShowViewMore = (testimonial.comment || '').length > 220;
  const viewMoreButtonHtml = shouldShowViewMore
    ? `<button type="button" class="testimonial-view-more" aria-expanded="false">View more</button>`
    : '';
  
  return `
					<!-- Testimonial Block -->
					<div class="testimonial-block" data-testimonial-images='${imagesJson}'>
						<div class="inner-box">
							${imageContainerHtml}
							<div class="quote icon_quotations"></div>
							<div class="author">${clientName}${projectName ? ` <span>/ ${projectName}</span>` : ''}</div>
							<p class="testimonial-text">"${comment}"</p>
							${viewMoreButtonHtml}
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
    
    // Fetch dynamic content directly from store
    let featuredProjects: PastProject[] = [];
    let testimonials: Feedback[] = [];
    
    try {
      // Get all past projects and filter for featured ones
      const allProjects: PastProject[] = await store.getAllPastProjects();

      // Prefer explicit featured-on-home projects, but fall back to latest projects
      const withDisplayImages = allProjects
        .map((project: PastProject) => {
          const featuredImages = (project.selectedImages || []).filter(img => img.isFeatured);
          const displayImages = featuredImages.length > 0 ? featuredImages : (project.selectedImages || []);
          return { ...project, selectedImages: displayImages };
        })
        .filter((project: PastProject) => (project.selectedImages || []).length > 0);

      const explicitlyFeatured = withDisplayImages.filter(
        (project: PastProject) => project.isFeaturedOnHomePage === true
      );

      featuredProjects = (explicitlyFeatured.length > 0 ? explicitlyFeatured : withDisplayImages).slice(0, 12);
      
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
    const galleryRegex = /(<div class="project-carousel owl-carousel owl-theme">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>\s*<!-- End Projects Section -->)/;
    html = html.replace(galleryRegex, `$1\n\n${galleryBlocks}\n\n\t\t\t\t$2`);
    
    // Replace testimonial blocks
    if (testimonials.length > 0) {
      // Get project images for testimonials (try to match by projectToken)
      const testimonialBlocks = testimonials.map((testimonial: Feedback) => {
        // Try to find matching project images
        const matchingProject = featuredProjects.find(p => p.projectToken === testimonial.projectToken);
        const projectImages = matchingProject 
          ? matchingProject.selectedImages.map(img => img.url)
          : [];
        return generateTestimonialBlock(testimonial, projectImages);
      }).join('\n');
      
      // Find and replace everything between the carousel div opening and closing
      const testimonialRegex = /(<div class="testimonial-carousel owl-carousel owl-theme">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>\s*<!-- End Testimonial Section -->)/;
      html = html.replace(testimonialRegex, `$1\n\n${testimonialBlocks}\n\n\t\t\t\t$2`);
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

/* Injected by Next route: normalize Testimonial card sizes + view more */
.testimonial-section .testimonial-block .inner-box{
  height: 520px;
  display: flex;
  flex-direction: column;
}
.testimonial-section .testimonial-carousel-container{
  height: 220px;
  flex: 0 0 auto;
  margin-bottom: 18px;
}
.testimonial-section .testimonial-carousel-slides{
  height: 220px;
}
.testimonial-section .testimonial-carousel-image{
  width: 100%;
  height: 220px;
  object-fit: cover;
  object-position: center;
}
.testimonial-section .testimonial-text{
  flex: 1 1 auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}
.testimonial-section .testimonial-block.is-expanded .testimonial-text{
  display: block;
  overflow: auto;
  max-height: 220px;
}
.testimonial-section .testimonial-view-more{
  flex: 0 0 auto;
  margin-top: 12px;
  padding: 0;
  background: transparent;
  border: 0;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
  cursor: pointer;
  align-self: flex-start;
}
.testimonial-section .testimonial-view-more:hover{
  color: #000;
  text-decoration: underline;
}
@media (max-width: 767px){
  .testimonial-section .testimonial-block .inner-box{height: 560px;}
  .testimonial-section .testimonial-carousel-container,
  .testimonial-section .testimonial-carousel-slides,
  .testimonial-section .testimonial-carousel-image{height: 200px;}
  .testimonial-section .testimonial-block.is-expanded .testimonial-text{max-height: 260px;}
}
</style></head>`
    );

    // Inject "view more" toggle script for testimonials
    html = html.replace(
      /<\/body>/i,
      `<script>
(function(){
  function init(){
    var buttons = document.querySelectorAll('.testimonial-view-more');
    if (!buttons || !buttons.length) return;
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        var block = btn.closest('.testimonial-block');
        if (!block) return;
        var expanded = block.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        btn.textContent = expanded ? 'View less' : 'View more';
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script></body>`
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
