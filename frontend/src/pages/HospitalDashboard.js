import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatDateTime, getStatusColor } from '../utils/helpers';
import { 
  FiActivity, FiUsers, FiClock, FiHeart, FiUserPlus, 
  FiCalendar, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { FaHospital, FaUserMd, FaProcedures } from 'react-icons/fa';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.hospital_id) {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get(`/dashboard/hospital/${user.hospital_id}`);
      setDashboard(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
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

  const { hospital, overview, recentTransplants, upcomingTransplants } = dashboard;

  const statCards = [
    { 
      title: 'Doctors Staff', 
      value: overview.doctors, 
      icon: <FaUserMd />, 
    },
    { 
      title: 'Current Capacity', 
      value: overview.capacity, 
      sub: 'Beds Available',
      icon: <FaProcedures />, 
    },
    { 
      title: 'Total Transplants', 
      value: overview.totalTransplants, 
      icon: <FiActivity />, 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{hospital.name}</h1>
          <p className="text-zinc-400 mt-1">Hospital Administration Portal</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 shadow-sm text-zinc-300">
          <FaHospital className="text-zinc-100" />
          <span>ID: {hospital.hospital_id}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card group hover:border-zinc-600 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                  {stat.sub && <span className="text-xs text-zinc-500 font-medium">{stat.sub}</span>}
                </div>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-white shadow-lg group-hover:bg-zinc-700 transition-transform duration-300">
                <span className="text-xl opacity-90">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Transplants */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiCalendar className="text-zinc-400" />
              Upcoming Procedures
            </h3>
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Next 7 Days
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {upcomingTransplants.length > 0 ? (
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recipient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Surgeon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {upcomingTransplants.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-200">
                        {formatDateTime(t.transplant_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-400">
                        {t.recipient?.full_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-700">
                            {t.doctor?.full_name?.charAt(0)}
                          </div>
                          {t.doctor?.full_name}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/50 mb-3 border border-zinc-700">
                  <FiCalendar className="text-zinc-500 text-xl" />
                </div>
                <p className="text-zinc-500 text-sm">No upcoming procedures scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiClock className="text-zinc-400" />
              Recent History
            </h3>
          </div>

          <div className="overflow-x-auto">
            {recentTransplants.length > 0 ? (
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outcome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentTransplants.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-200">
                        {new Date(t.transplant_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-400">
                        {t.outcome}
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
                <p className="text-zinc-500 text-sm">No recent history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
