import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player'; // Import Lottie Player
import '../styles/Landing.css';
import landingAnimation from '../assets/landing-animation.json'; // Import the Lottie JSON file
import rocket from '../assets/rocket.json';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Animation container with overlapping Lottie animations */}
      <div className="animation-container" style={{ position: 'relative', width: '400px', height: '400px' }}>
        {/* First Lottie Animation */}
        <Player
          src={landingAnimation}
          autoplay
          loop
          style={{ position: 'absolute', width: '110%', height: '110%', top: 40, left: 0 ,zIndex:0}}
        />
        {/* Second Lottie Animation */}
        <Player
          src={rocket}
          autoplay
          loop
          style={{ position: 'absolute', width: '100%', height: '100%', top: -110, left: 0 }}
        />
      </div>

      {/* Tagline on the right */}
      <div className="tagline-container">
        <h1>Skipping, Chilling, Repeating!!</h1>
        <p>Because Life’s Too Short to Attend Every Class. Let BunkMaster Be Your Guide to Perfect Attendance & Perfect Fun</p>
        <button onClick={() => navigate('/login')}>Get Started</button>
      </div>
    </div>
  );
};

export default Landing;