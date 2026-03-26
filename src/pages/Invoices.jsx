import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, User, Clock, IndianRupee, Plus, CheckCircle, AlertCircle, RefreshCw, Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
         document.body.removeChild(script);
      }
    }
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const role = localStorage.getItem('role');
      const endpoint = role === 'client' ? '/client/invoices' : '/freelancer/invoices';
      const res = await api.get(endpoint);
      setInvoices(res.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    navigate('/invoices/new');
  };

  const handleDownload = async (id) => {
    const toastId = toast.loading(`Preparing Invoice...`);
    try {
      const response = await api.get(`/invoice/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`Invoice downloaded successfully!`, { id: toastId });
    } catch (error) {
      toast.error('Failed to download invoice. Please try again.', { id: toastId });
    }
  };

  const handlePay = async (invoiceId) => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }
    if (paying) return;
    setPaying(true);
    const toastId = toast.loading('Initiating secure payment...');
    try {
      const res = await api.post('/create-order', { invoiceId });
      const order = res.data;

      const options = {
        key: 'rzp_test_mock', 
        amount: order.amount,
        currency: order.currency,
        name: 'Tracklify',
        description: 'Secure Invoice Payment',
        order_id: order.id,
        handler: async function (response) {
          toast.loading('Verifying payment signature...', { id: toastId });
          try {
            const verifyRes = await api.post('/verify-payment', response);
            if (verifyRes.data.success) {
               toast.success('Payment successful!', { id: toastId });
               fetchInvoices();
            } else {
               toast.error('Signature validation failed. Payment blocked.', { id: toastId });
            }
          } catch (e) {
             toast.error('Verification failed. Contact support.', { id: toastId });
          }
        },
        prefill: {
          name: localStorage.getItem('role') || 'Client',
          email: 'client@example.com' 
        },
        theme: { color: '#0ea5e9' }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error('Payment failed or was cancelled.', { id: toastId });
      });
      toast.dismiss(toastId);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment gateway', { id: toastId });
    } finally {
      setPaying(false);
    }
  };

  const toggleStatus = async (id) => {
    setInvoices(invoices.map(inv => {
      if (inv._id === id || inv.id === id) {
        const newStatus = inv.status === 'PAID' ? 'UNPAID' : 'PAID';
        if (newStatus === 'PAID') toast.success(`Invoice marked as Paid!`);
        else toast.success(`Invoice reverted to Unpaid.`);
        return { ...inv, status: newStatus };
      }
      return inv;
    }));
  };

  const isClient = localStorage.getItem('role') === 'client';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">Generate invoices and download PDFs for your clients.</p>
        </div>
        <button onClick={handleGenerate} className="btn-primary shadow-lg shadow-primary-500/25 shrink-0 flex items-center gap-2">
          <Plus size={18} /> Generate Invoice
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-full min-h-[300px] bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm p-8">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No invoices generated yet</h3>
          <p className="mt-1 text-sm text-gray-500 text-center">Use the generator to create your first invoice.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {invoices.map((inv) => (
            <div key={inv._id || inv.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              
              <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                 <div className="flex justify-between items-start mb-2">
                   <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                     <FileText size={20}/>
                   </div>
                   
                   <button 
                    onClick={() => !isClient && toggleStatus(inv._id || inv.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset shadow-sm hover:scale-105 active:scale-95 transition-all duration-500 ${
                     inv.status === 'PAID' ? 'bg-green-50 text-green-700 ring-green-600/30 shadow-green-500/20' : 'bg-red-50 text-red-700 ring-red-600/30 shadow-red-500/20'
                   }`}
                   title="Status"
                   disabled={isClient}
                   >
                     {inv.status === 'PAID' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                     {inv.status}
                   </button>
                 </div>
                 
                 <h3 className="text-lg font-bold text-gray-900 mt-4 line-clamp-1">{inv.projectId?.projectTitle || 'Unknown Project'}</h3>
                 <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                   <User size={14} className="text-gray-400"/> {inv.clientEmail || inv.clientId?.email || 'No Client Linked'}
                 </p>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                 <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center items-center border border-gray-100">
                   <span className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1"><Clock size={12}/> Hours</span>
                   <span className="text-lg font-bold text-gray-900 mt-0.5">{inv.totalHours || 0}h</span>
                 </div>
                 <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center items-center border border-gray-100">
                   <span className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1"><IndianRupee size={12}/> Rate</span>
                   <span className="text-lg font-bold text-gray-900 mt-0.5">₹{inv.hourlyRate || 0}/hr</span>
                 </div>
                 <div className="col-span-2 bg-primary-50 rounded-xl p-4 flex justify-between items-center border border-primary-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-bl-full"></div>
                   <span className="text-sm text-primary-700 font-bold uppercase tracking-wide z-10">Total Due</span>
                   <span className="text-2xl font-black text-primary-900 z-10">₹{(inv.totalAmount || 0).toLocaleString()}</span>
                 </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                 {isClient && inv.status === 'UNPAID' && (
                    <button 
                      onClick={() => handlePay(inv._id)}
                      disabled={paying}
                      className="btn-primary bg-indigo-600 hover:bg-indigo-700 font-bold flex-1 px-2 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors shadow-indigo-500/20 shadow-md"
                    >
                      {paying ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />} Pay Now
                    </button>
                 )}
                 <button 
                  onClick={() => handleDownload(inv.projectId?._id || inv.projectId || inv._id)} 
                  className="btn-secondary bg-white hover:bg-gray-50 flex-1 px-2 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm text-gray-700 border border-gray-200 uppercase font-semibold tracking-wider hover:border-gray-300"
                 >
                   <Download size={14} /> PDF
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
