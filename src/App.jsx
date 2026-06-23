import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  Anchor,
  Activity,
  AlertCircle,
  Compass,
  LocateFixed,
  LogOut,
  MapPin,
  Navigation,
  Sailboat,
  Sparkles,
  Thermometer,
  Trash2,
  Waves,
  Wind,
} from "lucide-react";
import { fetchTideData } from "./api/tideapi";
import { saveUserLocation } from "./api/savedLocations";
import AuthForm from "./components/AuthForm";
import MetricCard from "./components/MetricCard";
import TideChart from "./components/TideChart";
import { useAuth } from "./hooks/useAuth";
import { useLocalStorage } from "./hooks/useLocalStorage";

const navItems = [
  { label: "Overview", icon: Anchor },
  { label: "Tides", icon: Waves },
  { label: "Routes", icon: Compass },
];

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.08 },
  }),
};

function App() {
  const auth = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [tideInfo, setTideInfo] = useState(null);
  const [tide, setTide] = useState(null);
  const [nextHighTide, setNextHighTide] = useState(null);
  const [nextLowTide, setNextLowTide] = useState(null);
  const [marine, setMarine] = useState(null);
  const [marineDisclaimer, setMarineDisclaimer] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [city, setCity] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [storedLocation, setStoredLocation] = useLocalStorage("tideLocation", null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (storedLocation && !coordinates) {
      setCoordinates({ latitude: storedLocation.latitude, longitude: storedLocation.longitude });
      setCity(storedLocation.city);
    }
  }, [storedLocation, coordinates]);

  const getCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      return data.city || data.locality || data.principalSubdivision || "Unknown Location";
    } catch (cityError) {
      console.error("Error fetching city name:", cityError);
      return "Unknown Location";
    }
  };

  const hydrateForecast = async (latitude, longitude, cityName) => {
    const data = await fetchTideData(latitude, longitude);
    setTideInfo(data);
    setMarine(data.current);
    setMarineDisclaimer(data.disclaimer);

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&windspeed_unit=ms&timezone=auto`
    );
    setWeather(weatherResponse.ok ? (await weatherResponse.json()).current_weather : null);

    if (data.extremes?.length) {
      const now = new Date();
      setTide(data.extremes.find((event) => new Date(event.date) > now));
      setNextHighTide(data.extremes.find((event) => new Date(event.date) > now && event.type === "High"));
      setNextLowTide(data.extremes.find((event) => new Date(event.date) > now && event.type === "Low"));
    } else {
      setError(`No modeled tide extremes are available near ${cityName}.`);
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
          const cityName = await getCityName(latitude, longitude);
          setCity(cityName);
          setStoredLocation({ latitude, longitude, city: cityName });

          saveUserLocation({
            userId: auth.user?.id,
            city: cityName,
            latitude,
            longitude,
          }).catch((saveError) => {
            console.error("Unable to save location:", saveError);
          });

          await hydrateForecast(latitude, longitude, cityName);
        } catch (forecastError) {
          setError(`Failed to fetch data: ${forecastError.message}`);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setError(`Location access denied: ${geoError.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 1800000,
        maximumAge: 300000,
      }
    );
  };

  const clearLocation = () => {
    setTideInfo(null);
    setTide(null);
    setNextHighTide(null);
    setNextLowTide(null);
    setMarine(null);
    setMarineDisclaimer("");
    setWeather(null);
    setError(null);
    setCity("");
    setCoordinates(null);
    setStoredLocation(null);
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const getTimeUntilNextTide = (tideDate) => {
    const diff = new Date(tideDate) - new Date();
    if (diff <= 0) return "Passed";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getMoonPhase = () => {
    const now = new Date();
    const year = now.getFullYear();
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

  const recommendations = useMemo(() => {
    if (!tide || !weather) return [];

    const next = [];
    const moonPhase = getMoonPhase();
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour <= 18;
    const windSpeed = weather.windspeed;
    const temperature = weather.temperature;

    if (tide.type === "High" && windSpeed < 5 && temperature > 15 && isDaytime) {
      next.push({ activity: "Surfing", reason: "High tide, calm wind, and comfortable temperature.", icon: Waves });
    }
    if (tide.type === "Low" && (moonPhase === "Full Moon" || moonPhase === "New Moon") && currentHour >= 5 && currentHour <= 9) {
      next.push({ activity: "Fishing", reason: "Low tide near a major moon phase during the morning window.", icon: Anchor });
    }
    if (tide.type === "Low" && windSpeed < 10 && temperature > 10) {
      next.push({ activity: "Beach walk", reason: "Low tide opens more shoreline with manageable wind.", icon: Navigation });
    }
    if (tide.type === "High" && temperature > 20 && windSpeed < 5) {
      next.push({ activity: "Swimming", reason: "Warmer conditions and calm wind create a better swim window.", icon: Activity });
    }
    if (tide.type === "High" && windSpeed < 8 && isDaytime) {
      next.push({ activity: "Boating", reason: "High water and moderate wind are favorable for light boating.", icon: Sailboat });
    }

    return next.slice(0, 3);
  }, [tide, weather]);

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ocean-night text-white">
        <div className="glass-panel rounded-3xl px-8 py-6 font-display text-lg">Loading your account...</div>
      </div>
    );
  }

  if (!auth.session && !guestMode) {
    return (
      <AuthForm
        isConfigured={auth.isConfigured}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onContinueAsGuest={() => setGuestMode(true)}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-ocean-night text-white">
      <div className="fixed inset-0 bg-ocean-radial" />
      <div className="fixed inset-0 ocean-grid opacity-35" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="glass-panel flex items-center justify-between rounded-3xl p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-24 lg:flex-col">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-cyan to-ocean-teal text-ocean-night shadow-glow">
            <Waves className="h-6 w-6" />
          </div>
          <nav className="flex gap-2 lg:flex-col">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-400 transition hover:border-ocean-cyan/30 hover:text-ocean-cyan"
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}
          </nav>
          {auth.user ? (
            <button
              type="button"
              onClick={auth.signOut}
              className="rounded-2xl border border-white/10 p-3 text-slate-400 transition hover:border-ocean-teal/40 hover:text-ocean-teal"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <span className="rounded-full border border-ocean-teal/30 px-3 py-1 text-xs font-bold text-ocean-teal lg:-rotate-90">
              Guest
            </span>
          )}
        </aside>

        <section className="flex-1 space-y-5 pb-8">
          <Motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
          >
            <div className="absolute right-[-6rem] top-[-8rem] h-72 w-72 rounded-full bg-ocean-cyan/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ocean-cyan/20 bg-ocean-cyan/10 px-4 py-2 text-sm font-bold text-ocean-cyan">
                  <Sparkles className="h-4 w-4" />
                  Open-Meteo Marine powered forecast
                </p>
                <h1 className="font-display text-4xl font-bold uppercase tracking-[0.14em] text-white sm:text-5xl">
                  Tide Tracker
                </h1>
                <p className="mt-4 max-w-2xl text-slate-300">
                  A modern coastal dashboard for tide windows, marine conditions, wind, and activity recommendations.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-right">
                <div className="font-display text-3xl font-bold text-white">
                  {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>
          </Motion.header>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Motion.section
              initial="hidden"
              animate="show"
              className="glass-panel rounded-[2rem] p-6 sm:p-7"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean-muted">Current station</p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-white">
                    {city || "Find your coast"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {coordinates
                      ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                      : "Use your device location to pull live modeled marine data."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchLocationAndTides}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ocean-cyan to-ocean-teal px-5 py-3 font-bold text-ocean-night shadow-glow transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LocateFixed className="h-5 w-5" />
                    {loading ? "Locating..." : coordinates ? "Refresh" : "Get tide info"}
                    </Motion.button>
                  {coordinates && (
                    <button
                      onClick={clearLocation}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 font-bold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-200"
                    >
                      <Trash2 className="h-5 w-5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-rose-100">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                  <span>{error}</span>
                </div>
              )}
            </Motion.section>

            <Motion.section
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="glass-panel rounded-[2rem] p-6 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-ocean-teal/10 p-3 text-ocean-teal">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Signed in as</p>
                  <p className="font-semibold text-white">
                    {auth.user?.user_metadata?.full_name || auth.user?.email || "Guest explorer"}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">
                Saved locations sync to Supabase when you are logged in. Guest mode stores the latest location in this browser.
              </p>
            </Motion.section>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Sea level" value={marine?.sea_level_height_msl} unit="m" icon={Waves} delay={0.05} />
            <MetricCard label="Wave height" value={marine?.wave_height} unit="m" icon={Activity} accent="teal" delay={0.1} />
            <MetricCard label="Wind speed" value={weather?.windspeed} unit="m/s" icon={Wind} delay={0.15} />
            <MetricCard label="Temperature" value={weather?.temperature} unit="deg" icon={Thermometer} accent="teal" delay={0.2} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <Motion.section
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="glass-panel rounded-[2rem] p-5 sm:p-7"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean-muted">Tide curve</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">Next modeled extremes</h2>
                </div>
                <span className="rounded-full border border-ocean-cyan/20 px-3 py-1 text-xs font-bold text-ocean-cyan">
                  72h view
                </span>
              </div>
              {tideInfo?.extremes?.length ? (
                <TideChart tideInfo={tideInfo} />
              ) : (
                <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/10 text-center text-slate-400">
                  Fetch your location to render the glowing tide chart.
                </div>
              )}
            </Motion.section>

            <Motion.section
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="space-y-5"
            >
              {[nextHighTide, nextLowTide].map((item, index) => (
                <div key={item?.type || index} className="glass-panel rounded-[2rem] p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean-muted">
                    {index === 0 ? "Next high" : "Next low"}
                  </p>
                  {item ? (
                    <>
                      <h3 className="mt-3 font-display text-3xl font-bold text-white">{item.height.toFixed(2)} m</h3>
                      <p className="mt-2 text-slate-300">
                        {formatDate(item.date)} at {formatTime(item.date)}
                      </p>
                      <p className="mt-4 inline-flex rounded-full bg-white/[0.05] px-3 py-1 text-sm font-bold text-ocean-cyan">
                        {getTimeUntilNextTide(item.date)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-4 text-slate-400">Waiting for tide data.</p>
                  )}
                </div>
              ))}
            </Motion.section>
          </div>

          <Motion.section
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="glass-panel rounded-[2rem] p-6 sm:p-7"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-ocean-teal/10 p-3 text-ocean-teal">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean-muted">AI activity picks</p>
                <h2 className="font-display text-2xl font-bold text-white">Best coastal windows</h2>
              </div>
            </div>
            {recommendations.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {recommendations.map((rec) => (
                  <div key={rec.activity} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <rec.icon className="mb-5 h-6 w-6 text-ocean-cyan" />
                    <h3 className="font-display text-xl font-bold text-white">{rec.activity}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{rec.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-3xl border border-dashed border-white/10 p-6 text-slate-400">
                Fetch tide and weather data to generate activity recommendations.
              </p>
            )}
          </Motion.section>

          {marineDisclaimer && (
            <p className="px-2 text-xs leading-6 text-slate-500">{marineDisclaimer}</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
