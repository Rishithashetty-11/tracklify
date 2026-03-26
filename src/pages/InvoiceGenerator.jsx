import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calculator, ArrowRight, Download, FileText, User, ArrowLeft, Loader2 } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function InvoiceGenerator() {
  const navigate = useNavigate();
  const [activeProjects, setActiveProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [fetchingProjects, setFetchingProjects] = useState(true);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/freelancer/projects');
        setActiveProjects(res.data);
      } catch (error) {
        toast.error('Failed to pull projects');
      } finally {
         setFetchingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Please select a project to generate an invoice for.');
      return;
    }

    setLoading(true);
    try {
      const project = activeProjects.find(p => String(p.id) === String(selectedProjectId) || String(p._id) === String(selectedProjectId));
      if (!project) {
        console.error("Project not found locally. Available projects: ", activeProjects, "Selected ID: ", selectedProjectId);
        throw new Error("Project not found locally");
      }

      const logsRes = await api.get(`/time/${selectedProjectId}`);
      const logs = logsRes.data || [];
      
      const totalSeconds = logs.reduce((acc, log) => acc + (log.duration || 0), 0);
      const totalHours = totalSeconds / 3600;
      const hourlyRate = project.hourlyRate || 0;
      const totalAmount = totalHours * hourlyRate;

      setPreview({
        id: project._id || project.id,
        project: project.projectTitle,
        client: 'Client Account',
        hourlyRate: hourlyRate.toFixed(2),
        totalHours: totalHours.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        date: new Date().toLocaleDateString()
      });
      toast.success('Invoice preview aggregated successfully!');
    } catch (error) {
      toast.error('Failed to compute invoice. Server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPreview = async () => {
    if (!preview || !preview.id) return;
    
    const toastId = toast.loading(`Creating Invoice #${preview.id}...`);
    try {
      // Call correct API to create invoice in backend
      await api.post('/create-invoice', {
        clientEmail: clientEmail || null,
        projectId: preview.id,
        hours: preview.totalHours,
        rate: preview.hourlyRate,
        amount: preview.totalAmount
      });
      
      // Also optionally construct PDF download if needed, but for now we just create it.
      toast.success(`Invoice created successfully!`, { id: toastId });
      navigate('/invoices');
    } catch (error) {
      toast.error('Failed to create invoice on server.', { id: toastId });
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate('/invoices')} className="p-2 bg-white rounded-full border border-gray-200 shadow-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Generate Invoice</h1>
          <p className="text-gray-500 text-sm mt-1">Select a project to securely fetch aggregated timesheets and generate a billing invoice.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Generator Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calculator size={18}/> Select Target Project</h2>
          </div>
          <form onSubmit={handleGenerate} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project to Invoice</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  {fetchingProjects ? <Loader2 size={16} className="animate-spin" /> : <Briefcase size={16} />}
                </div>
                <select 
                  className="input-field pl-10 py-3 text-sm appearance-none bg-white font-medium text-gray-700"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setPreview(null);
                  }}
                  disabled={fetchingProjects || loading}
                >
                  <option value="" disabled>Choose a tracked project...</option>
                  {activeProjects.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.projectTitle}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Email (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="email"
                  className="input-field pl-10 py-3 text-sm bg-white font-medium text-gray-700 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-400 transition-colors"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 border border-blue-100 rounded-xl text-sm leading-relaxed">
               <strong>Note:</strong> Generating this invoice will automatically fetch all time logged securely on the backend under the <code>/invoice/:projectId</code> route and aggregate the <strong>rate</strong> to compute the final total!
            </div>

            <button type="submit" disabled={loading || fetchingProjects} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary-500/30">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : <span className="flex items-center justify-center gap-2">Pull Invoice From Remote <ArrowRight size={18} /></span>}
            </button>
          </form>
        </div>

        {/* Preview Card */}
        {preview ? (
          <div className="bg-white rounded-2xl shadow-xl shadow-primary-500/10 border border-primary-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-primary-50 to-white">
               <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-white text-primary-600 rounded-2xl shadow-sm border border-primary-100">
                   <FileText size={28}/>
                 </div>
                 <div className="text-right">
                    <span className="text-xl font-black text-primary-900 tracking-tight">INV-{preview.id || Math.floor(Math.random()*1000)}</span>
                    <p className="text-xs font-semibold text-gray-500 mt-1 uppercase">{preview.date || new Date().toLocaleDateString()}</p>
                 </div>
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mt-2">{preview.title || preview.project || 'Exported Project'}</h3>
               <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 mt-2">
                 <User size={16} className="text-gray-400"/> Billed System: {preview.client || 'Client Account'}
               </p>
            </div>

            <div className="p-8 grid grid-cols-2 gap-6 flex-1 bg-white">
               <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Hours Logged</span>
                 <span className="text-2xl font-black text-gray-900">{preview.totalHours || preview.hours || 0}</span>
               </div>
               <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Hourly Rate</span>
                 <span className="text-2xl font-black text-gray-900">₹{preview.hourlyRate || preview.rate || 0}/hr</span>
               </div>
               <div className="col-span-2 flex justify-between items-center py-4 border-t border-gray-100 mt-2">
                 <span className="text-lg text-gray-900 font-bold uppercase tracking-wide">Total Amount Due</span>
                 <span className="text-4xl font-black text-primary-600">₹{(preview.totalAmount || preview.total || 0).toLocaleString()}</span>
               </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
               <button onClick={handleDownloadPreview} className="w-full btn-primary bg-gray-900 hover:bg-black py-4 shadow-xl shadow-gray-900/20 text-base flex items-center justify-center gap-2">
                 <FileText size={20} /> Generate & Send Invoice
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 p-8 text-center">
             <FileText size={48} className="mb-4 opacity-50" />
             <h3 className="text-lg font-bold text-gray-900 mb-1">No Invoice Remote Data</h3>
             <p className="text-sm">Select a project and click to remotely aggregate hours spanning all timesheets into an actionable invoice.</p>
          </div>
        )}
      </div>
    </div>
  );
}
