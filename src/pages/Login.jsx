import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import '../styles/Auth.css';
import loginAnimation from '../assets/login-animation.json';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role is student
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Trim inputs
    const userEmail = email.trim();
    const pass = password.trim();

    // Validation
    if (!userEmail || !pass) {
      setMessage('Fields cannot be empty!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Get stored user data
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user exists and role matches
    const validUser = users.find((u) => u.email === userEmail && u.password === pass && u.role === role);

    if (validUser) {
      setMessage('Login successful!');
      onLogin(validUser); // Pass user data to the parent component

      // Fetch admin data (if role is admin)
      if (role === 'admin') {
        // Example: Fetch admin data from an API or localStorage
        const adminData = await fetchAdminData(validUser.email); // Replace with your logic
        localStorage.setItem('adminData', JSON.stringify(adminData)); // Store admin data
        navigate('/admin-dashboard'); // Redirect to admin dashboard
      } else {
        navigate('/dashboard'); // Redirect to student dashboard
      }
    } else {
      setMessage('Invalid email, password, or role!');
    }
  };

  // Example function to fetch admin data (replace with your logic)
  const fetchAdminData = async (email) => {
    // Simulate fetching admin data from an API or localStorage
    return {
      email,
      name: 'Admin User',
      analytics: { /* analytics data */ },
      users: [ /* user management data */ ],
    };
  };

  return (
    <div className="auth-container">
      {/* Lottie Animation on the left */}
      <div className="animation-container">
        <Player
          src={loginAnimation}
          autoplay
          loop
          style={{ width: '400px', height: '400px' }}
        />
      </div>

      {/* Login box on the right */}
      <div className="auth-box">
        <h2>Login to BunkMaster</h2>
        {message && (
          <p style={{ color: message.includes('success') ? 'green' : 'red' }}>
            {message}
          </p>
        )}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '8px',
            margin: '10px 0',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
        <p style={{ marginTop: '10px' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: 'blue', cursor: 'pointer' }}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;