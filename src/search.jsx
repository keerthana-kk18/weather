import React, { useState } from 'react';
import axios from 'axios';
import imgg from './images/cloudyyy.png';
import { FaSearch } from "react-icons/fa";
import { WiSunrise } from "react-icons/wi";
import { IoPartlySunnySharp } from "react-icons/io5";
import { LuWind, LuSun, LuDroplet, LuEye } from "react-icons/lu";
import { BsThermometerHigh } from "react-icons/bs";
import { MdLocationOn } from "react-icons/md";

const TemperatureWave = ({ forecastData }) => {
  if (!forecastData || forecastData.length === 0) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const width = isMobile ? 350 : 850;
  const height = 130;
  const spacing = width / (forecastData.length - 1);

  const temps = forecastData.map(item => item.main.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const amplitude = 75;

  const points = forecastData.map((item, i) => ({
    x: i * spacing,
    y:
      height / 2 -
      ((item.main.temp - minTemp) / (maxTemp - minTemp || 1) - 0.5) *
        amplitude,
    temp: Math.round(item.main.temp),
    icon: item.weather[0].icon,
    time: new Date(item.dt * 1000).toLocaleTimeString([], {
      hour: 'numeric',
    }),
  }));

  const smoothing = 0.35;
  const d = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const next = a[i + 1] || point;
    const dx = (next.x - prev.x) * smoothing;
    const dy = (next.y - prev.y) * smoothing;
    return `${acc} C ${prev.x + dx},${prev.y + dy} ${
      point.x - dx
    },${point.y - dy} ${point.x},${point.y}`;
  }, "");

  return (
    <div className="relative md:absolute bottom-2 md:left-[550px] w-full md:w-[850px] h-[180px] animate-in fade-in duration-1000 mt-10 md:mt-0">
      {/* temperature icons */}
      <div className="flex justify-between w-full absolute -top-16 px-4">
        {points.map((p, i) => (
          <div key={i} className="flex flex-col items-center text-white">
            <span className="text-xl font-light">{p.temp}°</span>
            <img
              src={`http://openweathermap.org/img/wn/${p.icon}@2x.png`}
              className="w-12 h-12"
              alt="weather"
            />
          </div>
        ))}
      </div>

      {/* wave */}
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <path
          d={d}
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* SAFE ACCESS */}
        {points.length > 2 && (
          <g>
            <circle
              cx={points[2].x}
              cy={points[2].y}
              r="6"
              fill="white"
              className="animate-pulse shadow-[0_0_10px_white]"
            />
            <line
              x1={points[2].x}
              y1={points[2].y}
              x2={points[2].x}
              y2={height + 20}
              stroke="white"
              strokeDasharray="4 4"
              opacity="0.3"
            />
          </g>
        )}
      </svg>

      
      <div className="flex justify-between w-full mt-4 px-4 text-white/60 text-xs font-medium uppercase tracking-widest">
        {points.map((p, i) => <span key={i}>{p.time}</span>)}
      </div>
    </div>
  );
};

const getWeatherSummary = (data) => {
  if (!data) return {};
  const main = data.weather[0].main;
  const desc = data.weather[0].description;
  const tempMax = Math.round(data.main.temp_max);
  const tempMin = Math.round(data.main.temp_min);
  const wind = Math.round(data.wind.speed);
  let title = main;
  if (main === "Rain") title = "Stormy with Heavy Rain";
  if (main === "Clouds") title = "Overcast Skies";
  if (main === "Clear") title = "Clear & Calm";
  const description = `Temperatures peak at ${tempMax}° and drop to ${tempMin}°. Winds range around ${wind} km/h. Expect ${desc}.`;
  return { title, description };
};

const Search = () => {
  const [data, setdata] = useState(null);
  const [airData, setAirData] = useState(null);
  const [search, setsearch] = useState('');
  const [forecast, setForecast] = useState([]);

  const visibilityText = data ? (data.visibility > 9000 ? "Excellent visibility" : "Moderate visibility") : "";
  const windSpeed = data?.wind?.speed || 5;
  const wavePoints = Array.from({ length: 30 }, (_, i) => 20 + Math.sin(i * 0.3) * (windSpeed * 1.5) + Math.random() * 2);
  const smoothWavePath = wavePoints.reduce((path, y, i, arr) => {
    if (i === 0) return `M ${i * 8} ${y}`;
    const prevY = arr[i - 1];
    const midX = (i - 0.5) * 8;
    const midY = (prevY + y) / 2;
    return path + ` Q ${midX} ${prevY} ${i * 8} ${y}`;
  }, "");

  const handlechange = (event) => {
    const val = event.target.value;
    setsearch(val);
    if (val.trim() === "") {
        setdata(null);
        setAirData(null);
        setForecast([]);
    }
  };

  const handlesubmit = async (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    try {
      const API_KEY = "0cf3d05c6cb443424f42856d18e090b3";
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${search.trim()}&units=imperial&appid=${API_KEY}`);
      setdata(weatherRes.data);
      const { lat, lon } = weatherRes.data.coord;
      const airRes = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      setAirData(airRes.data);
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
      setForecast(forecastRes.data.list.slice(0, 5));
    } catch (error) { alert("City not found"); }
  };

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${imgg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
      }}
      className="flex flex-col items-center pt-5 pb-10 overflow-y-auto relative overflow-x-hidden"
    >
      <div className="flex flex-col items-center w-full max-w-3xl px-6 mb-10 z-50">
        <h1 className="text-white mb-4 text-5xl font-bold flex items-center space-x-2 text-center">
          <IoPartlySunnySharp className="text-5xl md:text-6xl" />
          <span className="text-4xl md:text-5xl" style={{fontFamily:'cursive'}}>Weather</span>
        </h1>

        <form onSubmit={handlesubmit} className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
            <input
              type="text"
              placeholder="Search a city"
              value={search}
              onChange={handlechange}
              className="bg-transparent backdrop-blur-md text-white font-bold text-lg placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-white h-[45px] pl-10 pr-3 rounded-md w-[220px] sm:w-[350px]"
            />
          </div>
          <button type="submit" className="bg-white text-black px-4 md:px-6 h-[45px] rounded-md text-sm font-bold hover:bg-gray-200 transition">
            SEARCH
          </button>
        </form>
      </div>

      {data && (
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-[350px] px-4 md:mr-[850px] z-10">
            <div className="bg-transparent border border-white/20 rounded-[40px] p-8 shadow-2xl text-white">
              <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-full mb-6 border border-white/10">
                <MdLocationOn className="text-xl" />
                <span className="text-sm font-medium">{data.name}, {data.sys?.country}</span>
              </div>
              <h2 className="text-xl font-medium mb-6">Today Highlight</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <HighlightCard icon={<LuWind size={30} />} title="Wind Status" value={data.wind.speed} unit="mph" sub={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <HighlightCard icon={<LuDroplet size={30} />} title="Humidity" value={data.main.humidity} unit="%" sub={visibilityText} />
                <HighlightCard icon={<LuSun size={30} />} title="Pressure" value={data.main.pressure} unit="hPa" sub="Standard" />
                <HighlightCard icon={<LuEye size={30} />} title="Visibility" value={(data.visibility / 1609).toFixed(1)} unit="mi" sub={data.weather[0].description} />
              </div>

              <div className="bg-white/20 rounded-3xl p-6 border border-white/10">
                <div className="flex items-center mb-2">
                  <div className="flex items-center gap-2">
                    <BsThermometerHigh className="text-white text-3xl" />
                    <span className="text-2xl font-light">{Math.round(data.main.temp)}°F</span>
                  </div>
                  <div className="flex ml-auto mb-4">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <div className="w-4 h-4 rounded-full bg-orange-500 -ml-1"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-400 -ml-1"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-200 -ml-1"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div className="space-y-2">
                    <span className="text-white text-sm block mb-1">Safe</span>
                    <div className="flex items-center gap-2 text-[11px]"><div className="w-2 h-2 rounded-full bg-[#E8D498]"></div>CO: {airData?.list[0].components.co.toFixed(1)}</div>
                    <div className="flex items-center gap-2 text-[11px]"><div className="w-2 h-2 rounded-full bg-[#E5C32E]"></div>NO2: {airData?.list[0].components.no2.toFixed(1)}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-white text-sm block mb-1">Dangerous</span>
                    <div className="flex items-center gap-2 text-[11px]"><div className="w-2 h-2 rounded-full bg-[#D6672F]"></div>PM10: {airData?.list[0].components.pm10.toFixed(1)}</div>
                    <div className="flex items-center gap-2 text-[11px]"><div className="w-2 h-2 rounded-full bg-[#DC3C3C]"></div>PM2.5: {airData?.list[0].components.pm2_5.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative md:absolute md:right-24 md:top-[200px] flex flex-col gap-10 mt-10 md:mt-0">
            <div className="bg-transparent backdrop-blur-xl border border-white/30 rounded-3xl p-5 w-[260px] text-white">
              <div className="flex justify-between items-center text-xs mb-3">
                <div className="flex items-center gap-2"><LuWind size={18} /><span>Wind Status</span></div>
              </div>
              <div className="relative h-[90px]">
                <svg viewBox="0 0 260 40" className="absolute top-0 w-full h-10"><path d={smoothWavePath} fill="none" stroke="white" strokeWidth="2" opacity="0.9" /></svg>
                <svg viewBox="0 0 260 40" className="absolute bottom-0 w-full h-10">
                  {wavePoints.map((h, i) => (
                    <g key={i}><line x1={i * 8} y1={40} x2={i * 8} y2={40 - h} stroke="white" strokeWidth="2" opacity="0.55" /><circle cx={i * 8} cy={40 - h} r="2.2" fill="white" opacity="0.8" /></g>
                  ))}
                </svg>
              </div>
              <div className="flex justify-between items-center text-xs mt-3">
                <span className="font-medium">{data.wind.speed} km/h</span>
                <span className="opacity-70">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="bg-transparent backdrop-blur-xl border border-white/30 rounded-3xl p-5 w-[260px] text-white relative">
              <div className="flex items-center gap-2 mb-4">
                <LuSun size={18} className="opacity-70" />
                <span className="text-xs font-medium uppercase tracking-wider">Sunrise & Sunset</span>
              </div>
              <div className="relative h-24 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
                  <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 4" opacity="1" />
                  <circle cx={100 + 80 * Math.cos(Math.PI * 1.15)} cy={90 + 80 * Math.sin(Math.PI * 1.15)} r="5" fill="#FDB813" className="drop-shadow-[0_0_5px_rgba(253,184,19,1)]" />
                  <circle cx={100 + 80 * Math.cos(Math.PI * 1.85)} cy={90 + 80 * Math.sin(Math.PI * 1.85)} r="5" fill="#F37021" className="drop-shadow-[0_0_5px_rgba(243,112,33,1)]" />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 border-t border-white/30 rounded-full border-dashed" />
                    <div className="w-12 h-12 flex items-center justify-center">
                      <WiSunrise size={70} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end mt-2 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] opacity-60 uppercase">Sunrise</span>
                  <span className="text-xs font-bold">{new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] opacity-60 uppercase">Sunset</span>
                  <span className="text-xs font-bold">{new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative md:absolute md:top-[400px] md:left-[550px] w-full max-w-[520px] text-white px-6 mt-10 md:mt-0">
            {(() => {
              const { title, description } = getWeatherSummary(data);
              return (
                <>
                  <h1 className="text-5xl md:text-6xl font-bold font-serif leading-tight">{title}</h1>
                  <p className="mt-3 text-lg italic font-medium">{description}</p>
                </>
              );
            })()}
          </div>
          
          <div className="w-full mt-10">
            {forecast.length > 0 && <TemperatureWave forecastData={forecast} />}
          </div>
        </div>
      )}
    </div>
  );
};

const HighlightCard = ({ icon, title, value, unit, sub }) => (
  <div className="bg-white/30 border border-white/10 rounded-3xl p-5 text-white">
    <div className="flex items-center gap-2 mb-4">
      {icon} <span className="text-[11px] font-medium uppercase">{title}</span>
    </div>
    <div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs ml-1">{unit}</span>
    </div>
    <div className="text-[10px] mt-2 opacity-70">{sub}</div>
  </div>
);

export default Search;