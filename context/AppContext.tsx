import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Property, UserRole, Message, Booking, SubscriptionPlan } from '../types';
import { INITIAL_PROPERTIES } from '../constants';

interface AppContextType {
  user: User | null;
  users: User[];
  properties: Property[];
  collaboratorMessages: Message[];
  bookings: Booking[];
  aiInstruction: string;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  register: (user: User) => boolean;
  addProperty: (property: Property) => boolean; // Returns true if success, false if limit reached
  sendCollaboratorMessage: (text: string) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: string) => void;
  updateAiInstruction: (instruction: string) => void;
  upgradeSubscription: () => void; // Mock function for Monei payment success
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Updated instructions with your specific WhatsApp and centralized control logic
const DEFAULT_AI_INSTRUCTION = `Eres "ColaboraBot", el asistente central de ColaboraInmo.
Tu función es captar clientes y dirigir TODAS las consultas al administrador central.

REGLA DE ORO DE CONTACTO:
Si un usuario (cliente o agente) quiere contactar, visitar una propiedad, o tiene dudas específicas, NUNCA des el contacto del agente individual de la propiedad.
SIEMPRE debes dirigirlos al WhatsApp Central: 642380993.

Instrucciones:
1. Sé amable y comercial.
2. Si preguntan por detalles de una propiedad, responde usando la lista de propiedades proporcionada.
3. Para agendar visitas o contacto humano: "Para gestionar tu visita o consulta, contacta directamente con nuestra central en WhatsApp: 642380993".
4. Si preguntan por ubicación, usa la herramienta de Google Maps.`;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [aiInstruction, setAiInstruction] = useState(DEFAULT_AI_INSTRUCTION);
  const [collaboratorMessages, setCollaboratorMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      senderId: 'sys',
      senderName: 'Sistema',
      text: 'Bienvenido al chat de colaboradores de ColaboraInmo.',
      timestamp: Date.now(),
      isSystem: true
    }
  ]);

  // Load from local storage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('colaborainmo_session');
    const storedUsers = localStorage.getItem('colaborainmo_users');
    const storedProps = localStorage.getItem('colaborainmo_props');
    const storedMessages = localStorage.getItem('colaborainmo_messages');
    const storedBookings = localStorage.getItem('colaborainmo_bookings');
    const storedInstruction = localStorage.getItem('colaborainmo_ai_instruction');
    
    if (storedSession) {
        const parsedUser = JSON.parse(storedSession);
        // Ensure legacy users have a plan
        if (!parsedUser.plan) parsedUser.plan = 'FREE';
        setUser(parsedUser);
    }
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedProps) setProperties(JSON.parse(storedProps));
    if (storedMessages) setCollaboratorMessages(JSON.parse(storedMessages));
    if (storedBookings) setBookings(JSON.parse(storedBookings));
    if (storedInstruction) setAiInstruction(storedInstruction);
  }, []);

  const login = (email: string, password?: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      if (foundUser.password && password) {
        if (foundUser.password !== password) return false;
      }
      
      // Ensure plan exists
      const userWithPlan = { ...foundUser, plan: foundUser.plan || 'FREE' };
      setUser(userWithPlan);
      localStorage.setItem('colaborainmo_session', JSON.stringify(userWithPlan));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('colaborainmo_session');
  };

  const register = (userData: User): boolean => {
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return false; 
    }

    // Default plan is FREE
    const newUser = { ...userData, plan: 'FREE' as SubscriptionPlan };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('colaborainmo_users', JSON.stringify(updatedUsers));
    
    setUser(newUser);
    localStorage.setItem('colaborainmo_session', JSON.stringify(newUser));
    return true;
  };

  const upgradeSubscription = () => {
    if (!user) return;
    const updatedUser: User = { ...user, plan: 'PRO', subscriptionDate: Date.now() };
    
    // Update current session
    setUser(updatedUser);
    localStorage.setItem('colaborainmo_session', JSON.stringify(updatedUser));

    // Update user in 'database' (users array)
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('colaborainmo_users', JSON.stringify(updatedUsers));
  };

  const addProperty = (property: Property): boolean => {
    if (!user) return false;

    // Check Limits - UPDATED TO 10 FOR FREE PLAN
    const myPropertiesCount = properties.filter(p => p.agentId === user.id).length;
    const limit = user.plan === 'PRO' ? Infinity : 10; // Limit increased to 10

    if (myPropertiesCount >= limit) {
        return false;
    }

    const updatedProps = [property, ...properties];
    setProperties(updatedProps);
    localStorage.setItem('colaborainmo_props', JSON.stringify(updatedProps));
    return true;
  };

  const sendCollaboratorMessage = (text: string) => {
    if (!user) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text,
      timestamp: Date.now()
    };
    const updatedMessages = [...collaboratorMessages, newMessage];
    setCollaboratorMessages(updatedMessages);
    localStorage.setItem('colaborainmo_messages', JSON.stringify(updatedMessages));
  };

  const addBooking = (booking: Booking) => {
    const updatedBookings = [...bookings, booking];
    setBookings(updatedBookings);
    localStorage.setItem('colaborainmo_bookings', JSON.stringify(updatedBookings));
  };

  const updateBookingStatus = (id: string, status: string) => {
      const updatedBookings = bookings.map(b => b.id === id ? { ...b, status } : b);
      setBookings(updatedBookings);
      localStorage.setItem('colaborainmo_bookings', JSON.stringify(updatedBookings));
  };

  const updateAiInstruction = (instruction: string) => {
    setAiInstruction(instruction);
    localStorage.setItem('colaborainmo_ai_instruction', instruction);
  };

  return (
    <AppContext.Provider value={{ 
      user,
      users,
      properties, 
      collaboratorMessages,
      bookings,
      aiInstruction,
      login, 
      logout, 
      register, 
      addProperty,
      sendCollaboratorMessage,
      addBooking,
      updateBookingStatus,
      updateAiInstruction,
      upgradeSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};