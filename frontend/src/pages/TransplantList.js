import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatDateTime } from '../utils/helpers';
import { FiActivity, FiUser, FiCalendar, FiClock, FiDownload, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import { FaHospital, FaUserMd } from 'react-icons/fa';

const TransplantList = () => {
  const [transplants, setTransplants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransplants();
  }, []);

  const fetchTransplants = async () => {
    try {
      const response = await api.get('/transplants');
      setTransplants(response.data.data);
    } catch (error) {
      toast.error('Failed to load transplants');
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeBadge = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'successful':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'complicated':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Transplant Records</h1>
          <p className="text-zinc-400 mt-1">History of all surgical procedures and outcomes.</p>
        </div>
        <button 
          onClick={() => toast.info('Export functionality coming soon!')}
          className="flex items-center justify-center gap-2 bg-[#18181b] text-zinc-300 border border-zinc-700 px-4 py-2.5 rounded-xl font-medium hover:text-white hover:bg-zinc-800 transition-all"
        >
          <FiDownload />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid gap-4">
        {transplants.map((transplant) => (
          <div key={transplant.id} className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all shadow-lg shadow-black/20 group">
             <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                
                {/* Main Info */}
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getOutcomeBadge(transplant.outcome)}`}>
                        {transplant.outcome === 'Successful' && <FiCheckCircle />}
                        {transplant.outcome === 'Failed' && <FiXCircle />}
                        {transplant.outcome === 'Complicated' && <FiAlertTriangle />}
                        {transplant.outcome}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                        <FiCalendar className="text-zinc-600" />
                        {formatDateTime(transplant.transplant_date)}
                      </span>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-8">
                      <div className="flex items-start gap-3">
                         <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 shrink-0">
                            <span className="font-bold text-xs uppercase text-zinc-500">D</span>
                         </div>
                         <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Donor</p>
                            <p className="font-semibold text-white">{transplant.donor?.full_name}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{transplant.donor?.blood_type}</p>
                         </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-center text-zinc-700">
                         <FiActivity size={20} />
                      </div>

                      <div className="flex items-start gap-3">
                         <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 shrink-0">
                            <span className="font-bold text-xs uppercase text-zinc-500">R</span>
                         </div>
                         <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Recipient</p>
                            <p className="font-semibold text-white">{transplant.recipient?.full_name}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{transplant.recipient?.blood_type}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:text-right border-t lg:border-t-0 lg:border-l border-zinc-800 pt-4 lg:pt-0 lg:pl-6">
                    <div className="flex items-center lg:justify-end gap-2 text-zinc-400">
                       <FaHospital className="text-zinc-600" />
                       <span className="text-sm">{transplant.hospital?.name}</span>
                    </div>
                    <div className="hidden xl:block w-px h-4 bg-zinc-800"></div>
                    <div className="flex items-center lg:justify-end gap-2 text-zinc-400">
                       <FaUserMd className="text-zinc-600" />
                       <span className="text-sm">Dr. {transplant.doctor?.full_name}</span>
                    </div>
                    <div className="hidden xl:block w-px h-4 bg-zinc-800"></div>
                     <div className="flex items-center lg:justify-end gap-2 text-zinc-400">
                       <FiClock className="text-zinc-600" />
                       <span className="text-sm">{transplant.surgery_duration_hours ? `${transplant.surgery_duration_hours} hrs` : 'N/A'}</span>
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransplantList;
