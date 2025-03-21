import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const Profile = ({ user }) => {
  // Sample academic data (replace with real data from your app)
  const academicData = {
    currentSemester: 'Semester 6',
    attendancePercentage: '85%',
    upcomingClasses: [
      { subject: 'Mathematics', time: '10:00 AM', room: 'Room 101' },
      { subject: 'Physics', time: '11:00 AM', room: 'Room 102' },
    ],
    recentGrades: [
      { subject: 'Mathematics', grade: 'A' },
      { subject: 'Physics', grade: 'B+' },
    ],
  };

  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Profile
      </Typography>

      {/* General Account Summary */}
      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
          General Account Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Name:Jane</strong> {user.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Account Created:</strong> March 19, 2025
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Academic Summary */}
      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
          Academic Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Current Semester:</strong> {academicData.currentSemester}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Attendance Percentage:</strong> {academicData.attendancePercentage}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;