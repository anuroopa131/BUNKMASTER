import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import '../styles/Landing.css';
import landingAnimation from '../assets/landing-animation.json';
import rocket from '../assets/rocket.json';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Ambient background blobs */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />

      

      <div className="landing-content">
        {/* Animation container with overlapping Lottie animations */}
        <div className="animation-container">
          <Player
            src={landingAnimation}
            autoplay
            loop
            style={{ position: 'absolute', width: '110%', height: '110%', top: 40, left: 0, zIndex: 0 }}
          />
          <Player
            src={rocket}
            autoplay
            loop
            style={{ position: 'absolute', width: '100%', height: '100%', top: -110, left: 0 }}
          />
        </div>

        {/* Tagline on the right */}
        <div className="tagline-container">
          <span className="eyebrow">Attendance, sorted</span>
          <h1>
            Skipping, Chilling, <span className="gradient-text">Repeating.</span>
          </h1>
          <p>
            Because life's too short to attend every class. Let BunkMaster track your
            attendance, warn you before it's a problem, and tell you exactly when it's
            safe to bunk.
          </p>
          <button onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default Landing;