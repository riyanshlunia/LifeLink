import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DonorList from './pages/DonorList';
import RecipientList from './pages/RecipientList';
import MatchingList from './pages/MatchingList';
import TransplantList from './pages/TransplantList';
import HospitalList from './pages/HospitalList';
import DoctorList from './pages/DoctorList';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Loading from './components/Loading';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Admin Dashboard */}
        <Route 
          path="dashboard" 
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Hospital Dashboard */}
        <Route 
          path="hospital-dashboard" 
          element={
            <PrivateRoute roles={['hospital_staff']}>
              <HospitalDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Doctor Dashboard */}
        <Route 
          path="doctor-dashboard" 
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Entity Pages */}
        <Route path="donors" element={<PrivateRoute><DonorList /></PrivateRoute>} />
        <Route path="recipients" element={<PrivateRoute><RecipientList /></PrivateRoute>} />
        <Route path="matchings" element={<PrivateRoute><MatchingList /></PrivateRoute>} />
        <Route path="transplants" element={<PrivateRoute><TransplantList /></PrivateRoute>} />
        <Route path="hospitals" element={<PrivateRoute roles={['admin']}><HospitalList /></PrivateRoute>} />
        <Route path="doctors" element={<PrivateRoute><DoctorList /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
