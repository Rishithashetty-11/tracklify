import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function FreelancerList() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [hiring, setHiring] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/freelancers${skillFilter ? `?skill=${skillFilter}` : ''}`);
      setFreelancers(res.data);
    } catch (error) {
      toast.error('Failed to fetch freelancers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFreelancers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillFilter]);

  const handleHire = async (freelancerId) => {
    if (!projectTitle.trim()) {
      return toast.error('Please enter a project title');
    }
    try {
      await api.post('/hire', { freelancerId, projectTitle });
      toast.success('Freelancer hired successfully!');
      setHiring(null);
      setProjectTitle('');
    } catch (error) {
      toast.error('Failed to hire freelancer');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Freelancers</h1>
          <p className="text-gray-500 mt-1">Discover and hire top talent for your projects</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Filter by skill (e.g. React)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No freelancers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((freelancer) => (
            <div key={freelancer._id} className="bg-white rounded-xl p-6 shadow-card hover:shadow-lg transition-all border border-gray-100 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {freelancer.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {freelancer.email.split('@')[0]}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-1">{freelancer.email}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
                  {freelancer.bio || 'This freelancer has not provided a bio yet.'}
                </p>
                
                <div className="mb-6 flex flex-wrap gap-2">
                  {freelancer.skills && freelancer.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-100">
                      {skill}
                    </span>
                  ))}
                  {(!freelancer.skills || freelancer.skills.length === 0) && (
                    <span className="text-gray-400 text-xs italic mt-1">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                {hiring === freelancer._id ? (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Project Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Website Redesign"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleHire(freelancer._id)}
                        className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setHiring(null); setProjectTitle(''); }}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setHiring(freelancer._id)}
                    className="w-full bg-primary-50 text-primary-700 py-2.5 rounded-lg font-medium hover:bg-primary-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Hire Freelancer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
