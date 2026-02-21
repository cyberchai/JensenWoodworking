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
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b border-stone-200">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Deposit</span>
          <span
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
              depositPaid
                ? 'bg-brass text-ebony'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            {depositPaid ? 'Paid' : 'Pending'}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-4 border-b border-stone-200">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Final Payment</span>
          <span
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
              finalPaid
                ? 'bg-brass text-ebony'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            {finalPaid ? 'Paid' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div className="group p-8 border border-stone-200 hover:border-brass transition-all bg-white rounded-sm shadow-sm">
          <h4 className="font-serif text-2xl text-ebony mb-4">PayPal</h4>
          <p className="text-stone-400 text-sm mb-8 italic">Preferred for international transactions.</p>
          <a 
            href={`https://www.paypal.com/paypalme/${paypalHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-4 bg-stone-50 text-ebony text-[10px] font-black uppercase tracking-widest border border-transparent group-hover:bg-ebony group-hover:text-white transition-all"
          >
            Proceed to PayPal
          </a>
        </div>
        <div className="group p-8 border border-stone-200 hover:border-brass transition-all bg-white rounded-sm shadow-sm">
          <h4 className="font-serif text-2xl text-ebony mb-4">Venmo</h4>
          <p className="text-stone-400 text-sm mb-8 italic">Best for domestic payments.</p>
          <a 
            href={`https://account.venmo.com/u/${venmoHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-4 bg-stone-50 text-ebony text-[10px] font-black uppercase tracking-widest border border-transparent group-hover:bg-ebony group-hover:text-white transition-all"
          >
            Open Venmo
          </a>
        </div>
      </div>
      
      <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center">
        Please include your project name in the payment note.
      </p>
    </div>
  );
}

