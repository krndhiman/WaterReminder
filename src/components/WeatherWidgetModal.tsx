import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  MapPin,
  RefreshCw,
  Sun,
  Droplets,
  AlertCircle,
  Info,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl apple-glass-modal p-5 sm:p-6 z-10 overflow-hidden max-h-[90vh] flex flex-col space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-lg">
                <Sun className="w-5 h-5 text-[#ff9f0a]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Weather & Climate Boost
                </h3>
                <p className="text-xs text-neutral-400">
                  Heat & humidity fluid compensation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Search Input & GPS Button */}
            <div className="space-y-2">
              <form onSubmit={handleCitySearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search city (e.g. London, Dubai, Tokyo, Delhi)..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0a84ff]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoadingWeather || !cityInput.trim()}
                  className="px-4 py-2 rounded-xl apple-btn-primary disabled:opacity-40 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  {isLoadingWeather ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
                </button>
              </form>

              <button
                type="button"
                onClick={handleGpsClick}
                disabled={isLoadingWeather}
                className="w-full py-2 px-3 rounded-xl apple-card text-xs font-medium text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0a84ff]" />
                <span>Auto-Detect Current GPS Location</span>
              </button>
            </div>

            {/* Error Message */}
            {weatherError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{weatherError}</span>
              </div>
            )}

            {/* Active Weather Dashboard Card */}
            {weather ? (
              <div className="space-y-3">
                {/* Weather Hero Card */}
                <div className="p-4 sm:p-5 rounded-2xl apple-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#0a84ff]" />
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {weather.city} {weather.country && `(${weather.country})`}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{weather.conditionDescription}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{weather.conditionIcon}</span>
                      <button
                        onClick={refreshWeather}
                        className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                        title="Refresh weather"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Temp</span>
                      <span className="text-xs font-bold text-white font-mono">{weather.temperature}°C</span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Feels</span>
                      <span className="text-xs font-bold text-[#0a84ff] font-mono">
                        {weather.apparentTemperature}°C
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Humidity</span>
                      <span className="text-xs font-bold text-[#30b0c7] font-mono">{weather.humidity}%</span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold block">UV</span>
                      <span className="text-xs font-bold text-[#ff9f0a] font-mono">{weather.uvIndex}</span>
                    </div>
                  </div>

                  {/* Calculated Hydration Offset Banner */}
                  <div className="p-3.5 rounded-xl bg-[#0a84ff]/10 border border-[#0a84ff]/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Climate Fluid Offset
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Automatically added to your daily target
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#0a84ff] font-mono">
                      {weather.recommendedAdjustmentMl >= 0
                        ? `+${weather.recommendedAdjustmentMl} ml`
                        : `${weather.recommendedAdjustmentMl} ml`}
                    </span>
                  </div>
                </div>

                {/* Scientific Physiological Breakdown */}
                <div className="p-3.5 rounded-2xl apple-card space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Info className="w-3.5 h-3.5 text-[#0a84ff]" />
                    <span>Scientific Weather-to-Fluid Rationale</span>
                  </div>

                  <div className="space-y-1.5">
                    {weather.scienceBreakdown.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-black/30 text-[11px] text-neutral-300 leading-relaxed">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-500 space-y-1.5">
                <Sun className="w-8 h-8 mx-auto text-neutral-600 animate-pulse" />
                <p className="text-xs text-neutral-400">Search a city or tap GPS to fetch real-time climate data.</p>
              </div>
            )}

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl apple-card">
              <div>
                <h4 className="text-xs font-semibold text-white">Apply Live Weather to Daily Goal</h4>
                <p className="text-[11px] text-neutral-400">
                  Dynamically recalibrates goal based on local temperature & humidity
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
                  profile.environmental.liveWeatherEnabled ? 'bg-[#0a84ff]' : 'bg-neutral-800'
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
          <div className="pt-3 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl apple-btn-primary text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
