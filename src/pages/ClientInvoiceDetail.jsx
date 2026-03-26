import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, IndianRupee, Clock, CheckCircle, Activity, CreditCard, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ClientInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const loadRazorpayCore = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchInvoiceDetails = async () => {
    try {
      const response = await api.get('/client/invoices');
      const inv = response.data.find(i => i._id === id);
      if (inv) setInvoice(inv);
      else toast.error("Invoice not found");
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast.error("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const resLoaded = await loadRazorpayCore();
      if (!resLoaded) {
        toast.error("Razorpay SDK failed to load.");
        setPaying(false);
        return;
      }

      // Create Order
      const orderRes = await api.post('/create-order', { invoiceId: invoice._id, amount: invoice.totalAmount });
      const { id: order_id, amount, currency } = orderRes.data;

      const options = {
        key: 'rzp_test_zH4D5Q2G8WwK9O', // using mock/test key, preferably should be in ENV
        amount: amount.toString(),
        currency: currency,
        name: 'Tracklify',
        description: `Payment for Invoice ${invoice._id}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            const verification = await api.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceId: invoice._id
            });
            if (verification.data.message === "Payment verified successfully") {
              toast.success("Payment Successful!");
              fetchInvoiceDetails(); // reload to show PAID status
            }
          } catch (err) {
            toast.error("Payment verification failed.");
            console.error(err);
          }
        },
        prefill: {
          name: "Client Name",
          email: "client@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Could not initiate payment. Please try again later.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Activity className="animate-spin text-primary-500" /></div>;
  }

  if (!invoice) return <div>Invoice not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} className="mr-1" /> Back to Invoices
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
            <p className="text-gray-500 mt-1">ID: {invoice._id}</p>
          </div>
          <div>
            {invoice.status === 'PAID' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                <CheckCircle size={18} /> PAID
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <Clock size={18} /> UNPAID
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 border-y border-gray-100 py-6">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
            <p className="font-medium text-gray-900">{new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Project ID</p>
            <p className="font-medium text-gray-900">{invoice.projectId}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-3 border-b border-gray-50">
            <span className="text-gray-600">Total Hours</span>
            <span className="font-semibold text-gray-900">{invoice.totalHours.toFixed(2)} hrs</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-50">
            <span className="text-gray-600">Hourly Rate</span>
            <span className="font-semibold text-gray-900">₹{invoice.hourlyRate.toFixed(2)} / hr</span>
          </div>
          <div className="flex justify-between py-4 text-xl font-bold bg-gray-50 px-4 rounded-xl">
            <span className="text-gray-900">Total Amount</span>
            <span className="text-primary-600">₹{invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {invoice.status === 'UNPAID' && (
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handlePayment} 
              disabled={paying}
              className="btn-primary shadow-lg shadow-primary-500/30 px-8 py-3 text-lg flex items-center gap-2"
            >
              {paying ? <Activity className="animate-spin" size={20} /> : <CreditCard size={20} />}
              {paying ? 'Processing...' : 'Pay Now with Razorpay'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
