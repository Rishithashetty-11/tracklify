import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XCircle, RefreshCcw, Home } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-red-50 transform transition-all relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>
        
        <div className="p-8 text-center pt-10">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-25"></div>
            <XCircle className="h-12 w-12 text-red-600 relative z-10" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-lg text-gray-500 mb-8">
            We couldn't process your payment. Your account has not been charged.
          </p>

          <div className="bg-orange-50/50 rounded-2xl p-5 mb-8 text-left border border-orange-100">
            <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wider mb-2">Common Reasons:</h3>
            <ul className="text-sm text-orange-700 space-y-1.5 list-disc list-inside">
              <li>Insufficient funds</li>
              <li>Incorrect card details</li>
              <li>Bank server down</li>
              <li>Network timeout</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/client-invoice/${id}`)}
              className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/30 transition-all hover:-translate-y-0.5"
            >
              <RefreshCcw className="mr-2 h-5 w-5" /> Try Payment Again
            </button>
            <button
              onClick={() => navigate('/client-dashboard')}
              className="w-full flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Home className="mr-2 h-5 w-5" /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
