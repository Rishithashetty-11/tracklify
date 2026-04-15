import React, { useState, useEffect } from 'react';
import { IndianRupee, Briefcase, Clock, AlertCircle, Loader2, Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, notifRes] = await Promise.all([
        api.get('/project/freelancer/projects'),
        api.get('/notifications')
      ]);
      setProjects(projRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/project/${id}/${action}`);
      toast.success(`Project ${action}ed successfully!`);
      fetchData();
    } catch (error) {
       toast.error(`Failed to ${action} project.`);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  const unreadNotifs = notifications.filter(n => !n.isRead);
  const activeProjects = projects.filter(p => p.status === 'active');
  const pendingProjects = projects.filter(p => p.status === 'pending');

  const stats = [
    { label: 'Total Earnings', value: '₹12,450', icon: IndianRupee, trend: '+14%', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Projects', value: activeProjects.length, icon: Briefcase, trend: '+2', color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Pending Invitations', value: pendingProjects.length, icon: AlertCircle, trend: 'Action Needed', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Hours', value: '164h', icon: Clock, trend: '+5%', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Freelancer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your projects, invitations, and notifications.</p>
        </div>
        <div className="relative">
          <Bell className="text-gray-500" size={24} />
          {unreadNotifs.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadNotifs.length}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {pendingProjects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-500" size={20}/> Action Required: Project Invitations
              </h2>
              <div className="space-y-4">
                {pendingProjects.map(proj => (
                  <div key={proj._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{proj.projectTitle}</p>
                      <p className="text-xs text-gray-600 mt-1">From Client: {proj.clientId?.email || 'Unknown Client'}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      <button onClick={() => handleAction(proj._id, 'accept')} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                        <Check size={16}/> Accept
                      </button>
                      <button onClick={() => handleAction(proj._id, 'reject')} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                        <X size={16}/> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="text-primary-500" size={20}/> Active Projects
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-500" size={24} /></div>
              ) : activeProjects.length === 0 ? (
                <p className="text-gray-500 text-sm p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">No active projects found.</p>
              ) : (
                activeProjects.map((project) => (
                  <div key={project._id} className="p-4 bg-white hover:bg-gray-50/50 rounded-xl border border-gray-200 flex justify-between items-center transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{project.projectTitle}</p>
                      <p className="text-xs text-gray-500 mt-1">Client: {project.clientId?.email || 'Unknown Client'}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">Active</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full min-h-[400px]">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="text-primary-500" size={20}/> Notifications
              </h2>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                 <p className="text-gray-500 text-sm py-4 border-2 border-dashed border-gray-200 rounded-xl text-center">No notifications yet.</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div key={n._id} onClick={() => !n.isRead && markRead(n._id)} className={`p-4 rounded-xl border hover:-translate-y-0.5 transition-all ${n.isRead ? 'bg-white border-gray-100 opacity-70' : 'bg-primary-50 border-primary-100 cursor-pointer hover:bg-primary-100/50 shadow-sm'}`}>
                    <div className="flex items-start gap-3">
                      {!n.isRead && <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>}
                      <div>
                        <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-primary-900 font-semibold'}`}>{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
