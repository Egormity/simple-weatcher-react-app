import './index.css';
import svgSun from './images/sun.svg';

export default function App() {
  return (
    <div className='weather-app'>
      <SearchInput />
      <MainCard />
      <GenerateSmallCards amount={4} />
    </div>
  );
}

function SearchInput() {
  return (
    <div className='input-container'>
      <input className='input-main' placeholder='Enter your city' />
    </div>
  );
}

function MainCard() {
  return (
    <div className='card-main'>
      <img src={svgSun} />
      <div className='text-main'>
        <h2>Date</h2>
        <h1 style={{ marginTop: '1rem', marginBottom: '1rem' }}>City</h1>
        <h2>Temperature</h2>
        <h2>Weather Condition</h2>
      </div>
    </div>
  );
}

function GenerateSmallCards({ amount }) {
  for (let i = 0; i < amount; i++) {
    console.log('test');
  }
}

function SmallCard() {}

// `https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=6557810176c36fac5f0db536711a6c52`
