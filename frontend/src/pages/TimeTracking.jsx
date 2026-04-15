import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Plus, Briefcase, ListTodo, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function TimeTracking() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const [projectId, setProjectId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [activeProjectId, setActiveProjectId] = useState('');
  const [activeStartTime, setActiveStartTime] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch projects for dropdown
    api.get('/freelancer/projects').then(res => setProjects(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = async () => {
    if (!isRunning) {
      if (!activeProjectId) {
        return toast.error("Please select a project before starting the timer");
      }
      setActiveStartTime(new Date().toISOString());
      setIsRunning(true);
      toast.success("Timer started!");
    } else {
      // stopping time
      const endTimeString = new Date().toISOString();
      setIsRunning(false);
      setActiveLoading(true);
      
      try {
        const res = await api.post("/time", {
          projectId: activeProjectId,
          startTime: activeStartTime,
          endTime: endTimeString
        });
        setTimeLogs([res.data, ...timeLogs]);
        toast.success(`Logged ${formatTime(elapsedSeconds)} successfully!`);
        setElapsedSeconds(0);
        setActiveStartTime(null);
      } catch (error) {
        toast.error("Failed to save time log");
      } finally {
        setActiveLoading(false);
      }
    }
  };

  const handleAddHours = async (e) => {
    e.preventDefault();
    if (!projectId || !startTime || !endTime) {
      return toast.error('Please select a project, start time, and end time');
    }
    
    setLoading(true);
    try {
      const res = await api.post("/time", {
        projectId,
        startTime,
        endTime
      });
      
      setTimeLogs([res.data, ...timeLogs]);
      setStartTime('');
      setEndTime('');
      toast.success('Time logged successfully!');
    } catch (error) {
       toast.error('Failed to log time');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Time Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">Log your billable hours manually mapping to actual backend fields.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          {/* Active Timer Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clock size={18}/> Live Timer (UI Demo)</h2>
            </div>
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-full mb-6">
                 <select 
                   className="input-field w-full py-2.5 px-4 text-sm appearance-none bg-white font-medium text-gray-700 border border-gray-200 rounded-xl"
                   value={activeProjectId}
                   onChange={(e) => setActiveProjectId(e.target.value)}
                   disabled={isRunning || activeLoading}
                 >
                   <option value="" disabled>Select a project</option>
                   {projects.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.projectTitle}</option>)}
                 </select>
              </div>
              <div className="w-40 h-40 rounded-full border-4 border-gray-50 flex items-center justify-center mb-6 relative shadow-inner">
                 {isRunning && (
                   <div className="absolute inset-[-4px] rounded-full border-4 border-primary-500 border-t-transparent animate-spin-slow" style={{ animationDuration: '3s' }}></div>
                 )}
                 <span className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">
                   {formatTime(elapsedSeconds)}
                 </span>
              </div>
              <div className="w-full flex gap-3">
                <button 
                  onClick={handleToggleTimer} 
                  disabled={activeLoading}
                  className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${(isRunning || activeLoading) ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30'} disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                  {activeLoading ? <Loader2 className="animate-spin" size={20} /> : isRunning ? <><Square size={20}/> Save & Stop</> : <><Play size={20}/> {elapsedSeconds > 0 ? 'Resume' : 'Start Timer'}</>}
                </button>

                {elapsedSeconds > 0 && !isRunning && (
                  <button 
                    onClick={() => { setElapsedSeconds(0); setIsRunning(false); setActiveStartTime(null); }} 
                    className="px-5 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    Discard
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Manual Entry Section aligned with backend schema */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus size={18}/> Log Time Entry</h2>
            </div>
            <form onSubmit={handleAddHours} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Briefcase size={16} />
                  </div>
                  <select 
                    className="input-field pl-10 py-2.5 text-sm appearance-none bg-white font-medium text-gray-700"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.projectTitle}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="datetime-local"
                    className="input-field pl-10 py-2.5 text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="datetime-local"
                    className="input-field pl-10 py-2.5 text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2">
                 {loading ? <Loader2 className="animate-spin" size={16}/> : <><Plus size={16} /> Log Time securely</>}
              </button>
            </form>
          </div>
        </div>

        {/* History Log */}
        <div className="xl:col-span-2">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                 <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ListTodo size={18}/> Logged API Requests</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                 {timeLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                       <Clock size={40} className="mb-4 opacity-50" />
                       <p className="text-sm font-medium">No valid time logged to backend yet.</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {timeLogs.map((log, i) => (
                          <div key={i} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm font-bold text-gray-900">Project ID: {log.projectId}</p>
                                <p className="text-xs text-gray-600 font-medium font-mono bg-gray-200 p-2 rounded">Start: {log.startTime}</p>
                                <p className="text-xs text-gray-600 font-medium font-mono bg-gray-200 p-2 rounded">End: {log.endTime}</p>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
