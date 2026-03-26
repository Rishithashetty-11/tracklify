import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import Invoice from './pages/Invoice';
import Invoices from './pages/Invoices';
import InvoiceGenerator from './pages/InvoiceGenerator';
import TimeTracking from './pages/TimeTracking';
import ClientDashboard from './pages/ClientDashboard';
import ClientInvoices from './pages/ClientInvoices';
import ClientInvoiceDetail from './pages/ClientInvoiceDetail';
import FreelancerList from './pages/FreelancerList';
import Layout from './components/Layout';

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/" />;
  if (role && role !== userRole) return <Navigate to={userRole === 'client' ? '/client-dashboard' : '/dashboard'} />;
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'text-sm font-medium border border-gray-100 shadow-lg !rounded-lg',
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Freelancer Routes */}
        <Route path="/dashboard" element={<PrivateRoute role="freelancer"><Dashboard /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute role="freelancer"><Projects /></PrivateRoute>} />
        <Route path="/create-project" element={<PrivateRoute role="freelancer"><CreateProject /></PrivateRoute>} />
        <Route path="/time" element={<PrivateRoute role="freelancer"><TimeTracking /></PrivateRoute>} />
        <Route path="/invoices/new" element={<PrivateRoute role="freelancer"><InvoiceGenerator /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute role="freelancer"><Invoices /></PrivateRoute>} />
        <Route path="/invoice/:id" element={<PrivateRoute role="freelancer"><Invoice /></PrivateRoute>} />

        {/* Client Routes */}
        <Route path="/client-dashboard" element={<PrivateRoute role="client"><ClientDashboard /></PrivateRoute>} />
        <Route path="/freelancers" element={<PrivateRoute role="client"><FreelancerList /></PrivateRoute>} />
        <Route path="/client-invoices" element={<PrivateRoute role="client"><ClientInvoices /></PrivateRoute>} />
        <Route path="/client-invoice/:id" element={<PrivateRoute role="client"><ClientInvoiceDetail /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
