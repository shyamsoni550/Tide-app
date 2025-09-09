import { useState, useEffect } from "react";
import { fetchTideData } from "./api/tideapi";
import { useLocalStorage } from "./hooks/useLocalStorage";

function App() {
  const [tide, setTide] = useState(null);
  const [nextHighTide, setNextHighTide] = useState(null);
  const [nextLowTide, setNextLowTide] = useState(null);
  const [allTides, setAllTides] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [storedLocation, setStoredLocation] = useLocalStorage('tideLocation', null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [weather, setWeather] = useState(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Load stored location on mount
  useEffect(() => {
    if (storedLocation && !coordinates) {
      setCoordinates({ latitude: storedLocation.latitude, longitude: storedLocation.longitude });
      setCity(storedLocation.city);
      // Optionally fetch tides automatically, but for now, just set the data
    }
  }, [storedLocation]);

  // Reverse geocoding to get city name
  const getCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      return data.city || data.locality || data.principalSubdivision || "Unknown Location";
    } catch (error) {
      console.error("Error fetching city name:", error);
      return "Unknown Location";
    }
  };

  const fetchLocationAndTides = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates({ latitude, longitude });

        try {
          // Get city name
          const cityName = await getCityName(latitude, longitude);
          setCity(cityName);

          // Store location
          setStoredLocation({ latitude, longitude, city: cityName });

          // Get tide data
          const data = await fetchTideData(latitude, longitude);

          // Fetch weather data for recommendations
          const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&windspeed_unit=ms&timezone=auto`);
          if (weatherResponse.ok) {
            const weatherData = await weatherResponse.json();
            setWeather(weatherData.current_weather);
          } else {
            setWeather(null);
          }

          if (data.extremes && data.extremes.length > 0) {
            const now = new Date();
            const nextTide = data.extremes.find(e => new Date(e.date) > now);
            const nextHighTide = data.extremes.find(e => new Date(e.date) > now && e.type === "High");
            const nextLowTide = data.extremes.find(e => new Date(e.date) > now && e.type === "Low");
            setTide(nextTide);
            setNextHighTide(nextHighTide);
            setNextLowTide(nextLowTide);
            setAllTides(data.extremes.slice(0, 6)); // Show next 6 tides for better grid layout
          } else {
            setError("No tide data available for this location");
          }
        } catch (err) {
          setError(`Failed to fetch data: ${err.message}`);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 1800000, // 30 minutes
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const clearLocation = () => {
    setTide(null);
    setNextHighTide(null);
    setNextLowTide(null);
    setAllTides([]);
    setError(null);
    setLocation(null);
    setCity("");
    setCoordinates(null);
    setStoredLocation(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeUntilNextTide = (tideDate) => {
    const now = new Date();
    const tideTime = new Date(tideDate);
    const diff = tideTime - now;
    if (diff <= 0) return "Passed";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getMoonPhase = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const c = Math.floor((year - 1900) * 12.3684);
    const e = 365.25 * (year - 1900);
    const jd = c + e + day;
    const b = Math.floor(jd / 29.530588);
    const phase = jd - b * 29.530588;
    if (phase < 1.84566) return "New Moon";
    if (phase < 5.53699) return "Waxing Crescent";
    if (phase < 9.22831) return "First Quarter";
    if (phase < 12.91963) return "Waxing Gibbous";
    if (phase < 16.61096) return "Full Moon";
    if (phase < 20.30228) return "Waning Gibbous";
    if (phase < 23.99361) return "Last Quarter";
    if (phase < 27.68493) return "Waning Crescent";
    return "New Moon";
  };

  const getAIRecommendations = () => {
    if (!tide || !weather) return [];

    const recommendations = [];
    const moonPhase = getMoonPhase();
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour <= 18;
    const windSpeed = weather.windspeed;
    const temperature = weather.temperature;

    // Surfing
    if (tide.type === "High" && windSpeed < 5 && temperature > 15 && isDaytime) {
      recommendations.push({
        activity: "Surfing",
        reason: "High tide with calm winds and good temperature - perfect wave conditions!",
        icon: "🏄‍♂️"
      });
    }

    // Fishing
    if (tide.type === "Low" && (moonPhase === "Full Moon" || moonPhase === "New Moon") && currentHour >= 5 && currentHour <= 9) {
      recommendations.push({
        activity: "Fishing",
        reason: "Low tide during major moon phase and dawn - optimal fishing time!",
        icon: "🎣"
      });
    }

    // Beach Walks
    if (tide.type === "Low" && windSpeed < 10 && temperature > 10) {
      recommendations.push({
        activity: "Beach Walks",
        reason: "Low tide exposes more sand, calm weather for a pleasant walk.",
        icon: "🚶‍♂️"
      });
    }

    // Swimming
    if (tide.type === "High" && temperature > 20 && windSpeed < 5) {
      recommendations.push({
        activity: "Swimming",
        reason: "High tide with warm water and calm conditions - safe and enjoyable!",
        icon: "🏊‍♂️"
      });
    }

    // Boating
    if (tide.type === "High" && windSpeed < 8 && isDaytime) {
      recommendations.push({
        activity: "Boating",
        reason: "High tide with moderate winds - ideal for boating activities.",
        icon: "⛵"
      });
    }

    return recommendations.slice(0, 3); // Limit to top 3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8 relative">
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">🌊 Tide Tracker</h1>
          <p className="text-blue-600 dark:text-blue-200 text-lg">Stay updated with tide information</p>
        </div>

        {/* Current Time & Location Card - Different Color Scheme */}
        <div className="bg-gradient-to-r from-amber-100/20 to-orange-100/20 dark:from-amber-500/20 dark:to-orange-500/20 backdrop-blur-md rounded-3xl p-8 mb-8 border border-amber-300/30 dark:border-amber-300/30 shadow-2xl">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-3">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </div>
            <div className="text-amber-700 dark:text-amber-200 text-lg mb-4">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {city && (
              <div className="flex items-center justify-center text-amber-900 dark:text-amber-100 bg-amber-200/20 dark:bg-amber-500/20 rounded-full px-6 py-2 mx-auto w-fit">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-lg">{city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button - Different Color Scheme */}
        <div className="text-center mb-8">
          {!coordinates ? (
            <button
              onClick={fetchLocationAndTides}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:from-emerald-500 hover:to-teal-600 dark:hover:from-emerald-600 dark:hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting Location...
                </div>
              ) : (
                "📍 Get Tide Information"
              )}
            </button>
          ) : (
            <button
              onClick={clearLocation}
              className="bg-gradient-to-r from-red-400 to-pink-500 dark:from-red-500 dark:to-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:from-red-500 hover:to-pink-600 dark:hover:from-red-600 dark:hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              🗑️ Clear Location
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100/20 dark:bg-red-500/20 backdrop-blur-md border border-red-300/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center text-red-900 dark:text-red-100">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">{error}</span>
            </div>
          </div>
        )}

        {/* Next Tides Card - Highlighted */}
        {(nextHighTide || nextLowTide) && (
          <div className="bg-gradient-to-r from-cyan-100/25 to-blue-100/25 dark:from-cyan-500/25 dark:to-blue-500/25 backdrop-blur-md rounded-3xl p-8 mb-8 border border-cyan-300/40 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 mb-6 text-center">🎯 Next Tides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nextHighTide && (
                <div className="text-center">
                  <div className="text-4xl mb-3">🌊</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Next High Tide</div>
                  <div className="text-cyan-700 dark:text-cyan-200 text-lg mb-2">
                    {formatDate(nextHighTide.date)} at {formatTime(nextHighTide.date)}
                  </div>
                  <div className="text-cyan-600 dark:text-cyan-300 text-base mb-2">
                    Time until: {getTimeUntilNextTide(nextHighTide.date)}
                  </div>
                  <div className="text-xl font-bold text-cyan-900 dark:text-cyan-100 bg-cyan-200/20 dark:bg-cyan-500/20 rounded-full px-4 py-2">
                    {nextHighTide.height.toFixed(2)}m
                  </div>
                </div>
              )}
              {nextLowTide && (
                <div className="text-center">
                  <div className="text-4xl mb-3">🏖️</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Next Low Tide</div>
                  <div className="text-cyan-700 dark:text-cyan-200 text-lg mb-2">
                    {formatDate(nextLowTide.date)} at {formatTime(nextLowTide.date)}
                  </div>
                  <div className="text-cyan-600 dark:text-cyan-300 text-base mb-2">
                    Time until: {getTimeUntilNextTide(nextLowTide.date)}
                  </div>
                  <div className="text-xl font-bold text-cyan-900 dark:text-cyan-100 bg-cyan-200/20 dark:bg-cyan-500/20 rounded-full px-4 py-2">
                    {nextLowTide.height.toFixed(2)}m
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI-Based Activity Recommendations */}
        {tide && weather && (
          <div className="bg-gradient-to-r from-green-100/25 to-emerald-100/25 dark:from-green-500/25 dark:to-emerald-500/25 backdrop-blur-md rounded-3xl p-8 mb-8 border border-green-300/40 shadow-2xl">
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-6 text-center">🤖 AI Activity Recommendations</h3>
            <div className="space-y-4">
              {getAIRecommendations().length > 0 ? (
                getAIRecommendations().map((rec, index) => (
                  <div key={index} className="flex items-center bg-green-50/50 dark:bg-green-500/10 rounded-2xl p-4">
                    <div className="text-3xl mr-4">{rec.icon}</div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{rec.activity}</div>
                      <div className="text-green-700 dark:text-green-200 text-sm">{rec.reason}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-900 dark:text-white">
                  No specific recommendations at this time. Check back later or explore general activities!
                </div>
              )}
            </div>
          </div>
        )}
        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Powered by WorldTides API
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
