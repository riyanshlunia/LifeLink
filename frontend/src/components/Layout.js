import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiUsers, FiHeart, FiActivity, FiTrendingUp, 
  FiLogOut, FiMenu, FiX, FiShield, FiSettings, FiGrid
} from 'react-icons/fi';
import { FaHospital, FaUserMd } from 'react-icons/fa';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const commonItems = [
      { path: '/donors', label: 'Donors', icon: <FiUsers /> },
      { path: '/recipients', label: 'Recipients', icon: <FiHeart /> },
      { path: '/matchings', label: 'Matchings', icon: <FiActivity /> },
      { path: '/transplants', label: 'Transplants', icon: <FiTrendingUp /> },
      { path: '/doctors', label: 'Doctors', icon: <FaUserMd /> }
    ];

    if (user?.role === 'admin') {
      return [
        { group: 'Overview', items: [{ path: '/dashboard', label: 'Dashboard', icon: <FiGrid /> }] },
        { group: 'Management', items: [...commonItems, { path: '/hospitals', label: 'Hospitals', icon: <FaHospital /> }] },
      ];
    } else if (user?.role === 'hospital_staff') {
      return [
         { group: 'Overview', items: [{ path: '/hospital-dashboard', label: 'Dashboard', icon: <FiGrid /> }] },
         { group: 'Management', items: commonItems }
      ];
    } else if (user?.role === 'doctor') {
      return [
        { group: 'Overview', items: [{ path: '/doctor-dashboard', label: 'Dashboard', icon: <FiGrid /> }] },
        { group: 'My Work', items: [{ path: '/transplants', label: 'My Cases', icon: <FiTrendingUp /> }] }
      ];
    }
    return [];
  };

  const navGroups = getNavItems();
  const flattenItems = navGroups.flatMap(g => g.items);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Floating Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        w-72 md:w-80 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        transition-transform duration-300 ease-out
        md:m-4 md:rounded-3xl flex flex-col
        bg-[#18181b] border-r md:border border-zinc-800/60 shadow-2xl shadow-black/40
      `}>
        {/* Brand Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <FiHeart className="text-white fill-current animate-pulse-slow text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">LifeLink</h1>
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Medical System</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-400 hover:text-white">
              <FiX size={24} />
            </button>
          </div>

          {/* User Card */}
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                <FiShield />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate text-zinc-100">{user?.full_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Scroll Area */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">{group.group}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-zinc-800 text-white shadow-lg shadow-black/20 border border-zinc-700/50' 
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'
                        }
                      `}
                    >
                      <span className={`
                        text-lg transition-colors duration-200
                        ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}
                      `}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 mt-auto border-t border-zinc-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-medium border border-transparent hover:border-rose-500/20"
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50"
            >
              <FiMenu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {flattenItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="h-8 w-px bg-zinc-800 mx-2 hidden md:block"></div>
             <div className="flex items-center gap-3">
               <div className="text-right hidden md:block">
                  <p className="text-xs text-zinc-400">Current Session</p>
                  <p className="text-sm font-bold text-white tracking-wide">Active</p>
               </div>
               <button className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-zinc-700">
                  <FiSettings />
               </button>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
