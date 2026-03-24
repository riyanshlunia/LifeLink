import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatDate, calculateAge } from '../utils/helpers';
import Modal from '../components/Modal';
import { FiSearch, FiPlus, FiFilter, FiMoreVertical, FiUser, FiActivity, FiAlertCircle, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { FaTint, FaProcedures } from 'react-icons/fa';

const RecipientList = () => {
  const [recipients, setRecipients] = useState([]);
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
    required_organ: 'kidney',
    urgency_level: 'medium',
    medical_condition: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (recipient) => {
    setEditingId(recipient.id);
    setFormData({
      full_name: recipient.full_name,
      date_of_birth: recipient.date_of_birth,
      gender: recipient.gender,
      blood_group: recipient.blood_group,
      contact_number: recipient.contact_number,
      email: recipient.email || '',
      address: recipient.address,
      city: recipient.city,
      state: recipient.state,
      required_organ: recipient.required_organ,
      urgency_level: recipient.urgency_level,
      medical_condition: recipient.medical_condition || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipient record?')) {
      try {
        await api.delete(`/recipients/${id}`);
        toast.success('Recipient record deleted');
        fetchRecipients();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete recipient');
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
      required_organ: 'kidney',
      urgency_level: 'medium',
      medical_condition: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/recipients/${editingId}`, formData);
        toast.success('Recipient updated successfully');
      } else {
        await api.post('/recipients', formData);
        toast.success('Recipient registered successfully');
      }
      setIsModalOpen(false);
      fetchRecipients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save recipient');
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const response = await api.get('/recipients');
      setRecipients(response.data.data);
    } catch (error) {
      toast.error('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = recipients.filter(recipient =>
    recipient.full_name.toLowerCase().includes(search.toLowerCase()) ||
    recipient.blood_group.includes(search) ||
    recipient.required_organ.toLowerCase().includes(search.toLowerCase())
  );

  const getUrgencyBadge = (level) => {
    const styles = {
      critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return styles[level] || styles.low;
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Recipients</h1>
          <p className="text-zinc-400 mt-1">Manage patients waiting for organ transplants.</p>
        </div>
        <button 
          onClick={openRegisterModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <FiPlus />
          <span>Add Recipient</span>
        </button>
      </div>

       {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            placeholder="Search recipients by name, organ, or urgency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2 font-medium">
          <FiFilter />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Patient Details</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Required Organ</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Blood Group</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Urgency</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Waiting Since</th>
                <th className="text-right py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredRecipients.map((recipient) => (
                <tr key={recipient.id} className="group hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                        <FiUser />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{recipient.full_name}</p>
                        <p className="text-xs text-zinc-500">{calculateAge(recipient.date_of_birth)} years old</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <FaProcedures className="text-zinc-500" />
                       <span className="text-zinc-200 capitalize">{recipient.required_organ}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                            <FaTint className="text-xs" />
                        </div>
                        <span className="font-semibold text-zinc-200">{recipient.blood_group}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyBadge(recipient.urgency_level)}`}>
                      {recipient.urgency_level === 'critical' && <FiAlertCircle className="text-[10px]" />}
                      <span className="uppercase tracking-wide">{recipient.urgency_level}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-zinc-400">{formatDate(recipient.waiting_since)}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(recipient)}
                          className="text-zinc-500 hover:text-indigo-400 p-2 hover:bg-zinc-800 rounded-lg transition-all"
                          title="Edit Recipient"
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          onClick={() => handleDelete(recipient.id)}
                          className="text-zinc-500 hover:text-rose-400 p-2 hover:bg-zinc-800 rounded-lg transition-all"
                          title="Delete Recipient"
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
        
        {filteredRecipients.length === 0 && (
          <div className="p-12 text-center text-zinc-500">
             No recipients found matching your search.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Recipient Details" : "Register New Recipient"}>
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
              <label className="label">Required Organ</label>
              <select 
                name="required_organ" 
                className="input-field" 
                value={formData.required_organ} 
                onChange={handleInputChange}
              >
                {['heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea'].map(o => (
                  <option key={o} value={o} className="capitalize">{o}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="label">Urgency Level</label>
              <select 
                name="urgency_level" 
                className="input-field" 
                value={formData.urgency_level} 
                onChange={handleInputChange}
              >
                {['low', 'medium', 'high', 'critical'].map(l => (
                  <option key={l} value={l} className="capitalize">{l}</option>
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
            <label className="label">Medical Condition</label>
            <textarea 
              name="medical_condition" 
              required 
              className="input-field min-h-[80px]" 
              value={formData.medical_condition} 
              onChange={handleInputChange} 
              placeholder="Describe the current condition..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600">
              {editingId ? 'Update Recipient' : 'Register Recipient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecipientList;
