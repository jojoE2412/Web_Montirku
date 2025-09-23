import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState<LatLng | null>(
    initialLocation ? new LatLng(initialLocation.lat, initialLocation.lng) : null
  );
  const [address, setAddress] = useState<string>('');

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition(e.latlng);
        
        const addressText = await reverseGeocode(lat, lng);
        setAddress(addressText);
        onLocationSelect({ lat, lng, address: addressText });
      },
    });
    return null;
  };

  useEffect(() => {
    if (navigator.geolocation && !initialLocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const newPosition = new LatLng(lat, lng);
          setPosition(newPosition);
          
          const addressText = await reverseGeocode(lat, lng);
          setAddress(addressText);
          onLocationSelect({ lat, lng, address: addressText });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Jakarta
          const defaultLat = -6.2088;
          const defaultLng = 106.8456;
          const defaultPosition = new LatLng(defaultLat, defaultLng);
          setPosition(defaultPosition);
          setAddress('Jakarta, Indonesia');
          onLocationSelect({ lat: defaultLat, lng: defaultLng, address: 'Jakarta, Indonesia' });
        }
      );
    }
  }, [initialLocation, onLocationSelect]);

  return (
    <div className="space-y-4">
      <div className="h-64 w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={position || [-6.2088, 106.8456]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} />}
          <MapEvents />
        </MapContainer>
      </div>
      
      {address && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Lokasi Terpilih:</p>
          <p className="text-sm text-gray-600">{address}</p>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Klik pada peta untuk memilih lokasi
      </p>
    </div>
  );
};

export default MapPicker;