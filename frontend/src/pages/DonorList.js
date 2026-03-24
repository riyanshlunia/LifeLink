import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatDate, calculateAge } from '../utils/helpers';
import Modal from '../components/Modal';
import { FiSearch, FiPlus, FiFilter, FiMoreVertical, FiUser, FiMapPin, FiPhone, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { FaTint } from 'react-icons/fa';

const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    blood_group: 'O+',
    contact_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    medical_history: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (donor) => {
    setEditingId(donor.id);
    setFormData({
      full_name: donor.full_name,
      date_of_birth: donor.date_of_birth,
      gender: donor.gender,
      blood_group: donor.blood_group,
      contact_number: donor.contact_number,
      email: donor.email || '',
      address: donor.address,
      city: donor.city,
      state: donor.state,
      medical_history: donor.medical_history || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor record?')) {
      try {
        await api.delete(`/donors/${id}`);
        toast.success('Donor record deleted');
        fetchDonors();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete donor');
      }
    }
  };

  const openRegisterModal = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      date_of_birth: '',
      gender: 'male',
      blood_group: 'O+',
      contact_number: '',
      email: '',
      address: '',
      city: '',
      state: '',
      medical_history: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/donors/${editingId}`, formData);
        toast.success('Donor updated successfully');
      } else {
        await api.post('/donors', formData);
        toast.success('Donor registered successfully');
      }
      setIsModalOpen(false);
      fetchDonors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save donor');
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await api.get('/donors');
      setDonors(response.data.data);
    } catch (error) {
      toast.error('Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter(donor =>
    donor.full_name.toLowerCase().includes(search.toLowerCase()) ||
    donor.blood_group.includes(search) ||
    donor.city.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      matched: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      donated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      withdrawn: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    };
    return styles[status] || styles.withdrawn;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Donors</h1>
          <p className="text-zinc-400 mt-1">Manage registered organ donors and their status.</p>
        </div>
        <button 
          onClick={openRegisterModal}
          className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
        >
          <FiPlus />
          <span>Register Donor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            placeholder="Search donors by name, blood group, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2 font-medium">
          <FiFilter />
          <span>Filters</span>
        </button>
      </div>

      {/* Donors List */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Donor Details</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Blood Group</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Location</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Registration</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredDonors.map((donor) => (
                <tr key={donor.id} className="group hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                        <FiUser />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{donor.full_name}</p>
                        <p className="text-xs text-zinc-500">{calculateAge(donor.date_of_birth)} years • {donor.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                         <FaTint className="text-xs" />
                       </div>
                       <span className="font-semibold text-zinc-200">{donor.blood_group}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <FiMapPin className="text-zinc-600" />
                      <span className="text-sm">{donor.city}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-zinc-300">{formatDate(donor.registration_date)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(donor.donation_status)}`}>
                      {donor.donation_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(donor)}
                        className="text-zinc-500 hover:text-indigo-400 p-2 hover:bg-zinc-800 rounded-lg transition-all"
                        title="Edit Donor"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDelete(donor.id)}
                        className="text-zinc-500 hover:text-rose-400 p-2 hover:bg-zinc-800 rounded-lg transition-all"
                        title="Delete Donor"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDonors.length === 0 && (
          <div className="p-12 text-center text-zinc-500">
            No donors found matching your search.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Donor Details" : "Register New Donor"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input 
                type="text" 
                name="full_name" 
                required 
                className="input-field" 
                value={formData.full_name} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input 
                type="date" 
                name="date_of_birth" 
                required 
                className="input-field" 
                value={formData.date_of_birth} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select 
                name="gender" 
                className="input-field" 
                value={formData.gender} 
                onChange={handleInputChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select 
                name="blood_group" 
                className="input-field" 
                value={formData.blood_group} 
                onChange={handleInputChange}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input 
                type="tel" 
                name="contact_number" 
                required 
                className="input-field" 
                value={formData.contact_number} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input 
                type="email" 
                name="email" 
                className="input-field" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label className="label">City</label>
              <input 
                type="text" 
                name="city" 
                required 
                className="input-field" 
                value={formData.city} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label className="label">State</label>
              <input 
                type="text" 
                name="state" 
                required 
                className="input-field" 
                value={formData.state} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <textarea 
              name="address" 
              required 
              className="input-field min-h-[80px]" 
              value={formData.address} 
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div>
            <label className="label">Medical History</label>
            <textarea 
              name="medical_history" 
              className="input-field min-h-[80px]" 
              value={formData.medical_history} 
              onChange={handleInputChange} 
              placeholder="Any existing conditions..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Update Donor' : 'Register Donor'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonorList;
