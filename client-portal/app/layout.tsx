import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { LogOut } from '@/components/icons';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: 'Jensen Woodworking - Client Portal',
  description: 'View and manage your custom woodworking project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brass selection:text-white">
        <AuthProvider>
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex flex-wrap justify-between items-center gap-3 min-h-16 sm:min-h-20 py-3 sm:py-0 sm:h-20">
              <Link 
                href="/"
                className="flex items-center group min-w-0 flex-shrink-0"
              >
                <div className="p-1.5 sm:p-[10px] rounded-sm transition-all group-hover:opacity-80">
                  <img 
                    src="/images/logo.png" 
                    alt="Jensen Woodworking" 
                    className="h-8 sm:h-12 w-auto"
                  />
                </div>
                <div className="ml-2 sm:ml-4 flex flex-col min-w-0">
                  <span className="text-base sm:text-xl font-serif font-bold tracking-widest text-ebony leading-none uppercase truncate">Jensen Woodworking</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-brass font-bold">Custom Woodworking</span>
                </div>
              </Link>
              
              <div className="flex items-center shrink-0">
                <Link
                  href="/"
                  className="flex items-center text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors py-2 min-h-[44px] items-center"
                >
                  <LogOut size={14} className="mr-2" />
                  Home
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-stone-50 border-t border-stone-200 py-8 sm:py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
            <p className="font-serif italic text-stone-400 text-sm sm:text-lg mb-4 max-w-full">Premium nordic woodworking from New England.</p>
            <div className="text-[10px] uppercase tracking-[0.4em] text-stone-300">
              Est. 1994 &bull; Duxbury, Massachusetts
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

