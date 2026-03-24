import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FiMapPin, FiPhone, FiMail, FiUsers, FiActivity, FiSearch, FiPlus } from 'react-icons/fi';
import { FaHospital } from 'react-icons/fa';

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/hospitals');
      setHospitals(response.data.data);
    } catch (error) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Partner Hospitals</h1>
          <p className="text-zinc-400 mt-1">Network of medical centers and organ exchange units.</p>
        </div>
        <button 
          onClick={() => toast.info('Please contact your administrator to add new hospitals.')}
          className="flex items-center justify-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <FiPlus />
          <span>Add Hospital</span>
        </button>
      </div>

       {/* Search */}
       <div className="relative">
          <FiSearch className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            className="w-full md:w-96 pl-10 pr-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            placeholder="Search hospitals, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="group bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-indigo-500/5 flex flex-col">
            
            {/* Header / Banner area */}
            <div className="h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 border-b border-zinc-700/50 relative p-6 flex items-end">
                 <div className="absolute top-4 right-4 text-zinc-700 opacity-20">
                     <FaHospital size={80} />
                 </div>
                 <div className="w-16 h-16 rounded-xl bg-zinc-800 border-2 border-[#18181b] flex items-center justify-center shadow-lg -mb-10 z-10 text-indigo-400 text-2xl">
                    <FaHospital />
                 </div>
            </div>

            <div className="pt-12 p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{hospital.name}</h3>
                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
                    <FiMapPin />
                    <span>{hospital.city}, {hospital.state}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">
                            <FiUsers />
                            <span>Staff</span>
                        </div>
                        <span className="text-xl font-bold text-white">{hospital.doctors?.length || 0}</span>
                    </div>
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">
                            <FiActivity />
                            <span>Capacity</span>
                        </div>
                        <span className="text-xl font-bold text-white">{hospital.transplant_capacity}</span>
                    </div>
                </div>

                <div className="space-y-3 mt-auto pt-6 border-t border-zinc-800/50">
                    <div className="flex items-center gap-3 text-sm text-zinc-400 group/link hover:text-zinc-200 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover/link:bg-zinc-700 group-hover/link:text-white transition-colors">
                             <FiPhone size={14} />
                        </div>
                        <span>{hospital.contact_number}</span>
                    </div>
                     <div className="flex items-center gap-3 text-sm text-zinc-400 group/link hover:text-zinc-200 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover/link:bg-zinc-700 group-hover/link:text-white transition-colors">
                             <FiMail size={14} />
                        </div>
                        <span className="truncate">{hospital.email}</span>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalList;
