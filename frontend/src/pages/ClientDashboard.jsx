import React, { useState, useEffect } from 'react';
import { Users, FileText, IndianRupee, Activity, Briefcase } from 'lucide-react';
import api from '../services/api';

export default function ClientDashboard() {
  const [stats, setStats] = useState({
    totalFreelancers: 0,
    totalInvoices: 0,
    toBePaid: 0,
    activeProjects: 0
  });
  const [invoices, setInvoices] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [invoicesRes, projectsRes] = await Promise.all([
        api.get('/client/invoices'),
        api.get('/project/client/projects') 
      ]);
      
      const invs = invoicesRes.data;
      setInvoices(invs.slice(0, 5)); // recent 5

      const projs = projectsRes.data;
      setActiveProjects(projs);
      
      // Compute unique active freelancers from projects
      const uniqueFreelancers = new Set();
      projs.forEach(p => {
        if(p.freelancerId && p.status === 'active') uniqueFreelancers.add(p.freelancerId._id);
      });

      const toBePaid = invs.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.totalAmount, 0);

      setStats({
        totalFreelancers: uniqueFreelancers.size,
        totalInvoices: invs.length,
        toBePaid,
        activeProjects: projs.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Active Freelancers', value: stats.totalFreelancers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Invoices', value: stats.totalInvoices, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Active Projects', value: stats.activeProjects, icon: Briefcase, color: 'text-teal-600', bg: 'bg-teal-50' },
    { name: 'To Be Paid', value: `₹${stats.toBePaid.toFixed(2)}`, icon: IndianRupee, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Activity className="animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-transform duration-300">
              <div className="flex items-center gap-4 mb-2">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <Icon size={24} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 mt-0.5">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="text-primary-500" size={20}/> Engagements / Projects</h2>
          {activeProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">No active or pending projects yet.</p>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((p) => (
                <div key={p._id} className="p-4 bg-gray-50 hover:bg-gray-100/60 transition-colors border border-gray-100 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{p.projectTitle}</p>
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                       <Users size={12}/> Freelancer: {p.freelancerId?.email.split('@')[0] || 'Unknown'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md w-fit ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="text-indigo-500" size={20}/> Recent Invoices</h2>
          {invoices.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-500">No invoices generated yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-lg">Inv ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tr-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 border-l-2 border-transparent hover:border-primary-500">...{inv._id.substring(18)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-gray-900 text-right">₹{inv.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
