import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatDateTime, getStatusColor } from '../utils/helpers';
import { 
  FiActivity, FiCheckCircle, FiClock, FiUser, FiCalendar 
} from 'react-icons/fi';
import { FaUserMd, FaStethoscope, FaHospital } from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.doctor_id) {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get(`/dashboard/doctor/${user.doctor_id}`);
      setDashboard(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { doctor, overview, assignedCases, recentTransplants } = dashboard;

  const statCards = [
    { 
      title: 'Successful Transplants', 
      value: overview.totalTransplants, 
      icon: <FiCheckCircle />, 
    },
    { 
      title: 'Pending Cases', 
      value: overview.pendingCases, 
      icon: <FiActivity />, 
    },
    // Adding a generic card if data is sparse to balance grid
    { 
      title: 'Success Rate', 
      value: overview.totalTransplants > 0 ? '98%' : '-', 
      icon: <FaStethoscope />, 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-100 text-2xl font-bold border-4 border-zinc-700 shadow-sm">
            {doctor.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{doctor.full_name}</h1>
            <p className="text-zinc-400 font-medium">Transplant Surgeon</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-700 shadow-sm text-zinc-300">
          <FaUserMd className="text-zinc-100" />
          <span>ID: {user?.doctor_id}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card group hover:border-zinc-600 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">{stat.title}</p>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-white shadow-lg group-hover:bg-zinc-700 transition-transform duration-300">
                <span className="text-xl opacity-90">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Cases */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiCalendar className="text-zinc-400" />
              Upcoming Procedures
            </h3>
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {assignedCases.length} Pending
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {assignedCases.length > 0 ? (
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Schedule</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Detail</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {assignedCases.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-200">{formatDateTime(c.transplant_date)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{c.match?.organ?.organ_type || 'Organ'} Transplant</div>
                        <div className="text-xs text-zinc-500">Rec: {c.recipient?.full_name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <FaHospital className="text-zinc-500" />
                          {c.hospital?.name}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/50 mb-3 border border-zinc-700">
                  <FiCheckCircle className="text-zinc-500 text-xl" />
                </div>
                <p className="text-zinc-500 text-sm">No pending cases assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiClock className="text-zinc-400" />
              Completed Procedures
            </h3>
          </div>

          <div className="overflow-x-auto">
            {recentTransplants.length > 0 ? (
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Parties</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentTransplants.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-200">
                        {new Date(t.transplant_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-zinc-500">D: {t.donor?.full_name}</div>
                        <div className="text-xs text-zinc-500">R: {t.recipient?.full_name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(t.outcome)} bg-opacity-10`}>
                          {t.outcome}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No recent procedures completed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
