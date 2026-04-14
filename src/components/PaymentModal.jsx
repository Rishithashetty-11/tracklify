import React, { useState } from 'react';
import { X, CreditCard, Building, Smartphone, CheckCircle2, Activity } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, amount, onProceed, paying }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');

  if (!isOpen) return null;

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI / QR',
      description: 'Google Pay, PhonePe, Paytm, etc.',
      icon: <Smartphone className="text-emerald-500 w-6 h-6" />,
      tag: 'Recommended'
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      description: 'Visa, Mastercard, RuPay & more',
      icon: <CreditCard className="text-blue-500 w-6 h-6" />
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks supported',
      icon: <Building className="text-indigo-500 w-6 h-6" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all"
        role="dialog" 
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tracklify Checkout</h3>
            <p className="text-sm text-gray-500 mt-0.5">Secure payment processing</p>
          </div>
          <button 
            onClick={onClose}
            disabled={paying}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
            <span className="text-primary-800 font-medium">Amount to Pay</span>
            <span className="text-2xl font-bold text-primary-900">₹{amount.toFixed(2)}</span>
          </div>

          <p className="text-sm font-semibold text-gray-500 mb-4 px-1 uppercase tracking-wider">Select Payment Method</p>
          
          <div className="space-y-3 mb-6">
            {paymentMethods.map((method) => (
              <label 
                key={method.id} 
                className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                  selectedMethod === method.id 
                    ? 'border-primary-500 bg-primary-50/30 shadow-sm' 
                    : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className="flex-shrink-0 mr-4">
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`font-semibold ${selectedMethod === method.id ? 'text-primary-900' : 'text-gray-900'}`}>
                      {method.name}
                    </span>
                    {method.tag && (
                      <span className="ml-3 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 rounded-full">
                        {method.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-primary-500' : 'border-gray-300'}`}>
                    {selectedMethod === method.id && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                  </div>
                </div>
                <input 
                  type="radio" 
                  name="payment_method" 
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>

          {/* Footer actions */}
          <button
            onClick={() => onProceed(selectedMethod)}
            disabled={paying}
            className="w-full btn-primary py-3.5 rounded-xl shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 text-lg font-medium transition-all hover:shadow-primary-500/40"
          >
            {paying ? (
              <>
                <Activity className="animate-spin w-5 h-5" /> Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Proceed to Pay ₹{amount.toFixed(2)}
              </>
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center font-serif text-[10px] text-gray-500 font-bold">✓</span>
            Secure encrypted payment powered by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}
