import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FloodStatus = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });
  const [prediction, setPrediction] = useState({
    status: null,
    loading: false,
    error: null,
  });
  const navigate = useNavigate();
  const locationState = useLocation();

  const fetchFloodPrediction = async (lat, lon) => {
    setPrediction((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(
        `http://localhost:8000/predict?lat=${lat}&lon=${lon}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }
      const data = await response.json();
      setPrediction({
        status: data.prediction,
        loading: false,
        error: null,
      });
    } catch (error) {
      setPrediction((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to get flood prediction. Please try again.",
      }));
    }
  };

  useEffect(() => {
    // If custom location is provided through navigation state
    if (locationState.state?.customLocation) {
      setLocation({
        latitude: locationState.state.customLocation.latitude,
        longitude: locationState.state.customLocation.longitude,
        error: null,
      });
    } else {
      // Get current location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null,
            });
          },
          (error) => {
            setLocation({
              latitude: null,
              longitude: null,
              error:
                "Unable to retrieve your location. Please enable location services.",
            });
          }
        );
      } else {
        setLocation({
          latitude: null,
          longitude: null,
          error: "Geolocation is not supported by your browser.",
        });
      }
    }
  }, [locationState]);

  // Fetch prediction when location changes
  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchFloodPrediction(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Flooded":
        return "text-red-600";
      case "Not Flooded":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Flood Status
          </h1>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Location Details
              </h2>

              {location.error ? (
                <p className="text-red-600">{location.error}</p>
              ) : (
                <div className="space-y-4">
                  <div className="h-[300px] rounded-lg overflow-hidden">
                    {location.latitude && location.longitude && (
                      <MapContainer
                        center={[location.latitude, location.longitude]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                          position={[location.latitude, location.longitude]}
                        />
                      </MapContainer>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Latitude:</span>{" "}
                      {location.latitude
                        ? location.latitude.toFixed(6)
                        : "Loading..."}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Longitude:</span>{" "}
                      {location.longitude
                        ? location.longitude.toFixed(6)
                        : "Loading..."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Flood Status
              </h2>
              {prediction.loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Checking flood status...</p>
                </div>
              ) : prediction.error ? (
                <p className="text-red-600">{prediction.error}</p>
              ) : prediction.status ? (
                <p
                  className={`text-lg font-semibold ${getStatusColor(
                    prediction.status
                  )}`}
                >
                  Status: {prediction.status}
                </p>
              ) : (
                <p className="text-gray-600">
                  {location.latitude && location.longitude
                    ? "Unable to get flood status. Please try again."
                    : "Please enable location services to check flood status."}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            {locationState.state?.customLocation && (
              <button
                onClick={() => navigate("/flood-status")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Check Current Location
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodStatus;
