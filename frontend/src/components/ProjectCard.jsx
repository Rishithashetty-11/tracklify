import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText } from 'lucide-react';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div className="card flex flex-col h-full bg-white group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={project.title}>
            {project.title}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 whitespace-nowrap ring-1 ring-inset ring-green-600/20">
            <DollarSign size={14} />
            {project.budget}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-6 line-clamp-3">
          {project.description}
        </p>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => navigate(`/invoice/${project.id || project._id}`)}
          className="btn-secondary !py-1.5 !px-3 gap-2"
        >
          <FileText size={16} className="text-gray-400 group-hover/btn:text-primary-500" />
          <span className="font-semibold text-gray-700">Invoice</span>
        </button>
      </div>
    </div>
  );
}
