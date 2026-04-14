import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, FileText } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform transition-all">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-lg text-gray-500 mb-8">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Transaction Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-2"><FileText size={16}/> Invoice ID</span>
                <span className="font-medium text-gray-900">...{id?.slice(-6) || 'N/A'}</span>
              </div>
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction Ref</span>
                  <span className="font-medium text-gray-900">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-green-600">PAID</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/client-invoice/${id}`)}
              className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/30 transition-all hover:-translate-y-0.5"
            >
              View Invoice Details <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/client-dashboard')}
              className="w-full flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
