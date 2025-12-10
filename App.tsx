import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PropertyDetails from './pages/PropertyDetails';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
            </Routes>
          </div>
          
          <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>&copy; {new Date().getFullYear()} ColaboraInmo. Todos los derechos reservados.</p>
              <p className="text-sm mt-2">Plataforma de colaboración inmobiliaria para profesionales y clientes.</p>
              <div className="flex justify-center items-center gap-4 mt-4 text-sm flex-wrap">
                 <a href="mailto:colaborainmo@colaborainmo.es" className="hover:text-white transition-colors">colaborainmo@colaborainmo.es</a>
                 <span className="hidden sm:inline">|</span>
                 <span>WhatsApp: 642 380 993</span>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;