import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import AIChatWidget from '../components/AIChatWidget';
import { CITIES } from '../constants';
import { PropertyType } from '../types';
import { Search, Filter, Map, List } from 'lucide-react';

const Home: React.FC = () => {
  const { properties } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Filter States
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchCity = selectedCity ? p.city.toLowerCase().includes(selectedCity.toLowerCase()) : true;
      const matchType = selectedType ? p.type === selectedType : true;
      const matchPrice = maxPrice ? p.price <= Number(maxPrice) : true;
      return matchCity && matchType && matchPrice;
    });
  }, [properties, selectedCity, selectedType, maxPrice]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 px-4 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            ColaboraInmo: La Red de Confianza
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Conectamos inmobiliarias y clientes. Encuentra ventas, alquileres y oportunidades en toda España.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input 
                list="search-cities"
                type="text" 
                placeholder="Ciudad o Zona"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
              <datalist id="search-cities">
                {CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            
            <div className="relative">
               <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Tipo de Operación</option>
                {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="relative">
              <input 
                type="number" 
                placeholder="Precio Máximo €"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Search size={20} /> Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Property Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Propiedades Destacadas
            <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-1 rounded-full">
              {filteredProperties.length} resultados
            </span>
          </h2>
          
          <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List size={18} /> Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'map' 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Map size={18} /> Mapa
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="animate-in fade-in duration-300">
            <PropertyMap properties={filteredProperties} />
          </div>
        ) : (
          <>
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Filter size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No se encontraron propiedades</h3>
                <p className="text-slate-500">Intenta ajustar tus filtros de búsqueda.</p>
              </div>
            )}
          </>
        )}
      </div>

      <AIChatWidget />
    </div>
  );
};

export default Home;