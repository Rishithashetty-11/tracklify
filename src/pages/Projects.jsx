import React, { useState, useEffect } from 'react';
import { Loader2, Briefcase, FileText, IndianRupee, Trash2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State aligns with /projects payload
  const [formData, setFormData] = useState({ projectTitle: '', description: '', hourlyRate: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      console.log("Projects API Response:", res.data);
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to load projects from server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.projectTitle || !formData.description || !formData.hourlyRate) {
      return toast.error('Please fill in all fields');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/projects', {
        projectTitle: formData.projectTitle,
        description: formData.description,
        hourlyRate: formData.hourlyRate
      });
      setProjects([res.data, ...projects]);
      setFormData({ projectTitle: '', description: '', hourlyRate: '' });
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id && p._id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Projects Management</h1>
        <p className="text-gray-500 text-sm mt-1">Create new projects and manage your existing client workload.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Create Form Section */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <h2 className="text-lg font-bold text-gray-900">Add New Project</h2>
               <p className="text-xs text-gray-500 mt-1">Fill out the details below.</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Briefcase size={16} />
                  </div>
                  <input
                    type="text"
                    className="input-field pl-10 py-2.5 text-sm"
                    placeholder="e.g. Website Redesign"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <div className="relative">
                  <div className="absolute inset-y-0 top-3 left-0 pl-3.5 flex pointer-events-none text-gray-400">
                    <FileText size={16} />
                  </div>
                  <textarea
                    className="input-field pl-10 py-2.5 text-sm min-h-[80px]"
                    placeholder="e.g. Building the frontend..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hourly Rate</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <IndianRupee size={16} />
                  </div>
                  <input
                    type="number"
                    className="input-field pl-10 py-2.5 text-sm"
                    placeholder="e.g. 50"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 shadow-lg shadow-primary-500/25" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Project'}
              </button>
            </form>
          </div>
        </div>

        {/* Projects List Section */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full min-h-[300px] bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm p-8">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <FolderOpen size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No active projects</h3>
              <p className="mt-1 text-sm text-gray-500 text-center">Use the form to create your first project and it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id || project._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{project.projectTitle}</h3>
                      <p className="text-sm font-medium text-gray-500 mt-1.5 flex items-center gap-1.5 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(project.id || project._id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-colors opacity-0 group-hover:opacity-100 absolute top-4 right-4"
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hourly Rate</span>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-3.5 py-1.5 font-bold text-green-700 ring-1 ring-inset ring-green-600/20 text-sm">
                      ₹{project.hourlyRate}/hr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
