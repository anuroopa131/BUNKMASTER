import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon

const Header = ({ isLoggedIn, user, onLogout, darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null); // For profile menu

  const handleLogout = () => {
    onLogout(); // Call the logout function passed from the parent component
    navigate('/login'); // Redirect to the login page
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Open the profile menu
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null); // Close the profile menu
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Navigate to the profile page
    handleProfileMenuClose(); // Close the menu
  };

  return (
    <AppBar position="static" style={{ backgroundColor: darkMode ? '#1e1e1e' : '#6200ea', zIndex: 0 }}>
      <Toolbar>
        {/* Logo/Title */}
        <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 'bold', fontSize: 42 }}>
          BunkMaster
        </Typography>

        {/* Navigation Links */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* About Us Button */}
          <Button color="inherit" component={Link} to="/about-us" style={{ marginRight: 10 }}>
            About Us
          </Button>

          {/* Contact Button */}
          <Button color="inherit" component={Link} to="/contact" style={{ marginRight: 10 }}>
            Contact
          </Button>

          {/* Conditionally render Login/Signup or Profile Dropdown */}
          {!isLoggedIn ? (
            <>
              <Button color="inherit" component={Link} to="/login" style={{ marginRight: 10 }}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              {/* Profile Dropdown */}
              <Button color="inherit" onClick={handleProfileMenuOpen}>
                Profile
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>View Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}

          {/* Dark Mode Toggle */}
          <IconButton
            color="inherit"
            onClick={() => setDarkMode(!darkMode)}
            style={{ marginLeft: '10px' }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;