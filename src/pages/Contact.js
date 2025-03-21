import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player'; // Import Lottie Player
import contactAnimation from '../assets/Contactus.json'; // Import the Lottie JSON file

const Contact = () => {
  return (
    <Box style={{ padding: '20px', textAlign: 'center' }}>
      {/* Lottie Animation at the Top Center */}
      <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Player
          src={contactAnimation} // Path to the Lottie JSON file
          autoplay
          loop
          style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
        />
      </Box>

      {/* Contact Information Section */}
      <Box style={{ display: 'flex', justifyContent: 'center' }}>
        <Paper style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', maxWidth: '600px', width: '100%' }}>
          <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
            Get in Touch
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Email:</strong> support@bunkmaster.com
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Phone:</strong> +91 8904976336
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Address:</strong> Koramangala, Bangalore - 560034
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Working Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Contact;