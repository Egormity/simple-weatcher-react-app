import { useEffect, useState } from 'react';
import './index.css';

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], '☀️'],
    [[1], '🌤️'],
    [[2], '⛅️'],
    [[3], '☁️'],
    [[45, 48], '💨'],
    [[51, 56, 61, 66, 80], '🌦️'],
    [[53, 55, 63, 65, 57, 67, 81, 82], '🌧️'],
    [[71, 73, 75, 77, 85, 86], '🌧️'],
    [[95], '🌩️'],
    [[96, 99], '⛈️'],
  ]);
  const arr = [...icons.keys()].find(key => key.includes(wmoCode));
  if (!arr) return 'NOT FOUND';
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
  }).format(new Date(dateStr));
}

const checkIsToday = d => formatDay(new Date()) === formatDay(d);

export default function App() {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [flag, setFlag] = useState(null);
  const [activeDay, setActiveDay] = useState(formatDay(new Date()));
  const [activeTemp, setActiveTemp] = useState('');
  const [acticeIcon, setActiveIcon] = useState('');
  const [locationName, setLocationName] = useState('');

  const handleSetLocation = e =>
    setLocation(
      !e.target.value ? '' : e.target.value[0].toUpperCase() + e.target.value.slice(1).toLowerCase()
    );

  useEffect(() => {
    (async function () {
      if (location.length < 2) return;
      try {
        // --- 1. SHOW LOADING ---//
        setIsLoading(true);

        //--- 2. GET LOCATION (GEOCODING) ---//
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        );
        const geoData = await geoRes.json();

        //--- 2.1 HANDLE LOCATION NOT FOUND ---//
        if (!geoData.results) throw new Error('Location not found');

        //--- 3. GET THE DATA AND SET THE FLAG ---//
        const { latitude, longitude, timezone, country_code, name } = geoData.results.at(0);
        setFlag(convertToFlag(country_code));
        setLocationName(name);

        //--- 4. GET THE ACTUAL DATA ---//
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
        );
        const weatherD = await weatherRes.json();
        setWeatherData(weatherD);
      } catch (err) {
        console.log(`AAAAA ${err} AAAAA`);
      } finally {
        //--- 5. HIDE LODAING ---//
        setIsLoading(false);
      }
    })();
  }, [location]);

  return (
    <div className='weather-app'>
      <SearchInput location={location} onSetLocation={handleSetLocation} />
      <MainCard
        isLoading={isLoading}
        locationName={locationName}
        flag={flag}
        location={location}
        activeTemp={activeTemp}
        acticeIcon={acticeIcon}
        activeDay={activeDay}>
        <GenerateDayCards
          weatherData={weatherData}
          isLoading={isLoading}
          setActiveDay={setActiveDay}
          activeDay={activeDay}
          setActiveTemp={setActiveTemp}
          location={location}
          setActiveIcon={setActiveIcon}
        />
      </MainCard>
    </div>
  );
}

function SearchInput({ location, onSetLocation }) {
  return (
    <input
      className='input-main'
      placeholder='Enter your city'
      value={location}
      onChange={e => onSetLocation(e)}
    />
  );
}

function MainCard({
  isLoading,
  locationName,
  activeDay,
  flag,
  children,
  location,
  activeTemp,
  acticeIcon,
}) {
  console.log(activeDay);
  return (
    <div className={`card-main ${isLoading ? 'loading' : ''}`}>
      <span className='icon-big'>{acticeIcon && location ? acticeIcon : '🔎'}</span>
      <div className='text-main'>
        <h2>{activeDay === formatDay(new Date()) ? 'Today' : activeDay}</h2>
        <h1>{location && locationName ? `${locationName} (${flag})` : 'Start seaching'}</h1>
        <h2>{activeTemp ? activeTemp : 'Search first'}</h2>
        {children}
      </div>
    </div>
  );
}

function GenerateDayCards({
  weatherData,
  isLoading,
  setActiveDay,
  activeDay,
  location,
  setActiveTemp,
  setActiveIcon,
}) {
  if (location === '') return;
  const daily = weatherData.daily;
  if (!daily) return;

  return (
    <ul className='days-container'>
      {daily.time.map((day, i) => (
        <DayCard
          num={i}
          maxTemp={daily.temperature_2m_max[i]}
          minTemp={daily.temperature_2m_min[i]}
          date={daily.time[i]}
          weatherCode={daily.weathercode[i]}
          isLoading={isLoading}
          setActiveDay={setActiveDay}
          activeDay={activeDay}
          setActiveTemp={setActiveTemp}
          setActiveIcon={setActiveIcon}
          key={day}
        />
      ))}
    </ul>
  );
}

function DayCard({
  num,
  maxTemp,
  minTemp,
  date,
  weatherCode,
  setActiveDay,
  activeDay,
  isLoading,
  setActiveTemp,
  setActiveIcon,
}) {
  const isActive = activeDay === formatDay(date);

  // prettier-ignore
  const temperature = (<>{minTemp}&deg; &mdash; {maxTemp}&deg;</>);
  const icon = getWeatherIcon(weatherCode);

  const setData = () => {
    setActiveDay(formatDay(date));
    setActiveTemp(temperature);
    setActiveIcon(icon);
  };
  useEffect(() => {
    if (num === 0) {
      setActiveTemp(temperature);
      setActiveIcon(icon);
    }
  }, [isLoading, num, temperature, icon, setActiveTemp, setActiveIcon]);

  // prettier-ignore
  return (
    <li 
    className={`day  ${isLoading ? 'loading' : ''} ${isActive ? 'day--active' : ''}`} 
    onClick={setData}>
      <h3>{checkIsToday(date) ? 'Today' : formatDay(date)}</h3>
      <span className='icon-small'>{icon}</span>
      <h3>{temperature}</h3>
    </li>
  );
}
