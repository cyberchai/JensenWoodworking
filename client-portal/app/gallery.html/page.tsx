import { readFileSync } from 'fs';
import { join } from 'path';

export default function GalleryPage() {
  try {
    const filePath = join(process.cwd(), 'public', 'nordic', 'gallery.html');
    let html = readFileSync(filePath, 'utf-8');
    
    // Fix asset paths to work from root
    html = html.replace(/href="css\//g, 'href="/css/');
    html = html.replace(/src="js\//g, 'src="/js/');
    html = html.replace(/src="images\//g, 'src="/images/');
    html = html.replace(/href="fonts\//g, 'href="/fonts/');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (error) {
    console.error('Error serving nordic gallery.html:', error);
    return <div>Error loading page</div>;
  }
}
