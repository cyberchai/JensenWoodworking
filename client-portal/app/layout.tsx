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
        <header id="site-header" className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12 sm:h-14">
              <Link 
                href="/"
                className="flex items-center group min-w-0 flex-shrink-0"
              >
                <div className="p-1 rounded-sm transition-all group-hover:opacity-80">
                  <img 
                    src="/images/logo.png" 
                    alt="Jensen Woodworking" 
                    className="h-7 sm:h-9 w-auto"
                  />
                </div>
                <div className="ml-2 sm:ml-3 flex flex-col min-w-0">
                  <span className="text-sm sm:text-base font-serif font-bold tracking-widest text-ebony leading-none uppercase truncate">Jensen Woodworking</span>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-brass font-bold">Custom Woodworking</span>
                </div>
              </Link>
              
              <div className="flex items-center shrink-0">
                <Link
                  href="/"
                  className="flex items-center text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors"
                >
                  <LogOut size={12} className="mr-1.5" />
                  Home
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer id="site-footer" className="bg-stone-50 border-t border-stone-200 py-5 sm:py-6 mt-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-serif italic text-stone-400 text-xs sm:text-sm mb-2">Premium nordic woodworking from New England.</p>
            <div className="text-[9px] uppercase tracking-[0.3em] text-stone-300">
              Est. 1994 &bull; Duxbury, Massachusetts
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

