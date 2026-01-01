'use client';

interface PaymentPanelProps {
  depositPaid: boolean;
  finalPaid: boolean;
  venmoHandle: string;
  paypalHandle: string;
  projectName: string;
}

export default function PaymentPanel({
  depositPaid,
  finalPaid,
  venmoHandle,
  paypalHandle,
  projectName,
}: PaymentPanelProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-normal text-black mb-6">Payment Status</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <span className="text-sm font-normal text-site-gray uppercase">Deposit</span>
          <span
            className={`px-3 py-1 text-xs font-normal uppercase ${
              depositPaid
                ? 'bg-site-gold text-black'
                : 'bg-gray-200 text-site-gray'
            }`}
          >
            {depositPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <span className="text-sm font-normal text-site-gray uppercase">Final Payment</span>
          <span
            className={`px-3 py-1 text-xs font-normal uppercase ${
              finalPaid
                ? 'bg-site-gold text-black'
                : 'bg-gray-200 text-site-gray'
            }`}
          >
            {finalPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </div>

      <div className="pt-4 space-y-3">
        <a
          href={`https://venmo.com/u/${venmoHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group text-center"
        >
          <span className="relative z-10">Pay with Venmo</span>
          <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </a>
        <a
          href={`https://paypal.me/${paypalHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group text-center"
        >
          <span className="relative z-10">Pay with PayPal</span>
          <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </a>
      </div>

      <p className="text-xs text-site-gray-light pt-2">
        Use your project name in the payment note.
      </p>
    </div>
  );
}

