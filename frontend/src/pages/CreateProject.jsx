import React, { useState } from 'react';
import { Loader2, Briefcase, AlignLeft, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', hourlyRate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.hourlyRate) {
      return toast.error('Please fill in all fields');
    }

    setLoading(true);
    try {
      await api.post('/projects', formData);
      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Project</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new project to your workspace.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Briefcase size={18} />
              </div>
              <input
                type="text"
                className="input-field pl-10 py-2.5 text-base"
                placeholder="e.g. Website Redesign"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-gray-400">
                <AlignLeft size={18} />
              </div>
              <textarea
                rows={4}
                className="input-field pl-10 py-3 text-base"
                placeholder="Describe the project scope and deliverables..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <DollarSign size={18} />
              </div>
              <input
                type="text"
                className="input-field pl-10 py-2.5 text-base"
                placeholder="e.g. 5000"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-4">
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary py-2.5" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary min-w-[140px] py-2.5 shadow-lg shadow-primary-500/25" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
