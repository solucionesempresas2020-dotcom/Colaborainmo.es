import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PropertyType, BookingType } from '../types';
import { MapPin, BedDouble, Bath, Maximize, Calendar, Clock, User, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import PropertyMap from '../components/PropertyMap';
import { MONTHS } from '../constants';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { properties, addBooking, user } = useApp();
  const navigate = useNavigate();
  
  const property = properties.find(p => p.id === id);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date: '',
    endDate: '',
    time: '10:00'
  });

  if (!property) {
    return <div className="p-10 text-center">Propiedad no encontrada</div>;
  }
  
  // Handle properties with images array
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://picsum.photos/800/600'];

  const isVacation = property.type === PropertyType.VACATION_RENT || property.type === PropertyType.SEPT_JUNE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || (isVacation && !formData.endDate)) {
      alert('Por favor selecciona las fechas.');
      return;
    }

    addBooking({
      id: Date.now().toString(),
      propertyId: property.id,
      agentId: property.agentId,
      userId: user?.id,
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      startDate: formData.date,
      endDate: isVacation ? formData.endDate : undefined,
      time: !isVacation ? formData.time : undefined,
      type: isVacation ? BookingType.VACATION_STAY : BookingType.VISIT,
      status: 'PENDING',
      createdAt: Date.now()
    });

    setSuccessMsg(isVacation ? 'Solicitud de reserva enviada correctamente.' : 'Visita agendada correctamente.');
    
    // Reset form partially
    setFormData(prev => ({...prev, date: '', endDate: '', time: '10:00'}));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Volver al listado
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Property Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Gallery Section */}
            <div className="relative group">
                <div className="h-[400px] w-full bg-slate-100">
                    <img 
                        src={images[selectedImageIndex]} 
                        alt={property.title} 
                        className="w-full h-full object-cover transition-opacity duration-300" 
                    />
                </div>
                <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                    {property.type}
                    </span>
                    {property.touristRegistry && (
                    <span className="ml-2 bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                        Licencia: {property.touristRegistry}
                    </span>
                    )}
                </div>
                
                {/* Navigation Arrows (Optional visual hint) */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ←
                    </button>
                    <button 
                      onClick={() => setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      →
                    </button>
                  </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-slate-50 border-b border-slate-100 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
            
            <div className="p-8">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
                <p className="text-3xl font-bold text-blue-600 whitespace-nowrap">
                  {property.price.toLocaleString()} €
                  {property.type.includes('Alquiler') && <span className="text-sm text-slate-500 font-normal">/periodo</span>}
                </p>
              </div>
              
              <div className="flex items-center text-slate-600 mb-6">
                <MapPin size={20} className="mr-2 text-blue-500" />
                <span className="text-lg">{property.city}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6 mb-6">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl">
                  <BedDouble size={28} className="text-slate-400 mb-2" />
                  <span className="font-semibold">{property.bedrooms} Habitaciones</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl">
                  <Bath size={28} className="text-slate-400 mb-2" />
                  <span className="font-semibold">{property.bathrooms} Baños</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl">
                  <Maximize size={28} className="text-slate-400 mb-2" />
                  <span className="font-semibold">{property.size} m²</span>
                </div>
              </div>

              {/* Monthly Availability Display */}
              {property.availableMonths && property.availableMonths.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="text-slate-500" size={20} /> Disponibilidad Estacional
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {MONTHS.map((month, index) => {
                      const isAvailable = property.availableMonths?.includes(index);
                      return (
                        <div 
                          key={month} 
                          className={`text-center py-2 text-xs rounded-lg font-medium border ${
                            isAvailable 
                              ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
                              : 'bg-slate-50 text-slate-300 border-slate-100 opacity-50'
                          }`}
                        >
                          {month}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold mb-4">Descripción</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-8 text-lg">
                {property.description}
              </p>

              {property.lat && property.lng && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Ubicación</h2>
                  <PropertyMap properties={[property]} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              {isVacation ? 'Reservar Estancia' : 'Agendar Visita'}
            </h3>

            {successMsg ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in fade-in">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <h4 className="text-green-800 font-bold mb-2">¡Solicitud Enviada!</h4>
                <p className="text-green-600 text-sm mb-4">{successMsg}</p>
                <button 
                  onClick={() => setSuccessMsg('')}
                  className="text-sm font-medium text-green-700 hover:text-green-800 underline"
                >
                  Realizar otra solicitud
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Client Details */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Tus Datos</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      placeholder="Nombre y Apellido" 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="email" 
                      required 
                      placeholder="Correo Electrónico" 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="tel" 
                      required 
                      placeholder="Teléfono de contacto" 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                {/* Date Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    {isVacation ? 'Fechas de Estancia' : 'Fecha de Visita'}
                  </label>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">{isVacation ? 'Llegada' : 'Día'}</span>
                      <input 
                        type="date" 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    
                    {isVacation ? (
                       <div>
                        <span className="text-xs text-slate-500 block mb-1">Salida</span>
                        <input 
                          type="date" 
                          required 
                          min={formData.date || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          value={formData.endDate}
                          onChange={e => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">Hora Preferida</span>
                        <div className="relative">
                          <Clock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                          <select 
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            value={formData.time}
                            onChange={e => setFormData({...formData, time: e.target.value})}
                          >
                            <option>09:00</option>
                            <option>10:00</option>
                            <option>11:00</option>
                            <option>12:00</option>
                            <option>13:00</option>
                            <option>16:00</option>
                            <option>17:00</option>
                            <option>18:00</option>
                            <option>19:00</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all transform active:scale-95 mt-4">
                  {isVacation ? 'Solicitar Reserva' : 'Confirmar Visita'}
                </button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  No se realizará ningún cobro en este paso.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;