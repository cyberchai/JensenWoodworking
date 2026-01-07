import Link from 'next/link';

export default function FeedbackSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="bg-white border border-gray-200 p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-site-gold flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-normal text-black mb-2">
              Thank You!
            </h1>
            <p className="text-site-gray-light">
              Your feedback has been submitted successfully.
            </p>
          </div>
          <Link
            href="/client/project"
            className="relative inline-block bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group"
          >
            <span className="relative z-10">Back to Project Lookup</span>
            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
        </div>
      </div>
    </div>
  );
}

