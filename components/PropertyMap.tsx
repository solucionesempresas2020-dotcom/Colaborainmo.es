import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { Property } from '../types';

interface Props {
  properties: Property[];
}

const PropertyMap: React.FC<Props> = ({ properties }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Initialize map
    const map = L.map(mapContainer.current).setView([36.6, -4.5], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    const bounds = L.latLngBounds([]);

    properties.forEach(p => {
      if (p.lat && p.lng) {
        bounds.extend([p.lat, p.lng]);
        
        const mainImage = p.images && p.images.length > 0 ? p.images[0] : 'https://picsum.photos/200/100';

        // Custom simple marker using divIcon to avoid asset loading issues in some environments
        const icon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -10]
        });

        L.marker([p.lat, p.lng], { icon })
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 200px;">
              <div style="height: 100px; width: 100%; background-image: url('${mainImage}'); background-size: cover; background-position: center; border-radius: 4px; margin-bottom: 8px;"></div>
              <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 4px; color: #1e293b;">${p.title}</h3>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                 <span style="color: #2563eb; font-weight: bold;">${p.price.toLocaleString()} €</span>
                 <span style="font-size: 12px; color: #64748b;">${p.city}</span>
              </div>
            </div>
          `)
          .addTo(markersLayer.current!);
      }
    });

    // Auto fit bounds if we have markers
    if (properties.some(p => p.lat && p.lng)) {
        // Add a small delay to ensure container size is calculated
        setTimeout(() => {
             if (bounds.isValid() && mapInstance.current) {
                mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        }, 100);
    }
  }, [properties]);

  return <div ref={mapContainer} className="h-[500px] w-full rounded-xl shadow-md z-0 bg-slate-100" />;
};

export default PropertyMap;