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
  const clientName = escapeHtml(testimonial.clientName || 'Anonymous');
  const title = escapeHtml(testimonial.title || '');
  const testimonialId = escapeHtml(testimonial.id || '');
  
  return `
					<!-- Testimonial Block -->
					<div class="testimonial-block" data-testimonial-id="${testimonialId}">
						<div class="inner-box">
							<div class="quote icon_quotations"></div>
							<div class="testimonial-header">
								${title ? `<div class="testimonial-title-link"><a href="testimonials.html?id=${testimonialId}" class="testimonial-title">${title}</a></div>` : ''}
							</div>
							<div class="author">${clientName}</div>
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
      
      // Replace testimonial section - only carousel cards (no extra title list)
      const testimonialSectionRegex = /(<div class="sec-title">\s*<h2>What Our Clients Say<\/h2>\s*<\/div>)(\s*<div class="testimonial-carousel owl-carousel owl-theme">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>\s*<!-- End Testimonial Section -->)/;
      html = html.replace(testimonialSectionRegex, `$1$2\n\n${testimonialBlocks}\n\n\t\t\t\t$3`);
      
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

/* Injected by Next route: decorative Testimonial carousel cards */
.testimonial-section .testimonial-block .inner-box{
  position: relative;
  padding: 40px 36px 32px 56px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.testimonial-section .testimonial-block:hover .inner-box{
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.testimonial-section .testimonial-block .quote.icon_quotations{
  position: absolute;
  top: 22px;
  left: 26px;
  font-size: 60px;
  line-height: 1;
  color: #ffe1a0;
  opacity: 0.25;
}

/* Testimonial title link styling */
.testimonial-title-link {
  margin-bottom: 10px;
}

.testimonial-title {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-block;
  line-height: 1.4;
}

.testimonial-title:hover {
  color: #ffe1a0;
  text-decoration: underline;
}

.testimonial-section .testimonial-block .author{
  margin-top: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #777777;
}

@media (max-width: 767px){
  .testimonial-section .testimonial-block .inner-box{
    padding: 32px 24px 28px 48px;
    min-height: 200px;
  }
  .testimonial-section{
    padding-top: 0 !important;
  }
  .about-section{
    padding-bottom: 24px !important;
  }
  .about-section .about-content-column{
    padding-bottom: 24px !important;
  }
  .testimonial-section .sec-title{
    margin-bottom: 32px !important;
  }
}

/* iPad: same tight spacing between About Jensen and What Our Clients Say */
@media (min-width: 768px) and (max-width: 1180px){
  .testimonial-section{
    padding-top: 0 !important;
  }
  .about-section{
    padding-bottom: 24px !important;
  }
  .about-section .about-content-column{
    padding-bottom: 24px !important;
  }
  .testimonial-section .sec-title{
    margin-bottom: 32px !important;
  }
}

/* Optional: cap banner height on very short viewports so CTA stays visible */
@media (max-height: 500px) {
  .banner-section,
  .banner-section .slide,
  .banner-section .main-slider-carousel,
  .banner-section .owl-stage-outer,
  .banner-section .owl-stage,
  .banner-section .owl-item {
    min-height: 360px;
    height: auto;
  }
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
