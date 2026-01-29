'use client';

import { useState } from 'react';
import ProjectLookupForm from '@/components/client/ProjectLookupForm';
import Link from 'next/link';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ProjectPage() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is authorized admin
      if (!isAdminUser(user)) {
        // Sign out unauthorized user
        await auth.signOut();
        setError('Access denied. Only authorized administrators can access this dashboard.');
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-white">
      <div className="w-full max-w-2xl">
        <div className="bg-white border border-stone-100 rounded-sm p-6 sm:p-10 md:p-16 lg:p-24 text-center shadow-2xl">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 sm:mb-10 border border-stone-100 p-4">
            <img 
              src="/images/logo.png" 
              alt="Jensen Woodworking" 
              className="h-full w-auto"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-ebony mb-6 tracking-tight">Your Project</h2>
          
          {!showAdminLogin ? (
            <>
              <p className="text-stone-400 mb-8 sm:mb-12 max-w-lg mx-auto font-serif italic text-base sm:text-xl">
                Please enter your project code to view your project timeline and updates.
              </p>
              
              <ProjectLookupForm />
              
              <div className="mt-8 pt-8 border-t border-stone-100">
                <p className="text-stone-300 text-[10px] font-black uppercase tracking-widest mb-4">OR</p>
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="text-[11px] font-black uppercase tracking-widest text-stone-400 hover:text-brass transition-colors py-3 min-h-[44px] flex items-center justify-center"
                >
                  Sign in as Admin
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-stone-400 mb-8 max-w-sm mx-auto font-serif italic text-lg">
                Sign in with Google to access the admin dashboard.
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-ebony text-white font-black text-xs tracking-[0.3em] uppercase py-4 sm:py-6 min-h-[44px] hover:bg-brass transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-8"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowAdminLogin(false)}
                className="text-[11px] font-black uppercase tracking-widest text-stone-400 hover:text-brass transition-colors py-3 min-h-[44px] flex items-center justify-center"
              >
                ← Back to Project Lookup
              </button>
            </>
          )}
          
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-brass transition-colors inline-flex items-center min-h-[44px]"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

