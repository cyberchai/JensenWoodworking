import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Your Project - Jensen Woodworking',
  description: 'View and manage your woodworking project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200 py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/client/project" className="text-xl font-normal text-black no-underline">
              <span className="block">Jensen</span>
              <span className="block">Woodworking</span>
            </Link>
            <div className="flex gap-6">
              <Link href="/client/project" className="text-sm text-site-gray hover:text-black uppercase transition-colors">
                Your Project
              </Link>
              <Link href="/admin" className="text-sm text-site-gray hover:text-black uppercase transition-colors">
                Admin
              </Link>
              <a href="../nordic/index.html" className="text-sm text-site-gray hover:text-black uppercase transition-colors">
                Main Site
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

