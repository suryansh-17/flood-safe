import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import debounce from "lodash/debounce";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Center of India
  const [mapZoom, setMapZoom] = useState(5);

  const handleLocationSelect = (latlng) => {
    setSelectedLocation({
      latitude: latlng.lat,
      longitude: latlng.lng,
    });
  };

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (selectedLocation) {
      navigate("/flood-status", {
        state: {
          customLocation: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          },
        },
      });
    }
  };

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchLocation(query);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleLocationSelectFromSearch = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setSelectedLocation({
      latitude: lat,
      longitude: lon,
    });
    setMapCenter([lat, lon]);
    setMapZoom(13);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto relative">
        <button
          onClick={signOut}
          className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 z-10"
        >
          Sign Out
        </button>
        <div className="bg-white shadow rounded-lg p-8 mt-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to FloodSafe
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            You are logged in as:{" "}
            <span className="font-semibold">{session?.user?.email}</span>
          </p>

          <div className="space-y-6">
            {/* Current Location Option */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Check Current Location
              </h2>
              <button
                onClick={() => navigate("/flood-status")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Check Current Location</span>
              </button>
            </div>

            {/* Custom Location Option */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Select Location
              </h2>

              {/* Search Box */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for a city or location..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-4 bg-white rounded-md shadow-sm border border-gray-200 max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleLocationSelectFromSearch(result)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {result.display_name}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Map */}
              <div className="h-[400px] mb-4 rounded-lg overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker onLocationSelect={handleLocationSelect} />
                  <MapController center={mapCenter} zoom={mapZoom} />
                </MapContainer>
              </div>

              {selectedLocation && (
                <div className="bg-white p-3 rounded-md border border-gray-200 mb-4">
                  <p className="text-sm text-gray-600">Selected Location:</p>
                  <p className="text-xs text-gray-500">
                    Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{" "}
                    {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <button
                onClick={handleCustomLocationSubmit}
                disabled={!selectedLocation}
                className={`w-full ${
                  selectedLocation
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white px-6 py-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Check Selected Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
