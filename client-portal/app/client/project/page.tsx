import ProjectLookupForm from '@/components/client/ProjectLookupForm';
import Link from 'next/link';

export default function ProjectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-normal text-black mb-2">Your Project</h1>
            <p className="text-sm text-site-gray-light">Enter your project code to view details</p>
          </div>
          <ProjectLookupForm />
          <div className="mt-6 text-center">
            <Link
              href="/admin"
              className="text-sm text-site-gray hover:text-black transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

