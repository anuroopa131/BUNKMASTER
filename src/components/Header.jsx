import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Switch, Avatar, Menu, MenuItem
} from '@mui/material';
import { Dashboard, AccountCircle, Brightness4, Brightness7 } from '@mui/icons-material';
import { tokens } from '../styles/theme';

// Add Anton to your Google Fonts <link> in public/index.html, alongside the
// Space Grotesk / Inter / IBM Plex Mono already there:
// family=Anton&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600

const Header = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    handleClose();
  };

  const handleProfile = () => { navigate('/profile'); handleClose(); };
  const handleDashboard = () => navigate('/dashboard');

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ background: darkMode ? tokens.primaryDeep : tokens.gradient }}
    >
      <Toolbar>
        <Typography
          component="div"
          sx={{
            display: 'inline-block',
            position: 'relative',
            padding: '0.5rem 1.5rem 0.75rem',
            margin: 0,
            left: '-1.9rem',
            fontFamily: "'Anton', sans-serif",
            fontWeight: 800,
            textShadow: '0px 4px 4px rgba(120, 105, 105, 0.25)',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            letterSpacing: '0.01em',
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            color: '#ffffff',
            cursor: 'pointer',
            flexGrow: 1,
          }}
          onClick={() => navigate('/')}
        >
          Bunk<Box component="span" sx={{ color: tokens.gold }}>Master</Box>
        </Typography>


        {user ? (
          <>

            <IconButton size="large" onClick={handleMenu} color="inherit">
              <Avatar sx={{ bgcolor: tokens.primaryLight, width: 32, height: 32, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                {user.username?.charAt(0).toUpperCase() || <AccountCircle />}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${tokens.border}`, boxShadow: '0 8px 32px rgba(22,33,62,0.18)' } }}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{user.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
             
              <MenuItem onClick={() => { navigate('/about-us'); handleClose(); }}>About</MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: tokens.critical }}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Login
            </Button>
            <Button
              variant="contained"
              sx={{
                ml: 1,
                bgcolor: tokens.gold,
                color: tokens.ink,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: tokens.goldDark },
              }}
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;