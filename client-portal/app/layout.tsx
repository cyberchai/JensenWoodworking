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
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex justify-between items-center h-20">
              <Link 
                href="/"
                className="flex items-center group"
              >
                <div className="p-2.5 rounded-sm transition-all group-hover:opacity-80">
                  <img 
                    src="/images/logo.png" 
                    alt="Jensen Woodworking" 
                    className="h-12 w-auto"
                  />
                </div>
                <div className="ml-4 flex flex-col">
                  <span className="text-xl font-serif font-bold tracking-widest text-ebony leading-none uppercase">Jensen Woodworking</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-brass font-bold">Custom Woodworking</span>
                </div>
              </Link>
              
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="flex items-center text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors"
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
        <footer className="bg-stone-50 border-t border-stone-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <p className="font-serif italic text-stone-400 text-lg mb-4">Premium nordic woodworking from New England.</p>
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

