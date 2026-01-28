import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PastProject } from '@/lib/mockStore';
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

// Helper function to generate gallery grid item HTML
function generateGalleryGridItem(project: PastProject): string {
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
  const projectType = 'Custom'; // Default type, can be enhanced later
  let imageUrl = mainImage.url;
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    imageUrl = `/${imageUrl}`;
  }
  
  return `
					<!-- Gallery Block -->
					<div class="gallery-grid-item" data-category="${location}" data-project-type="${projectType}" data-project-title="${title}" data-project-location="${location}" data-project-image="${imageUrl}" data-project-description="${description}" data-project-related-images='${relatedImagesJson}'>
						<div class="gallery-block">
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
						</div>
					</div>`;
}

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'nordic', 'gallery.html');
    let html = readFileSync(filePath, 'utf-8');
    
    // Fetch all past projects from store
    let pastProjects: PastProject[] = [];
    
    try {
      const allProjects: PastProject[] = await store.getAllPastProjects();

      // For public pages: prefer featured images, but fall back to all selected images
      pastProjects = allProjects
        .map((project: PastProject) => {
          const featuredImages = (project.selectedImages || []).filter(img => img.isFeatured);
          const displayImages = featuredImages.length > 0 ? featuredImages : (project.selectedImages || []);
          return { ...project, selectedImages: displayImages };
        })
        .filter((project: PastProject) => (project.selectedImages || []).length > 0);
    } catch (error) {
      console.error('Error fetching past projects:', error);
      // Continue with static content if store fails
    }
    
    // Replace gallery grid items
    // Always replace (so hard-coded items never show)
    const galleryItems = pastProjects.map(project => generateGalleryGridItem(project)).join('\n');
    // Find and replace everything between the gallery-grid div opening and closing
    const galleryRegex = /(<div class="gallery-grid">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>\s*<!-- End Projects Section -->)/;
    html = html.replace(galleryRegex, `$1\n\n${galleryItems}\n\n\t\t\t\t$2`);
    
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
    console.error('Error serving nordic gallery.html:', error);
    return new NextResponse('Not Found', { status: 404 });
  }
}
