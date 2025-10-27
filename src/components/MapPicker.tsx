import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, X } from 'lucide-react'; // Added MapPin

// Debounce utility function
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Fix for default marker icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = {
  lat: -6.2088, // Jakarta latitude
  lng: 106.8456 // Jakarta longitude
};

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [address, setAddress] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null); // To store watchPosition ID

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'MontirKuApp/1.0 (your-email@example.com)' } }
      );
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []);

  const forwardGeocode = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        { headers: { 'User-Agent': 'MontirKuApp/1.0 (your-email@example.com)' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setSearchResults(data.map((result: any) => ({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          display_name: result.display_name,
        })));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error during forward geocoding:", error);
      setSearchResults([]);
    }
  }, []);

  const handleGeolocationSuccess = useCallback(async (pos: GeolocationPosition) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const newPosition = { lat, lng };
    setPosition(newPosition);

    const addressText = await reverseGeocode(lat, lng);
    setAddress(addressText);
    onLocationSelect({ lat, lng, address: addressText });
    setSearchTerm(addressText);
    if (mapRef.current) {
      mapRef.current.setView(newPosition, 13); // Center map on current location
    }
  }, [onLocationSelect, reverseGeocode]);

  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    console.error("Error getting current location:", error);
    alert("Gagal mendapatkan lokasi terkini. Pastikan Anda mengizinkan akses lokasi.");
    // Fallback to default if current location fails
    setPosition(DEFAULT_CENTER);
    setAddress("Jakarta, Indonesia");
    onLocationSelect({ ...DEFAULT_CENTER, address: "Jakarta, Indonesia" });
    setSearchTerm("Jakarta, Indonesia");
    if (mapRef.current) {
      mapRef.current.setView(DEFAULT_CENTER, 13);
    }
    setIsTracking(false); // Stop tracking on error
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, [onLocationSelect, reverseGeocode]);

  const toggleTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }

    if (isTracking) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log("Stopped continuous location tracking.");
      }
      setIsTracking(false);
    } else {
      // Start tracking
      console.log("Starting continuous location tracking...");
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      setIsTracking(true);
    }
  }, [isTracking, handleGeolocationSuccess, handleGeolocationError]);

  useEffect(() => {
    // This effect is ONLY for setting the initial state of the map
    // from the parent, or a default if nothing is provided.
    // It should NOT call onLocationSelect, as that creates a loop.
    const setInitialState = async (loc: { lat: number; lng: number }) => {
      setPosition(loc);
      const addressText = await reverseGeocode(loc.lat, loc.lng);
      setAddress(addressText);
      setSearchTerm(addressText);
      if (mapRef.current) {
        mapRef.current.setView(loc, 13);
      }
    };

    // If there's an initial location from the parent and we haven't set our position yet, use it.
    if (initialLocation && !position) {
      setInitialState(initialLocation);
    } 
    // If there's no initial location and no position, set a default.
    else if (!initialLocation && !position) {
      setInitialState(DEFAULT_CENTER);
    }
  }, [initialLocation, position, reverseGeocode]);

  const debouncedForwardGeocode = useCallback(
    debounce((query: string) => forwardGeocode(query), 500), // 500ms debounce
    [forwardGeocode]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 2) {
      debouncedForwardGeocode(value);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = async (result: any) => {
    const lat = result.lat;
    const lng = result.lng;
    const newPosition = { lat, lng };
    setPosition(newPosition);
    setAddress(result.display_name);
    onLocationSelect({ lat, lng, address: result.display_name });
    setSearchTerm(result.display_name);
    setSearchResults([]);
    if (mapRef.current) {
        mapRef.current.setView(newPosition, 13);
    }
  };

  function MapEvents() {
    const map = useMapEvents({
      click: async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const newPosition = { lat, lng };
        setPosition(newPosition);

        const addressText = await reverseGeocode(lat, lng);
        setAddress(addressText);
        onLocationSelect({ lat, lng, address: addressText });
        setSearchResults([]);
        setSearchTerm(addressText);
        map.setView(newPosition, map.getZoom());
      },
    });
    useEffect(() => {
      if (position && mapRef.current) {
        mapRef.current.setView(position, mapRef.current.getZoom());
      }
    }, [position]);
    return null;
  }

  function MapRefUpdater() {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
    }, [map]);
    return null;
  }

  // Cleanup watchPosition on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <button
        onClick={toggleTracking}
        className={`w-full py-2 px-4 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {isTracking ? <X size={20} /> : <MapPin size={20} />}
        <span>{isTracking ? 'Hentikan Lacak Lokasi' : 'Lacak Lokasi Terkini'}</span>
      </button>

      <div className="h-64 w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} />}
          <MapEvents />
          <MapRefUpdater />
        </MapContainer>
      </div>

      {address && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Lokasi Terpilih:</p>
          <p className="text-sm text-gray-600">{address}</p>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Cari lokasi atau alamat..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {searchResults.length > 0 && searchTerm.length > 2 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <li
                key={index}
                onClick={() => handleSearchResultClick(result)}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500">Klik pada peta atau cari untuk memilih lokasi</p>
    </div>
  );
};

export default MapPicker;