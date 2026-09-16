import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Import local components and pages
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';


// Import our new MySQL-based auth service
import { listenToAuthChanges, clearUserSession, saveUserSession } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Check for MySQL User Session on Mount
  useEffect(() => {
    // listenToAuthChanges now checks localStorage instead of Firebase
    const unsubscribe = listenToAuthChanges((dbUser) => {
      if (dbUser) {
        setUser(dbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Handle login (Called from Login.jsx)
  const handleLogin = (session) => {
    saveUserSession(session);
    setUser(session.user);
  };

  // Handle logout (Called from Header.jsx)
  const handleLogout = () => {
    clearUserSession(); // Clears localStorage
    setUser(null);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Define themes
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#6200ea' },
      secondary: { main: '#03dac6' },
      background: { 
        default: '#f5f5f5',
        paper: '#ffffff'
      }
    },
    shape: { borderRadius: 12 }
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#bb86fc' },
      secondary: { main: '#03dac6' },
      background: { 
        default: '#121212',
        paper: '#1e1e1e'
      }
    },
    shape: { borderRadius: 12 }
  });

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: darkMode ? '#121212' : '#f5f5f5'
      }}>
        <div className="spinner"></div>
        <style>{`
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid ${darkMode ? '#333' : '#e0e0e0'};
            border-top: 5px solid ${darkMode ? '#bb86fc' : '#6200ea'};
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Header
          user={user}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <Routes>
          {/* Landing/Auth Logic */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/home" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/subjects" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/subject" element={user ? <Navigate to="/subjects" /> : <Navigate to="/login" />} />
          <Route path="/timetable" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/today" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/bunk-calculator" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/calculator" element={user ? <Navigate to="/bunk-calculator" /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/danger-zone" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          
          {/* Static Routes */}
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Redirect all unknown paths */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
