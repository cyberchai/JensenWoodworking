import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { PastProject } from '@/lib/mockStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pastProjects = await store.getAllPastProjects();
    
    // Filter images to only include featured ones for public display
    const projectsWithFeaturedImages = pastProjects.map((project: PastProject) => ({
      ...project,
      selectedImages: project.selectedImages.filter(img => img.isFeatured),
    }));
    
    return NextResponse.json(projectsWithFeaturedImages, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error fetching past projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch past projects' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
