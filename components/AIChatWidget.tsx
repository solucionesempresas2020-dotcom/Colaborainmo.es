import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Paperclip, MapPin, ImageIcon, ExternalLink, Phone } from 'lucide-react';
import { generateResponse, ChatResponse } from '../services/geminiService';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  groundingMetadata?: any;
}

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {role: 'model', text: '¡Hola! Soy ColaboraBot. Puedo analizar fotos de propiedades o buscar ubicaciones en el mapa.'}
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{data: string, mime: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { properties, aiInstruction } = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove header data:image/...;base64,
        const base64Data = base64String.split(',')[1];
        setAttachedImage({
          data: base64Data,
          mime: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || isLoading) return;

    const userMsg = input;
    const currentImage = attachedImage;
    
    // Reset inputs
    setInput('');
    setAttachedImage(null);

    // Add user message
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMsg, 
      image: currentImage ? `data:${currentImage.mime};base64,${currentImage.data}` : undefined 
    }]);
    
    setIsLoading(true);

    const history = messages.map(m => `${m.role === 'user' ? 'Usuario' : 'Modelo'}: ${m.text}`);

    const response: ChatResponse = await generateResponse(
      userMsg || "Analiza esta imagen", 
      properties, 
      history,
      currentImage?.data,
      currentImage?.mime,
      aiInstruction // Pass the custom instruction here
    );

    setMessages(prev => [...prev, { 
      role: 'model', 
      text: response.text,
      groundingMetadata: response.groundingMetadata
    }]);
    
    setIsLoading(false);
  };

  // Helper function to detect URLs and render them as links or buttons
  const renderMessageText = (text: string, role: 'user' | 'model') => {
    // Split text by URLs
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    
    return parts.map((part, i) => {
      if (part.match(/^https?:\/\//)) {
        // Special styling for WhatsApp links
        if (part.includes('wa.me') || part.includes('whatsapp.com')) {
           return (
             <a 
               key={i} 
               href={part} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold my-1 transition-colors no-underline mx-1 shadow-sm"
             >
               <Phone size={14} /> Contactar por WhatsApp
             </a>
           );
        }
        
        // Standard links
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`hover:underline break-all inline-flex items-center gap-1 ${role === 'user' ? 'text-blue-100' : 'text-blue-600'}`}
          >
            {part} <ExternalLink size={10} />
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <Bot size={24} />
          <span className="font-semibold hidden sm:inline">Asistente IA</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-96 flex flex-col border border-slate-200 overflow-hidden h-[600px] transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Asistente ColaboraInmo</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full block"></span>
                  Gemini Pro + Maps
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {/* Persistent WhatsApp Button */}
               <a 
                 href="https://wa.me/34642380993?text=Hola,%20necesito%20ayuda%20humana%20desde%20el%20Asistente" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105"
                 title="Hablar por WhatsApp"
               >
                 <Phone size={18} fill="currentColor" className="text-white" />
               </a>

               <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
                <X size={20} />
               </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 text-sm rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="max-w-full h-32 object-cover rounded-lg mb-2 border border-white/20" />
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {renderMessageText(msg.text, msg.role)}
                  </p>
                </div>

                {/* Grounding Chips (Maps/Web) */}
                {msg.groundingMetadata?.groundingChunks && (
                  <div className="mt-2 max-w-[85%] space-y-1">
                     {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                        if (chunk.maps?.placeId || chunk.maps?.uri) {
                          return (
                            <a key={i} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-white border border-slate-200 p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                              <MapPin size={14} className="text-red-500" />
                              <span className="font-medium">{chunk.maps.title || "Ubicación en Google Maps"}</span>
                            </a>
                          )
                        }
                        return null;
                     })}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <span className="text-xs text-slate-500">{attachedImage ? "Analizando imagen..." : "Escribiendo..."}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            {attachedImage && (
              <div className="flex items-center gap-2 mb-2 bg-slate-100 p-2 rounded-lg">
                <ImageIcon size={16} className="text-blue-500" />
                <span className="text-xs text-slate-600 flex-grow truncate">Imagen adjunta</span>
                <button onClick={() => setAttachedImage(null)} className="text-slate-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full transition-colors ${attachedImage ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Adjuntar imagen"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={attachedImage ? "Pregunta sobre la imagen..." : "Escribe un mensaje..."}
                className="flex-grow text-sm border-slate-200 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button 
                onClick={handleSend} 
                disabled={isLoading || (!input.trim() && !attachedImage)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-full transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;