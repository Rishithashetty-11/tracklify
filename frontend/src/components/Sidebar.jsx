import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Clock, FileText, Users } from 'lucide-react';

export default function Sidebar() {
  const role = localStorage.getItem('role');

  const links = role === 'client' ? [
    { name: 'Dashboard', to: '/client-dashboard', icon: LayoutDashboard },
    { name: 'Find Freelancers', to: '/freelancers', icon: Users },
    { name: 'Invoices', to: '/client-invoices', icon: FileText },
  ] : [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', to: '/projects', icon: Briefcase },
    { name: 'Time Tracking', to: '/time', icon: Clock },
    { name: 'Invoices', to: '/invoices', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Main Menu
        </div>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
