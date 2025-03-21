import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player'; // Import Lottie Player
import Aboutus from '../assets/Aboutus.json'; // Import the Lottie JSON file

const AboutUs = () => {
  return (
    <Box style={{ padding: '20px' }}>

      <Grid container spacing={4} alignItems="center">
        {/* Lottie Animation Section */}
        <Grid item xs={12} md={6}>
          <Player
            src={Aboutus} // Path to the Lottie JSON file
            autoplay
            loop
            style={{ width: '100%', maxWidth: '500px', height: 'auto' }}
          />
        </Grid>

        {/* Content Section */}
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', marginBottom: '20px' }}>
              Welcome to <span style={{ color: '#6200ea' }}>BunkMaster</span>!
            </Typography>
            <Typography variant="body1" paragraph>
              At <strong>BunkMaster</strong>, we believe in making your academic journey smoother, smarter, and more organized. Whether you're planning your timetable, tracking attendance, or just staying on top of your studies, we've got you covered!
            </Typography>
            <Typography variant="body1" paragraph>
              Our mission is to empower students with the tools they need to succeed. With features like <strong>attendance tracking</strong>, <strong>timetable management</strong>, and <strong>class reminders</strong>, BunkMaster is your ultimate academic companion.
            </Typography>
            <Typography variant="body1" paragraph>
              Join thousands of students who are already using BunkMaster to stay organized and make the most of their academic life. Let's make every class count!
            </Typography>
            <Typography variant="body1" paragraph style={{ fontStyle: 'italic', color: '#6200ea' }}>
              "Your success is our mission. Let's achieve it together!"
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutUs;