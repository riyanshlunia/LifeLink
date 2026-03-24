export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const statusColors = {
    available: 'status-available',
    matched: 'status-matched',
    donated: 'status-donated',
    waiting: 'status-waiting',
    transplanted: 'status-transplanted',
    critical: 'status-critical',
    high: 'status-high',
    medium: 'status-medium',
    low: 'status-low',
    approved: 'badge-success',
    pending: 'badge-warning',
    rejected: 'badge-danger',
    successful: 'badge-success',
    complicated: 'badge-warning',
    failed: 'badge-danger'
  };
  
  return statusColors[status] || 'badge-info';
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const organTypes = ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea'];
export const urgencyLevels = ['critical', 'high', 'medium', 'low'];
export const genders = ['male', 'female', 'other'];
