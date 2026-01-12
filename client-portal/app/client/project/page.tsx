import ProjectLookupForm from '@/components/client/ProjectLookupForm';
import Link from 'next/link';

export default function ProjectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-2xl">
        <div className="bg-white border border-stone-100 rounded-sm p-16 lg:p-24 text-center shadow-2xl">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-stone-100 p-4">
            <img 
              src="/images/logo.webp" 
              alt="Jensen Woodworking" 
              className="h-full w-auto"
            />
          </div>
          <h2 className="text-5xl font-serif text-ebony mb-6 tracking-tight">Your Project</h2>
          <p className="text-stone-400 mb-12 max-w-lg mx-auto font-serif italic text-xl">
            Please enter your project code to view your project timeline and updates.
          </p>
          
          <ProjectLookupForm />
          
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-brass transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

