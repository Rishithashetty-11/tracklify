import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, FileText, CheckCircle, CreditCard, Building2, Smartphone, AlertCircle } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment State
  const [status, setStatus] = useState('Unpaid');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (error) {
        setProject({ id, title: 'Premium SaaS Design', client: 'Stark Ind.', description: 'Full stack development of core modules.', budget: '₹4,500', date: new Date().toLocaleDateString() });
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDownload = () => {
    setDownloading(true);
    try {
      if (project) {
        generateInvoicePDF(project);
        toast.success('Invoice downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const handlePayment = (method) => {
    setProcessing(true);
    // Simulate network delay
    setTimeout(() => {
      setStatus('Paid');
      setProcessing(false);
      toast.success(`Payment successful via ${method}!`);
    }, 1500);
  };

  const handleMarkAsPaid = () => {
    setStatus('Paid');
    toast.success('Invoice marked as Paid!');
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : (
        <div className="space-y-8">
           {/* Invoice Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 sm:p-10 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-[100px] -z-10"></div>
              <div className="flex items-center gap-5 z-10">
                <div className="bg-primary-50 text-primary-600 p-4 rounded-xl shadow-sm">
                  <FileText size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
                  <p className="text-sm text-gray-500 mt-1 font-medium">INV-{id?.substring(0,8) || '001'} • {project?.date || new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary !px-6 !py-3 shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40 text-base z-10"
              >
                {downloading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Download size={20} className="mr-2" />
                    Download Invoice PDF
                  </>
                )}
              </button>
            </div>
            
            <div className="p-8 sm:p-10 bg-gray-50/50">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-lg font-bold text-gray-900">Project Information</h2>
                 <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-500 ${status === 'Paid' ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-red-100 text-red-700 ring-1 ring-red-600/20'}`}>
                    {status === 'Paid' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                    {status.toUpperCase()}
                 </span>
              </div>
              
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                <div className="col-span-1 sm:col-span-2">
                  <dt className="text-sm font-semibold text-gray-500">Project Title</dt>
                  <dd className="mt-1.5 text-lg text-gray-900 font-semibold">{project.title || project.name}</dd>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <dt className="text-sm font-semibold text-gray-500">Description</dt>
                  <dd className="mt-2 text-sm text-gray-700 bg-white p-5 rounded-xl border border-gray-200 shadow-sm leading-relaxed">{project.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Total Budget / Amount Due</dt>
                  <dd className="mt-1.5 text-3xl font-black text-gray-900 tracking-tight">{project.budget || '₹0'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Client</dt>
                  <dd className="mt-2 text-base text-gray-900 font-semibold">{project.client || 'Unknown Client'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-700 ${status === 'Paid' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
             <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CreditCard size={20}/> Payment Methods</h2>
                {status !== 'Paid' && (
                  <button onClick={handleMarkAsPaid} className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                     Mark as Paid Manually
                  </button>
                )}
             </div>

             <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  onClick={() => handlePayment('UPI')}
                  disabled={processing || status === 'Paid'}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300 group"
                >
                   <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                     <Smartphone size={28} />
                   </div>
                   <span className="font-bold text-gray-900">Pay via UPI</span>
                </button>

                <button 
                  onClick={() => handlePayment('Card')}
                  disabled={processing || status === 'Paid'}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 hover:-translate-y-1 transition-all duration-300 group"
                >
                   <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                     <CreditCard size={28} />
                   </div>
                   <span className="font-bold text-gray-900">Pay via Card</span>
                </button>

                <button 
                  onClick={() => handlePayment('Net Banking')}
                  disabled={processing || status === 'Paid'}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 hover:-translate-y-1 transition-all duration-300 group"
                >
                   <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                     <Building2 size={28} />
                   </div>
                   <span className="font-bold text-gray-900">Net Banking</span>
                </button>
             </div>

             {processing && (
               <div className="p-4 bg-blue-50 border-t border-blue-100 text-blue-700 flex items-center justify-center gap-3 font-semibold text-sm">
                 <Loader2 className="animate-spin" size={18} /> Securely processing your payment...
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
