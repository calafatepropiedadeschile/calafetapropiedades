'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export default function PropertyMap({ lat, lng, title }: Props) {
  return (
    <div style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border-light)' }}>
      <MapContainer 
        center={[lat, lng]} 
        zoom={15} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Custom dark style for the map if possible, but OSM default is fine for MVP
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <strong>{title}</strong>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
