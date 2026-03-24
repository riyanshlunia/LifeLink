import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { 
  FiUsers, FiHeart, FiActivity, FiTrendingUp, 
  FiCheckCircle, FiAlertCircle, FiClock 
} from 'react-icons/fi';
import { FaHospital } from 'react-icons/fa';
import { formatDateTime, getStatusColor } from '../utils/helpers';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

ChartJS.defaults.color = '#a1a1aa';
ChartJS.defaults.borderColor = '#3f3f46';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/admin');
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

  const { overview, donorsByStatus, recipientsByUrgency, transplantsByOutcome, recentTransplants } = dashboard;

  // Chart data
  const donorStatusData = {
    labels: donorsByStatus.map(d => d.donation_status),
    datasets: [{
      data: donorsByStatus.map(d => parseInt(d.count)),
      backgroundColor: ['#10b981', '#6366f1', '#a855f7', '#f43f5e'],
      borderColor: '#18181b',
      borderWidth: 2
    }]
  };

  const urgencyData = {
    labels: recipientsByUrgency.map(r => r.urgency_level),
    datasets: [{
      data: recipientsByUrgency.map(r => parseInt(r.count)),
      backgroundColor: ['#f43f5e', '#f59e0b', '#eab308', '#10b981'],
      borderColor: '#18181b',
      borderWidth: 2
    }]
  };

  const transplantOutcomeData = {
    labels: transplantsByOutcome.map(t => t.outcome),
    datasets: [{
      label: 'Transplants',
      data: transplantsByOutcome.map(t => parseInt(t.count)),
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
      borderRadius: 6,
    }]
  };

  const statCards = [
    { title: 'Total Donors', value: overview.donors, icon: <FiUsers /> },
    { title: 'Total Recipients', value: overview.recipients, icon: <FiHeart /> },
    { title: 'Hospitals', value: overview.hospitals, icon: <FaHospital /> },
    { title: 'Doctors', value: overview.doctors, icon: <FiUsers /> },
    { title: 'Total Matchings', value: overview.matchings, icon: <FiActivity /> },
    { title: 'Transplants', value: overview.transplants, icon: <FiTrendingUp /> },
    { title: 'Pending Approvals', value: overview.pendingApprovals, icon: <FiClock /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-1">Overview of organ donation activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card group hover:border-zinc-600 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">{stat.title}</p>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl text-white shadow-lg group-hover:bg-zinc-700 transition-all duration-300 border border-zinc-700">
                <span className="text-xl opacity-90">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-6">Donors by Status</h3>
          <div className="p-2">
            <Pie data={donorStatusData} options={{ maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', boxWidth: 12, padding: 20, font: { family: 'Plus Jakarta Sans', size: 11 } } } } }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-6">Recipients by Urgency</h3>
          <div className="p-2">
            <Pie data={urgencyData} options={{ maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', boxWidth: 12, padding: 20, font: { family: 'Plus Jakarta Sans', size: 11 } } } } }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-6">Transplant Outcomes</h3>
          <div className="p-2">
            <Bar data={transplantOutcomeData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#27272a', borderDash: [4, 4], drawBorder: false }, ticks: { color: '#a1a1aa' } }, x: { grid: { display: false }, ticks: { color: '#a1a1aa' } } } }} />
          </div>
        </div>
      </div>

      {/* Recent Transplants */}
      <div className="card overflow-hidden !p-0">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white">Recent Transplants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor</th>
                <th>Recipient</th>
                <th>Hospital</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {recentTransplants.map((transplant) => (
                <tr key={transplant.id}>
                  <td>{formatDateTime(transplant.transplant_date)}</td>
                  <td>
                    <div className="font-medium text-zinc-100">{transplant.donor?.full_name}</div>
                  </td>
                  <td>
                    <div className="font-medium text-zinc-100">{transplant.recipient?.full_name}</div>
                  </td>
                  <td>{transplant.hospital?.name}</td>
                  <td>
                    <span className={`badge ${getStatusColor(transplant.outcome)}`}>
                      {transplant.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
