export enum UserRole {
  AGENT = 'AGENT',
  CLIENT = 'CLIENT'
}

export type SubscriptionPlan = 'FREE' | 'PRO';

export enum PropertyType {
  SALE = 'Venta',
  LONG_TERM_RENT = 'Alquiler Larga Duración',
  VACATION_RENT = 'Alquiler Vacacional',
  SEPT_JUNE = 'Alquiler Septiembre a Junio',
  STUDENT_RENT = 'Alquiler Estudiantes/Profesores',
  TRANSFER = 'Traspaso',
  LAND = 'Terreno/Solar'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  agencyName?: string;
  plan?: SubscriptionPlan; // New field
  subscriptionDate?: number; // Timestamp
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size: number;
  images: string[];
  agentId: string;
  lat?: number;
  lng?: number;
  touristRegistry?: string;
  availableMonths?: number[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export enum BookingType {
  VISIT = 'VISITA',
  VACATION_STAY = 'ESTANCIA_VACACIONAL'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED', // Sold or Rented
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  id: string;
  propertyId: string;
  agentId: string;
  userId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  startDate: string;
  endDate?: string;
  time?: string;
  type: BookingType;
  status: BookingStatus | string; // Updated to use Enum or string for legacy
  createdAt: number;
  notes?: string; // CRM notes
  dealValue?: number; // CRM Estimated value
}