import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Home, LogOut, User as UserIcon, Building, MessageSquare } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Home className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl tracking-tight">ColaboraInmo</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:bg-slate-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <Home size={18} /> Inicio
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:bg-slate-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <UserIcon size={18} /> Panel {user.role === 'AGENT' ? 'Inmobiliaria' : 'Cliente'}
                </Link>
                {user.role === 'AGENT' && (
                   <div className="hidden md:flex items-center px-3 py-1 bg-blue-900/50 rounded-full border border-blue-700">
                     <span className="text-xs text-blue-200">Agente: {user.agencyName || user.name}</span>
                   </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <LogOut size={18} /> Salir
                </button>
              </>
            ) : (
              <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Acceso / Registro
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;