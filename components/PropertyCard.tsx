import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { MapPin, BedDouble, Bath, Maximize, FileCheck, Image as ImageIcon } from 'lucide-react';

interface Props {
  property: Property;
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  // Fallback for legacy data or empty images
  const mainImage = property.images && property.images.length > 0 ? property.images[0] : 'https://picsum.photos/800/600';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden group">
        <img 
          src={mainImage} 
          alt={property.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          {property.type}
        </div>
        <div className="absolute bottom-0 left-0 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-tr-lg backdrop-blur-sm">
          Ref: {property.id}
        </div>
        
        {property.images && property.images.length > 1 && (
           <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
             <ImageIcon size={10} />
             {property.images.length}
           </div>
        )}

        {property.touristRegistry && (
           <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center gap-1">
             <FileCheck size={12} />
             Licencia: {property.touristRegistry}
           </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{property.title}</h3>
        </div>
        
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin size={16} className="mr-1 text-blue-500" />
          {property.city}
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">{property.description}</p>
        
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mb-4">
          <div className="flex flex-col items-center text-slate-500 text-xs">
            <BedDouble size={18} className="mb-1 text-slate-400" />
            {property.bedrooms} Hab.
          </div>
          <div className="flex flex-col items-center text-slate-500 text-xs">
            <Bath size={18} className="mb-1 text-slate-400" />
            {property.bathrooms} Baños
          </div>
          <div className="flex flex-col items-center text-slate-500 text-xs">
            <Maximize size={18} className="mb-1 text-slate-400" />
            {property.size} m²
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto">
             <span className="text-2xl font-bold text-blue-700">
            {property.price.toLocaleString('es-ES')} €
            {property.type.includes('Alquiler') && '/mes'}
          </span>
          <Link 
            to={`/property/${property.id}`}
            className="text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;