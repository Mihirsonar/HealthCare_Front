import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, ShieldAlert, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-[#0f172a] border-b border-gray-800 text-white py-4 px-6 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Activity className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">CarePulse</span>
            <span className="text-[10px] text-gray-500 block -mt-1 font-medium">Dashboard Hub</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-r border-gray-800 pr-6">
            <div className="text-right">
              <span className="block text-sm font-semibold text-gray-200">{user.full_name}</span>
              <span className="text-xs text-gray-400 block -mt-0.5">{user.email}</span>
            </div>
            <div className="flex items-center justify-center w-9 h-9 bg-gray-800 rounded-full border border-gray-700">
              {user.role === 'Admin' ? (
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              ) : (
                <UserIcon className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              user.role === 'Admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}>
              {user.role}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors text-sm font-semibold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
