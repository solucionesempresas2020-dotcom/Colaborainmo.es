import { Property, PropertyType } from './types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Ático de Lujo con Vistas al Mar',
    description: 'Espectacular ático en la Milla de Oro. Disfruta de atardeceres inigualables desde su amplia terraza privada. El complejo cuenta con seguridad 24h, jardines tropicales y piscina comunitaria. Acabados de primera calidad, suelos de mármol y cocina equipada.',
    price: 850000,
    city: 'Marbella',
    type: PropertyType.SALE,
    bedrooms: 3,
    bathrooms: 2,
    size: 150,
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=101',
      'https://picsum.photos/800/600?random=102'
    ],
    agentId: 'admin',
    lat: 36.5099,
    lng: -4.8864
  },
  {
    id: '2',
    title: 'Apartamento Cerca de la Universidad',
    description: 'Ideal para profesores o estudiantes. Totalmente amueblado, disponible de septiembre a junio. Zona muy tranquila con todos los servicios a mano: supermercados, farmacias y parada de autobús. Incluye wifi y comunidad en el precio.',
    price: 800,
    city: 'Málaga',
    type: PropertyType.SEPT_JUNE,
    availableMonths: [8, 9, 10, 11, 0, 1, 2, 3, 4, 5], // Sept to June
    bedrooms: 2,
    bathrooms: 1,
    size: 70,
    images: [
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=201'
    ],
    agentId: 'admin',
    lat: 36.7213,
    lng: -4.4214
  },
  {
    id: '3',
    title: 'Villa Moderna en Mijas Costa',
    description: 'Villa independiente con jardín privado. Zona tranquila y residencial, perfecta para familias. Diseño contemporáneo con grandes ventanales que aportan mucha luz natural.',
    price: 450000,
    city: 'Mijas',
    type: PropertyType.SALE,
    bedrooms: 4,
    bathrooms: 3,
    size: 220,
    images: [
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=301',
      'https://picsum.photos/800/600?random=302',
      'https://picsum.photos/800/600?random=303'
    ],
    agentId: 'admin',
    lat: 36.5957,
    lng: -4.6375
  },
  {
    id: '4',
    title: 'Local Comercial en Puerto Marina',
    description: 'Oportunidad de traspaso. Restaurante funcionando a pleno rendimiento en una de las zonas más turísticas. Licencia de cocina y terraza amplia.',
    price: 120000,
    city: 'Benalmádena',
    type: PropertyType.TRANSFER,
    bedrooms: 0,
    bathrooms: 2,
    size: 100,
    images: [
      'https://picsum.photos/800/600?random=4'
    ],
    agentId: 'admin',
    lat: 36.5972,
    lng: -4.5207
  },
  {
    id: '5',
    title: 'Piso Vacacional en Los Boliches',
    description: 'Alquiler de corta temporada. Primera línea de playa. Despierta con el sonido del mar. Apartamento reformado y climatizado.',
    price: 1500,
    city: 'Fuengirola',
    type: PropertyType.VACATION_RENT,
    touristRegistry: 'VFT/MA/12345',
    bedrooms: 2,
    bathrooms: 1,
    size: 85,
    images: [
      'https://picsum.photos/800/600?random=5',
      'https://picsum.photos/800/600?random=501'
    ],
    agentId: 'admin',
    lat: 36.5396,
    lng: -4.6226
  },
  {
    id: '6',
    title: 'Parcela Urbana con Proyecto',
    description: 'Terreno listo para construir la casa de tus sueños. Vistas panorámicas a la montaña y orientación sur.',
    price: 180000,
    city: 'Mijas',
    type: PropertyType.LAND,
    bedrooms: 0,
    bathrooms: 0,
    size: 500,
    images: [
      'https://picsum.photos/800/600?random=6'
    ],
    agentId: 'admin',
    lat: 36.6200,
    lng: -4.6500
  }
];

// Expanded list for suggestions, but user can type anything
export const CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma',
  'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón',
  'Marbella', 'Benalmádena', 'Fuengirola', 'Mijas', 'Estepona', 'Torremolinos', 
  'Benahavís', 'Nerja', 'Rincón de la Victoria', 'Granada', 'Cádiz', 'Almería'
].sort();

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];