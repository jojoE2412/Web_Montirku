import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const DEFAULT_LOCATION = { lat: -6.2088, lng: 106.8456, address: "Jakarta, Indonesia" };

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState<LatLng | null>(
    initialLocation ? new LatLng(initialLocation.lat, initialLocation.lng) : null
  );
  const [address, setAddress] = useState<string>("");

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click: async (e: L.LeafletMouseEvent) => {
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
    const setDefaultLocation = async () => {
      const lat = DEFAULT_LOCATION.lat;
      const lng = DEFAULT_LOCATION.lng;
      const pos = new LatLng(lat, lng);
      setPosition(pos);
      setAddress(DEFAULT_LOCATION.address);
      onLocationSelect(DEFAULT_LOCATION);
    };

    if (initialLocation) {
      const pos = new LatLng(initialLocation.lat, initialLocation.lng);
      setPosition(pos);
      reverseGeocode(initialLocation.lat, initialLocation.lng).then((addr) => {
        setAddress(addr);
        onLocationSelect({ ...initialLocation, address: addr });
      });
      return;
    }

    if (navigator.geolocation) {
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
        () => {
          setDefaultLocation();
        }
      );
    } else {
      setDefaultLocation();
    }
  }, [initialLocation, onLocationSelect, reverseGeocode]);

  return (
    <div className="space-y-4">
      <div className="h-64 w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={position || [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
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

      <p className="text-xs text-gray-500">Klik pada peta untuk memilih lokasi</p>
    </div>
  );
};

export default MapPicker;
