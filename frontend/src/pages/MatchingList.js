import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';
import { FiCheckCircle, FiXCircle, FiActivity, FiUser, FiCalendar, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { FaHeartbeat, FaHandHoldingMedical } from 'react-icons/fa';

const MatchingList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matchings, setMatchings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchings();
  }, []);

  const fetchMatchings = async () => {
    try {
      const response = await api.get('/matchings');
      setMatchings(response.data.data);
    } catch (error) {
      toast.error('Failed to load matchings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/matchings/${id}/approve`, { approval_status: 'approved' });
      toast.success('Match approved successfully');
      fetchMatchings();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve match';
      toast.error(errorMessage);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/matchings/${id}/approve`, { approval_status: 'rejected' });
      toast.success('Match rejected');
      fetchMatchings();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reject match';
      toast.error(errorMessage);
    }
  };

  // Helper for dynamic score coloring
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-indigo-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreProgressColor = (score) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-indigo-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Organ Matching
          </h1>
          <p className="text-zinc-400 mt-1">Manage and review potential donor-recipient compatibility records.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={fetchMatchings} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 transition flex items-center gap-2">
                 <FiRefreshCw />
                 <span className="text-sm font-medium">Refresh</span>
             </button>
            <div className="px-4 py-2 bg-[#18181b] border border-zinc-700 rounded-xl text-sm text-zinc-400 flex items-center gap-2">
                Total Matches: <span className="text-white font-bold">{matchings.length}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {matchings.length === 0 ? (
          <div className="text-center py-24 bg-[#18181b] rounded-2xl border border-zinc-800 border-dashed">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-700 border border-zinc-800">
                <FiActivity size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No matches found</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-6">There are currently no generated matches to review. Run the algorithm to check for new compatibility.</p>
            <button 
                onClick={() => navigate('/recipients')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all"
            >
                Run Matching Algorithm
            </button>
          </div>
        ) : (
          matchings.map((match) => (
            <div key={match.id} className="group bg-[#18181b] rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-all duration-300 overflow-hidden relative shadow-lg shadow-black/20">
              {/* Top border accent line based on status */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                  match.approval_status === 'approved' ? 'bg-emerald-500' : 
                  match.approval_status === 'rejected' ? 'bg-rose-500' : 'bg-zinc-700'
              }`}></div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-8">
                  
                  {/* Connection Visual */}
                  <div className="flex items-center flex-1 w-full">
                      {/* Donor */}
                      <div className="flex-1 min-w-[140px]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">Donor</span>
                          </div>
                          <h4 className="text-xl font-bold text-white truncate mb-1">{match.donor?.full_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-zinc-500">
                             <span className="font-semibold text-zinc-400">{match.donor?.blood_type}</span>
                             <span>•</span>
                             <span>Age: {new Date().getFullYear() - new Date(match.donor?.date_of_birth).getFullYear()}</span>
                          </div>
                      </div>

                      {/* Arrow / Organ Icon */}
                      <div className="px-4 md:px-12 flex flex-col items-center justify-center relative">
                         <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-800 -z-10"></div>
                         <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-indigo-500 mb-2 border border-zinc-700 shadow-lg z-10">
                             <FaHeartbeat size={20} />
                         </div>
                         <span className="hidden md:block text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-[#18181b] px-2 z-10">{match.organ?.organ_type || 'Organ'}</span>
                      </div>

                      {/* Recipient */}
                       <div className="flex-1 min-w-[140px] text-right">
                          <div className="flex items-center gap-2 mb-2 justify-end">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">Recipient</span>
                          </div>
                          <h4 className="text-xl font-bold text-white truncate mb-1">{match.recipient?.full_name}</h4>
                           <div className="flex items-center gap-2 text-sm text-zinc-500 justify-end">
                             <span className="font-semibold text-zinc-400">{match.recipient?.blood_type}</span>
                             <span>•</span>
                             <span className="capitalize">{match.recipient?.priority} Priority</span>
                          </div>
                      </div>
                  </div>

                  {/* Score & Status Panel */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 min-w-[320px]">
                      <div className="text-center sm:text-left min-w-[100px]">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Compatibility</span>
                          <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(match.compatibility_score)}`}>{match.compatibility_score}</span>
                              <span className="text-sm text-zinc-500 font-medium">%</span>
                          </div>
                      </div>
                      
                      <div className="h-px sm:h-12 w-full sm:w-px bg-zinc-800"></div>

                      <div className="flex flex-col gap-2 w-full">
                          <div className="flex justify-between text-xs text-zinc-400 font-medium uppercase tracking-wide">
                              <span>Match Quality</span>
                              <span className="text-white capitalize">{match.compatibility_status}</span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${getScoreProgressColor(match.compatibility_score)} shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
                                style={{ width: `${match.compatibility_score}%` }}
                              ></div>
                          </div>
                      </div>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-zinc-800/50 gap-4 mt-auto">
                    <div className="flex items-center gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex items-center gap-2 text-sm text-zinc-400 whitespace-nowrap">
                            <FiCalendar className="text-zinc-600" />
                            <span>Matched on <span className="text-zinc-300">{formatDateTime(match.match_date)}</span></span>
                        </div>
                        <div className="w-px h-4 bg-zinc-800 hidden md:block"></div>
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                             <span className="text-zinc-500">Status:</span>
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                                match.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                match.approval_status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                             }`}>
                               {match.approval_status}
                             </span>
                        </div>
                    </div>

                    {match.approval_status === 'pending' && user?.role === 'admin' ? (
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => handleReject(match.id)}
                          className="flex-1 md:flex-none px-5 py-2.5 text-sm font-medium text-zinc-400 bg-transparent hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-zinc-700 rounded-xl transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(match.id)}
                          className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle />
                          Approve Match
                        </button>
                      </div>
                    ) : match.approval_status === 'pending' && user?.role !== 'admin' ? (
                       <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                           <FiActivity className="text-amber-500 animate-pulse" />
                           <span className="text-xs text-zinc-400 italic">
                               Awaiting administrative approval
                           </span>
                       </div>
                    ) : (
                        <span className="text-sm font-medium flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 selection:bg-transparent">
                            {match.approval_status === 'approved' ? (
                                <>Processed <FiCheckCircle className="text-emerald-500" /></>
                            ) : (
                                <>Processed <FiXCircle className="text-rose-500" /></>
                            )}
                        </span>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchingList;