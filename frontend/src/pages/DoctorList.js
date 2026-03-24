import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FiSearch, FiUserPlus, FiMoreVertical, FiPhone, FiAward } from 'react-icons/fi';
import { FaUserMd, FaHospital } from 'react-icons/fa';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.full_name.toLowerCase().includes(search.toLowerCase()) || 
    doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
    doc.hospital?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Medical Staff</h1>
          <p className="text-zinc-400 mt-1">Directory of registered specialists and surgeons.</p>
        </div>
        <button 
          onClick={() => toast.info('Please contact your administrator to add new staff.')}
          className="flex items-center justify-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <FiUserPlus />
          <span>Add Doctor</span>
        </button>
      </div>

       {/* Search */}
       <div className="relative">
          <FiSearch className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            className="w-full md:w-96 pl-10 pr-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            placeholder="Search doctors, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="group bg-[#18181b] border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-indigo-500/5 relative overflow-hidden">
             
             {/* Status Indicator */}
             <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-20 transition-opacity group-hover:opacity-30 blur-2xl ${doctor.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

             <div className="flex justify-between items-start mb-6 relative">
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-2xl border border-zinc-700 shadow-inner">
                        <FaUserMd />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{doctor.full_name}</h3>
                        <p className="text-indigo-400 font-medium text-sm mb-1">{doctor.specialization}</p>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            doctor.is_available 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${doctor.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                            {doctor.is_available ? 'Available' : 'Unavailable'}
                        </div>
                    </div>
                </div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <FiMoreVertical />
                </button>
             </div>

             <div className="space-y-3 relative">
                 <div className="flex items-center gap-3 text-sm text-zinc-400 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                     <FaHospital className="text-zinc-500" />
                     <span className="truncate">{doctor.hospital?.name}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                     <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/30">
                         <FiAward className="text-zinc-500" />
                         <span>{doctor.experience_years} Exp</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/30">
                         <span className="font-mono text-xs text-zinc-500">LIC:</span>
                         <span className="truncate">{doctor.license_number}</span>
                     </div>
                 </div>

                 <div className="flex items-center gap-3 text-sm text-zinc-400 px-2 mt-2">
                     <FiPhone className="text-zinc-600" />
                     <span>{doctor.contact_number}</span>
                 </div>
             </div>

             {/* Hover Action Strip */}
             <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
