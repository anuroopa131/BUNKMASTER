import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate('/profile'); // Navigate to the profile page
  };

  return (
    <div style={styles.header}>
      <div style={styles.userInfo}>
        <span style={styles.userName}>{user.name}</span>
        <span style={styles.userEmail}>{user.email}</span>
      </div>
      <div style={styles.nav}>
        <button onClick={handleProfile} style={styles.navButton}>
          Profile
        </button>
        <button onClick={onLogout} style={styles.navButton}>
          Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#f4f4f4',
    borderBottom: '1px solid #ccc',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#555',
  },
  nav: {
    display: 'flex',
    gap: '10px',
  },
  navButton: {
    padding: '8px 12px',
    backgroundColor: 'blue',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Header;