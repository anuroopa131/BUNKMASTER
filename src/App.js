import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs'; // Import the AboutUs component
import Contact from './pages/Contact'; // Import the Contact component
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import Sidebar from './pages/admin/Sidebar';
import UserManagement from './pages/admin/UserManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [user, setUser] = useState(null); // Store user details
  const [darkMode, setDarkMode] = useState(false); // Track dark mode

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Function to handle login
  const handleLogin = (userData) => {
    setIsLoggedIn(true); // Set login status to true
    setUser(userData); // Store user details
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false); // Set login status to false
    setUser(null); // Clear user details
  };

  // Define light and dark themes
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#6200ea', // Purple
      },
      background: {
        default: '#f4f4f4', // Light gray
        paper: '#ffffff', // White
      },
      text: {
        primary: '#000000', // Black
        secondary: '#333333', // Dark gray
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#bb86fc', // Light purple
      },
      background: {
        default: '#121212', // Dark gray
        paper: '#1e1e1e', // Darker gray
      },
      text: {
        primary: '#ffffff', // White
        secondary: '#e0e0e0', // Light gray
      },
    },
  });

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline /> {/* Apply baseline styles for the theme */}
      <Router>
        {/* Pass isLoggedIn, user, onLogout, darkMode, and setDarkMode to Header */}
        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/about-us" element={<AboutUs />} /> {/* Add AboutUs route */}
          <Route path="/contact" element={<Contact />} /> {/* Add Contact route */}
          <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login onLogin={handleLogin} />} />
  <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile" element={<Profile user={user} />} />
  <Route path="/about-us" element={<AboutUs />} />
  <Route path="/contact" element={<Contact />} />

  {/* Admin Routes */}
  {user?.role === 'admin' && (
    <>
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/attendance" element={<AttendanceManagement />} />
      <Route path="/admin/sidebar" element={<Sidebar />} />
      <Route path="/admin/user-management" element={<UserManagement />} />
    </>
  )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;