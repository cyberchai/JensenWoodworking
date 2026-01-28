import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { PastProject } from '@/lib/mockStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allProjects = await store.getAllPastProjects();
    
    // Filter to only projects featured on home page with at least one featured image
    const featuredProjects = allProjects
      .filter((project: PastProject) => project.isFeaturedOnHomePage === true)
      .filter((project: PastProject) => {
        const featuredImages = project.selectedImages.filter(img => img.isFeatured);
        return featuredImages.length > 0;
      })
      .map((project: PastProject) => ({
        ...project,
        selectedImages: project.selectedImages.filter(img => img.isFeatured),
      }));
    
    return NextResponse.json(featuredProjects, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return NextResponse.json(
      [],
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
