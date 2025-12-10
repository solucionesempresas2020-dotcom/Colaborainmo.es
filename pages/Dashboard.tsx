import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyType, UserRole, BookingType, BookingStatus } from '../types';
import InternalChat from '../components/InternalChat';
import { generatePropertyVideo, generatePropertyDescription } from '../services/geminiService';
import { Plus, LayoutDashboard, Settings, Calendar, User, Phone, Mail, Video, Play, Loader2, Sparkles, Bot, Save, ArrowRight, Check, Image as ImageIcon, X, Wand2, CreditCard, Lock, TrendingUp, DollarSign, Crown } from 'lucide-react';
import { CITIES, MONTHS } from '../constants';

const Dashboard: React.FC = () => {
  const { user, addProperty, bookings, properties, aiInstruction, updateAiInstruction, upgradeSubscription, updateBookingStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'crm' | 'properties' | 'chat' | 'marketing' | 'bot_config' | 'subscription'>('crm');
  
  // Video Gen State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Bot Config State
  const [localInstruction, setLocalInstruction] = useState(aiInstruction);

  // Description Gen State
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: 'Málaga',
    type: PropertyType.SALE,
    bedrooms: '2',
    bathrooms: '1',
    size: '',
    images: [] as string[],
    lat: '',
    lng: '',
    touristRegistry: '',
    availableMonths: [] as number[]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <div className="p-10 text-center">Acceso denegado. Inicia sesión.</div>;
  }

  // Admin Check - Only this email can configure the bot
  const isAdmin = user.email === 'solucionesempresas2020@gmail.com';

  // Auto-select months if "Sept-June" is chosen
  useEffect(() => {
    if (formData.type === PropertyType.SEPT_JUNE) {
      setFormData(prev => ({
        ...prev,
        availableMonths: [8, 9, 10, 11, 0, 1, 2, 3, 4, 5]
      }));
    } else if (formData.type === PropertyType.SALE || formData.type === PropertyType.LONG_TERM_RENT) {
        setFormData(prev => ({ ...prev, availableMonths: [] }));
    }
  }, [formData.type]);

  const toggleMonth = (monthIndex: number) => {
    setFormData(prev => {
      const exists = prev.availableMonths.includes(monthIndex);
      if (exists) {
        return { ...prev, availableMonths: prev.availableMonths.filter(m => m !== monthIndex) };
      } else {
        return { ...prev, availableMonths: [...prev.availableMonths, monthIndex] };
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formData.images.length + files.length > 8) {
        alert("Máximo 8 imágenes permitidas.");
        return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.city || !formData.price) {
        alert("Por favor rellena al menos Título, Ciudad y Precio para generar una descripción.");
        return;
    }
    setIsGeneratingDesc(true);
    const desc = await generatePropertyDescription(formData);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const myBookings = bookings.filter(b => b.agentId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const myProperties = properties.filter(p => p.agentId === user.id);

  // CRM STATS
  const totalLeads = myBookings.length;
  const activeLeads = myBookings.filter(b => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED).length;
  const closedDeals = myBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
  // Mock value calculation
  const pipelineValue = myBookings.reduce((acc, b) => {
      // Rough estimate logic for demo
      const prop = properties.find(p => p.id === b.propertyId);
      if (prop && (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED)) {
          return acc + (prop.type === PropertyType.SALE ? prop.price * 0.03 : prop.price); // 3% commission or 1 month rent
      }
      return acc;
  }, 0);

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
        formData.images.push('https://picsum.photos/800/600');
    }

    const success = addProperty({
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      city: formData.city,
      type: formData.type,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      size: Number(formData.size),
      images: formData.images,
      agentId: user.id,
      lat: formData.lat ? Number(formData.lat) : undefined,
      lng: formData.lng ? Number(formData.lng) : undefined,
      touristRegistry: formData.type === PropertyType.VACATION_RENT ? formData.touristRegistry : undefined,
      availableMonths: formData.availableMonths.length > 0 ? formData.availableMonths : undefined
    });

    if (success) {
        alert('Propiedad añadida con éxito');
        setActiveTab('crm');
        // Reset form
        setFormData({
            title: '',
            description: '',
            price: '',
            city: 'Málaga',
            type: PropertyType.SALE,
            bedrooms: '2',
            bathrooms: '1',
            size: '',
            images: [],
            lat: '',
            lng: '',
            touristRegistry: '',
            availableMonths: []
        });
    } else {
        alert("¡Has alcanzado el límite de 10 propiedades del plan Gratuito! Actualiza a PRO para publicar propiedades ilimitadas.");
        setActiveTab('subscription');
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    try {
      const url = await generatePropertyVideo(videoPrompt);
      setGeneratedVideoUrl(url);
    } catch (e) {
      alert("Error generando video. Asegúrate de haber seleccionado una API Key válida.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSaveInstruction = () => {
    updateAiInstruction(localInstruction);
    alert("¡Instrucciones del bot actualizadas! Ahora 'ColaboraBot' seguirá tus nuevas reglas.");
  };

  const handleWhatsAppSubscription = () => {
      // Abre WhatsApp con un mensaje predefinido
      window.open('https://wa.me/34642380993?text=Hola,%20estoy%20interesado%20en%20suscribirme%20al%20Plan%20PRO%20de%20ColaboraInmo.%20%C2%BFMe%20podr%C3%ADas%20enviar%20el%20enlace%20de%20pago%20o%20QR%3F', '_blank');
  };

  // KANBAN COLUMNS
  const renderKanbanColumn = (title: string, status: string, colorClass: string) => (
      <div className="bg-slate-100 p-4 rounded-xl min-w-[280px] w-full md:w-1/3 flex flex-col h-full">
          <h4 className={`font-bold mb-4 flex justify-between items-center ${colorClass}`}>
              {title} 
              <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-slate-600">
                  {myBookings.filter(b => b.status === status).length}
              </span>
          </h4>
          <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-1">
              {myBookings.filter(b => b.status === status).map(booking => {
                  const prop = properties.find(p => p.id === booking.propertyId);
                  return (
                      <div key={booking.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-shadow group relative">
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-slate-500">{booking.type}</span>
                              <span className="text-[10px] text-slate-400">{new Date(booking.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h5 className="font-semibold text-slate-800 text-sm mb-1">{prop?.title.substring(0, 30)}...</h5>
                          <p className="text-xs text-slate-600 mb-2">{booking.clientName}</p>
                          
                          <div className="flex gap-1 mt-2 pt-2 border-t border-slate-50">
                              {status !== BookingStatus.PENDING && (
                                <button onClick={() => updateBookingStatus(booking.id, BookingStatus.PENDING)} className="text-[10px] flex-1 bg-slate-50 hover:bg-slate-200 py-1 rounded">
                                   Pendiente
                                </button>
                              )}
                              {status !== BookingStatus.CONFIRMED && (
                                <button onClick={() => updateBookingStatus(booking.id, BookingStatus.CONFIRMED)} className="text-[10px] flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 rounded">
                                   Confirmar
                                </button>
                              )}
                              {status !== BookingStatus.COMPLETED && (
                                <button onClick={() => updateBookingStatus(booking.id, BookingStatus.COMPLETED)} className="text-[10px] flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-1 rounded">
                                   Cerrar
                                </button>
                              )}
                          </div>
                      </div>
                  )
              })}
              {myBookings.filter(b => b.status === status).length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                      Sin tareas
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">
                Hola, {user.role === UserRole.AGENT ? `${user.agencyName || user.name}` : user.name}
                </h1>
                {user.plan === 'PRO' ? (
                    <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Crown size={12} fill="currentColor" /> PRO
                    </span>
                ) : (
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                        FREE
                    </span>
                )}
            </div>
            <p className="text-slate-600 mt-2">Panel de Control CRM</p>
        </div>
        
        {user.plan === 'FREE' && (
            <button 
                onClick={() => setActiveTab('subscription')}
                className="hidden md:flex bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform items-center gap-2"
            >
                <Sparkles size={16} /> Actualizar a PRO
            </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2 sticky top-24">
            <button 
              onClick={() => setActiveTab('crm')}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'crm' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} /> CRM & Pipeline
            </button>
            
            {user.role === UserRole.AGENT && (
              <>
                 <button 
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between ${activeTab === 'subscription' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} /> Suscripción
                  </div>
                  {user.plan === 'FREE' && <Lock size={12} className="text-slate-400"/>}
                </button>

                <div className="my-2 border-t border-slate-100 pt-2">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">Gestión</p>
                    <button 
                    onClick={() => setActiveTab('properties')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'properties' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                    <Plus size={18} /> Subir Propiedad
                    </button>
                    <button 
                    onClick={() => setActiveTab('marketing')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'marketing' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                    <Video size={18} /> Marketing IA (Veo)
                    </button>
                </div>

                <div className="my-2 border-t border-slate-100 pt-2">
                     <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">Herramientas</p>
                    
                    {/* ONLY ADMIN CAN SEE THIS */}
                    {isAdmin && (
                        <button 
                        onClick={() => setActiveTab('bot_config')}
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'bot_config' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                        <Bot size={18} /> Config. Bot IA
                        </button>
                    )}
                    
                    <button 
                    onClick={() => setActiveTab('chat')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'chat' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                    <Settings size={18} /> Chat Colaboradores
                    </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          {activeTab === 'crm' && (
            <div className="space-y-6 animate-in fade-in">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Leads Activos</p>
                                <h3 className="text-3xl font-bold text-slate-800">{activeLeads}</h3>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <User size={20} />
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-green-600 gap-1">
                            <TrendingUp size={12} /> +12% vs mes pasado
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Propiedades</p>
                                <h3 className="text-3xl font-bold text-slate-800">{myProperties.length} <span className="text-sm font-normal text-slate-400">/ {user.plan === 'FREE' ? '10' : '∞'}</span></h3>
                            </div>
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <LayoutDashboard size={20} />
                            </div>
                        </div>
                        {user.plan === 'FREE' && myProperties.length >= 10 && (
                            <div onClick={() => setActiveTab('subscription')} className="text-xs text-red-500 font-bold cursor-pointer hover:underline">
                                Límite alcanzado. Ampliar
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Valor Pipeline</p>
                                <h3 className="text-3xl font-bold text-slate-800">{pipelineValue.toLocaleString()} €</h3>
                            </div>
                            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">Comisiones estimadas</p>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="h-[500px] flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
                    {renderKanbanColumn('Pendientes', BookingStatus.PENDING, 'text-slate-600')}
                    {renderKanbanColumn('Confirmadas / Visita', BookingStatus.CONFIRMED, 'text-blue-600')}
                    {renderKanbanColumn('Cerradas / Ventas', BookingStatus.COMPLETED, 'text-green-600')}
                </div>
            </div>
          )}

          {activeTab === 'subscription' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 mb-4">Elige tu Plan Profesional</h2>
                      <p className="text-slate-600">Desbloquea todo el potencial de ColaboraInmo y cierra más ventas con herramientas avanzadas.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                      {/* FREE PLAN */}
                      <div className="border border-slate-200 rounded-2xl p-6 relative flex flex-col">
                          <h3 className="text-xl font-bold text-slate-800">Plan Básico</h3>
                          <p className="text-3xl font-bold mt-4 mb-6">0 € <span className="text-sm text-slate-400 font-normal">/mes</span></p>
                          <ul className="space-y-4 mb-8 flex-grow text-slate-600">
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-500"/> Hasta 10 Propiedades</li>
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-500"/> Chat Básico</li>
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-500"/> CRM Limitado</li>
                              <li className="flex gap-2 items-center text-slate-400"><X size={16}/> Marketing IA (Veo)</li>
                          </ul>
                          <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed">
                              Plan Actual
                          </button>
                      </div>

                      {/* PRO PLAN */}
                      <div className="border-2 border-green-600 rounded-2xl p-6 relative flex flex-col shadow-xl bg-green-50/10">
                          <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">RECOMENDADO</div>
                          <h3 className="text-xl font-bold text-slate-800">Plan PRO</h3>
                          <p className="text-3xl font-bold mt-4 mb-6 text-green-700">20 € <span className="text-sm text-slate-400 font-normal">/mes</span></p>
                          <ul className="space-y-4 mb-8 flex-grow text-slate-700 font-medium">
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-600"/> <strong>Propiedades Ilimitadas</strong></li>
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-600"/> CRM Avanzado + Pipeline</li>
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-600"/> Generador de Video IA (Veo)</li>
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-600"/> Soporte Prioritario</li>
                              <li className="flex gap-2 items-center"><Check size={16} className="text-green-600"/> Chat Colaboradores PRO</li>
                          </ul>
                          
                          {user.plan === 'PRO' ? (
                             <button className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-default">
                                <Check size={20} /> Plan Activo
                             </button>
                          ) : (
                            <div>
                                <button 
                                    onClick={handleWhatsAppSubscription}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <Phone size={20} /> Solicitar Alta por WhatsApp
                                </button>
                                <p className="text-xs text-center mt-3 text-slate-500">
                                    Te enviaremos el enlace de pago seguro (Monei/Bizum).
                                </p>
                                <div className="mt-4 text-center">
                                    <button onClick={upgradeSubscription} className="text-xs text-slate-400 hover:text-slate-600 underline">
                                        (Simular Activación Manual - Solo Demo)
                                    </button>
                                </div>
                            </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'marketing' && user.role === UserRole.AGENT && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              {user.plan !== 'PRO' ? (
                  <div className="text-center py-20">
                      <Lock size={48} className="mx-auto text-slate-300 mb-4" />
                      <h2 className="text-xl font-bold text-slate-800 mb-2">Función Premium</h2>
                      <p className="text-slate-500 mb-6 max-w-md mx-auto">La generación de videos con Inteligencia Artificial (Google Veo) está reservada para usuarios PRO.</p>
                      <button onClick={() => setActiveTab('subscription')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Ver Planes</button>
                  </div>
              ) : (
                <>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg">
                    <Video className="text-purple-600" size={24} />
                    </div>
                    <div>
                    <h2 className="text-xl font-bold text-slate-800">Generador de Video IA</h2>
                    <p className="text-sm text-slate-500">Crea videos promocionales con Google Veo</p>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Descripción del Video</label>
                    <textarea 
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Describe el video que quieres generar (ej: Un recorrido cinemático por un ático moderno en Marbella con vistas al mar al atardecer...)"
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 border p-3 h-32"
                    />
                    <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Sparkles size={12} /> Powered by Veo 3.1
                    </p>
                    <button 
                        onClick={handleGenerateVideo}
                        disabled={isGeneratingVideo || !videoPrompt.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg transition-colors shadow-md flex items-center gap-2"
                    >
                        {isGeneratingVideo ? <><Loader2 className="animate-spin" size={18}/> Generando...</> : <><Play size={18}/> Generar Video</>}
                    </button>
                    </div>
                </div>

                {generatedVideoUrl && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-slate-800 mb-3">Video Generado</h3>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                        <video controls className="w-full h-full" src={generatedVideoUrl}>
                        Tu navegador no soporta video HTML5.
                        </video>
                    </div>
                    <a href={generatedVideoUrl} download className="text-sm text-purple-600 hover:underline mt-2 inline-block">Descargar Video</a>
                    </div>
                )}
                </>
              )}
            </div>
          )}

          {activeTab === 'bot_config' && user.role === UserRole.AGENT && isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-indigo-100 p-2 rounded-lg">
                   <Bot className="text-indigo-600" size={24} />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-slate-800">Entrenar / Configurar Bot</h2>
                   <p className="text-sm text-slate-500">Define la personalidad y reglas de "ColaboraBot"</p>
                 </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Los datos de tus propiedades se insertan automáticamente. Aquí solo debes definir el comportamiento, tono y reglas generales.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Instrucciones del Sistema (Prompt)</label>
                <textarea 
                  value={localInstruction}
                  onChange={(e) => setLocalInstruction(e.target.value)}
                  className="w-full h-64 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed"
                  placeholder="Escribe aquí cómo quieres que se comporte el bot..."
                />
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveInstruction}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md"
                  >
                    <Save size={18} /> Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && user.role === UserRole.AGENT && (
            <InternalChat />
          )}

          {activeTab === 'properties' && user.role === UserRole.AGENT && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Publicar Nueva Propiedad</h2>
              
              {user.plan === 'FREE' && myProperties.length >= 10 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
                      <Lock size={20} />
                      <div>
                          <p className="font-bold">Límite de propiedades alcanzado</p>
                          <p className="text-sm">En el plan Gratuito solo puedes subir 10 propiedades. Actualiza a PRO para ilimitadas.</p>
                      </div>
                      <button onClick={() => setActiveTab('subscription')} className="ml-auto bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                          Actualizar Plan
                      </button>
                  </div>
              )}

              <form onSubmit={handleAddProperty} className={`space-y-6 ${user.plan === 'FREE' && myProperties.length >= 10 ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título del Anuncio</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
                  </div>
                  
                  {/* Basic Details needed for AI */}
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                    <input 
                      list="city-list" 
                      type="text" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})} 
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                      placeholder="Escribe o selecciona..."
                    />
                    <datalist id="city-list">
                      {CITIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Precio (€)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
                  </div>

                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Habitaciones</label>
                    <input required type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Baños</label>
                    <input required type="number" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
                  </div>

                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tamaño (m²)</label>
                    <input required type="number" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Propiedad</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as PropertyType})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2">
                      {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Description with AI Button */}
                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Descripción</label>
                        <button 
                            type="button" 
                            onClick={handleGenerateDescription}
                            disabled={isGeneratingDesc}
                            className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors border border-indigo-200"
                        >
                            {isGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                            {isGeneratingDesc ? 'Escribiendo...' : 'Generar con IA'}
                        </button>
                    </div>
                    <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
                  </div>

                  {/* Image Upload Section */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Imágenes ({formData.images.length}/8)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {formData.images.length < 8 && (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <ImageIcon className="text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500 font-medium">Añadir Fotos</span>
                            </div>
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*" 
                        multiple 
                    />
                    <p className="text-xs text-slate-400">Formatos: JPG, PNG. Máximo 8 imágenes.</p>
                  </div>

                  {/* Seasonal Availability Calendar */}
                  {(formData.type === PropertyType.SEPT_JUNE || formData.type === PropertyType.VACATION_RENT || formData.type === PropertyType.STUDENT_RENT) && (
                    <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in">
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Calendar size={16} /> Disponibilidad Mensual
                      </label>
                      <p className="text-xs text-slate-500 mb-3">Marca los meses en los que la propiedad está disponible.</p>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {MONTHS.map((month, index) => {
                           const isSelected = formData.availableMonths.includes(index);
                           return (
                             <button
                               key={month}
                               type="button"
                               onClick={() => toggleMonth(index)}
                               className={`text-xs py-2 px-1 rounded-md border transition-colors ${
                                 isSelected 
                                   ? 'bg-green-600 text-white border-green-700 shadow-sm' 
                                   : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                               }`}
                             >
                               {isSelected && <Check size={12} className="inline mr-1" />}
                               {month}
                             </button>
                           )
                        })}
                      </div>
                    </div>
                  )}

                  {formData.type === PropertyType.VACATION_RENT && (
                    <div className="col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium text-yellow-800 mb-1">Registro Turístico (Obligatorio)</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.touristRegistry} 
                        onChange={e => setFormData({...formData, touristRegistry: e.target.value})} 
                        className="w-full border-yellow-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 border p-2" 
                        placeholder="Ej: VFT/MA/00000"
                      />
                      <p className="text-xs text-yellow-600 mt-1">Requerido por la normativa para alquiler vacacional.</p>
                    </div>
                  )}

                  
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Latitud (Opcional)</label>
                        <input type="number" step="any" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" placeholder="Ej: 36.51" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Longitud (Opcional)</label>
                        <input type="number" step="any" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" placeholder="Ej: -4.88" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                    Publicar Propiedad
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;