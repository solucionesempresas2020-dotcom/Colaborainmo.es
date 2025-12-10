import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Users, User } from 'lucide-react';

const InternalChat: React.FC = () => {
  const { user, collaboratorMessages, sendCollaboratorMessage } = useApp();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [collaboratorMessages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendCollaboratorMessage(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 p-4 flex items-center justify-between text-white">
        <h2 className="font-semibold flex items-center gap-2">
          <Users size={20} className="text-green-400" />
          Chat Colaboradores
        </h2>
        <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
          En vivo
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4" ref={scrollRef}>
        {collaboratorMessages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const isSystem = msg.isSystem;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-end gap-2 max-w-[80%]">
                {!isMe && (
                   <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                     {msg.senderName.charAt(0)}
                   </div>
                )}
                <div 
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {!isMe && <p className="text-[10px] font-bold text-slate-500 mb-0.5">{msg.senderName}</p>}
                  {msg.text}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe a otros agentes..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalChat;