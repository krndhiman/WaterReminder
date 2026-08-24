import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  MapPin,
  RefreshCw,
  Sun,
  Droplets,
  Wind,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  Thermometer,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

interface WeatherWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherWidgetModal: React.FC<WeatherWidgetModalProps> = ({ isOpen, onClose }) => {
  const {
    weather,
    isLoadingWeather,
    weatherError,
    fetchWeatherForCity,
    fetchWeatherByGPS,
    refreshWeather,
    profile,
    updateEnvironmental,
  } = useWater();

  const [cityInput, setCityInput] = useState('');

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const success = await fetchWeatherForCity(cityInput.trim());
    if (success) {
      setCityInput('');
    }
  };

  const handleGpsClick = async () => {
    await fetchWeatherByGPS();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl glass-surface-glow p-6 z-10 overflow-hidden border border-sky-500/30 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-300">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  Live City Weather & Hydration
                </h3>
                <p className="text-xs text-slate-400">
                  Meteorological compensation calculated from real-time climate data
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Search Input & GPS Button */}
            <div className="space-y-2">
              <form onSubmit={handleCitySearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search city (e.g. London, Dubai, Tokyo, Mumbai)..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoadingWeather || !cityInput.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {isLoadingWeather ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
                </button>
              </form>

              <button
                type="button"
                onClick={handleGpsClick}
                disabled={isLoadingWeather}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-sky-300 hover:text-sky-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Auto-Detect Current GPS Location</span>
              </button>
            </div>

            {/* Error Message */}
            {weatherError && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{weatherError}</span>
              </div>
            )}

            {/* Active Weather Dashboard Card */}
            {weather ? (
              <div className="space-y-3">
                {/* Weather Hero Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-tr from-slate-900 via-sky-950/60 to-slate-900 border border-sky-500/40 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-sky-400" />
                        <h4 className="text-base font-black text-white font-heading">
                          {weather.city} {weather.country && `(${weather.country})`}
                        </h4>
                      </div>
                      <p className="text-xs text-sky-200/80 mt-0.5">{weather.conditionDescription}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{weather.conditionIcon}</span>
                      <button
                        onClick={refreshWeather}
                        className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Refresh live weather"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Temp</span>
                      <span className="text-sm font-black text-white font-mono">{weather.temperature}°C</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Feels Like</span>
                      <span className="text-sm font-black text-sky-300 font-mono">
                        {weather.apparentTemperature}°C
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Humidity</span>
                      <span className="text-sm font-black text-cyan-300 font-mono">{weather.humidity}%</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">UV Index</span>
                      <span className="text-sm font-black text-amber-300 font-mono">{weather.uvIndex}</span>
                    </div>
                  </div>

                  {/* Calculated Hydration Offset Banner */}
                  <div className="p-3.5 rounded-2xl bg-sky-950/70 border border-sky-400/50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-300 block">
                        Meteorological Water Offset
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Automatically added to your 4,000 ml target
                      </span>
                    </div>
                    <span className="text-xl font-black font-heading text-sky-300 text-glow-cyan">
                      {weather.recommendedAdjustmentMl >= 0
                        ? `+${weather.recommendedAdjustmentMl} ml`
                        : `${weather.recommendedAdjustmentMl} ml`}
                    </span>
                  </div>
                </div>

                {/* Scientific Physiological Breakdown */}
                <div className="p-4 rounded-2xl glass-card-inner space-y-2.5 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    <span>Scientific Weather-to-Fluid Rationale</span>
                  </div>

                  <div className="space-y-1.5">
                    {weather.scienceBreakdown.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900/80 text-[11px] text-slate-300 leading-relaxed">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 space-y-2">
                <Sun className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs">Search your city or tap GPS to fetch real-time climate data.</p>
              </div>
            )}

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card-inner">
              <div>
                <h4 className="text-xs font-bold text-white">Apply Live Weather to Daily Goal</h4>
                <p className="text-[11px] text-slate-400">
                  Dynamically increases or recalibrates your goal based on local heat & humidity
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateEnvironmental({
                    liveWeatherEnabled: !profile.environmental.liveWeatherEnabled,
                  })
                }
                className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                  profile.environmental.liveWeatherEnabled ? 'bg-sky-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    profile.environmental.liveWeatherEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
