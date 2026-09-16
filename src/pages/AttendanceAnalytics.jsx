import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AttendanceAnalytics = ({ attendanceRecords, timetableData }) => {
  // Process attendance data for analytics
  const processAttendanceData = () => {
    const subjectStats = {};
    const dailyStats = {};
    const monthlyStats = {};
    
    // Process all attendance records from MySQL
    Object.entries(attendanceRecords).forEach(([date, subjects]) => {
      // Ensure date parsing is robust for SQL date strings
      const dateObj = new Date(date);
      const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      
      Object.entries(subjects).forEach(([subject, status]) => {
        // Normalize status to lowercase to handle MySQL/Form differences
        const normalizedStatus = status.toLowerCase();
        
        // Subject statistics
        if (!subjectStats[subject]) {
          subjectStats[subject] = { present: 0, absent: 0, total: 0 };
        }
        
        if (normalizedStatus === 'present') {
          subjectStats[subject].present++;
        } else if (normalizedStatus === 'absent') {
          subjectStats[subject].absent++;
        }
        subjectStats[subject].total++;
        
        // Daily statistics
        if (!dailyStats[day]) {
          dailyStats[day] = { present: 0, absent: 0 };
        }
        if (normalizedStatus === 'present') dailyStats[day].present++;
        if (normalizedStatus === 'absent') dailyStats[day].absent++;
        
        // Monthly statistics
        const monthYear = date.substring(0, 7); // YYYY-MM
        if (!monthlyStats[monthYear]) {
          monthlyStats[monthYear] = { present: 0, absent: 0 };
        }
        if (normalizedStatus === 'present') monthlyStats[monthYear].present++;
        if (normalizedStatus === 'absent') monthlyStats[monthYear].absent++;
      });
    });
    
    return { subjectStats, dailyStats, monthlyStats };
  };
  
  const { subjectStats, dailyStats, monthlyStats } = processAttendanceData();
  
  // Convert to chart data
  const subjectChartData = Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    attendanceRate: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0,
    present: stats.present,
    absent: stats.absent
  }));
  
  const dailyChartData = Object.entries(dailyStats).map(([day, stats]) => ({
    day,
    present: stats.present,
    absent: stats.absent
  }));
  
  const overallAttendanceRate = subjectChartData.length > 0
    ? (subjectChartData.reduce((sum, item) => sum + parseFloat(item.attendanceRate), 0) / subjectChartData.length).toFixed(1)
    : 0;
  
  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold' }}>
        Attendance Analytics
      </Typography>
      
      {/* Overall Stats */}
      <Grid container spacing={3} style={{ marginBottom: '20px' }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '15px', boxShadow: 3 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overall Attendance Rate
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#6200ea' }}>
                {overallAttendanceRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Number(overallAttendanceRate)} 
                style={{ marginTop: '10px', height: '10px', borderRadius: '5px' }}
                color={overallAttendanceRate >= 75 ? "success" : overallAttendanceRate >= 50 ? "warning" : "error"}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '15px', boxShadow: 3 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Classes Attended
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {subjectChartData.reduce((sum, item) => sum + item.present, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '15px', boxShadow: 3 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Classes Missed
              </Typography>
              <Typography variant="h3" color="error" sx={{ fontWeight: 'bold' }}>
                {subjectChartData.reduce((sum, item) => sum + item.absent, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '20px', borderRadius: '15px' }}>
            <Typography variant="h6" gutterBottom>
              Subject-wise Attendance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendanceRate" fill="#6200ea" name="Attendance %" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '20px', borderRadius: '15px' }}>
            <Typography variant="h6" gutterBottom>
              Daily Attendance Pattern
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#00c853" name="Present" strokeWidth={3} />
                <Line type="monotone" dataKey="absent" stroke="#ff1744" name="Absent" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Detailed Subject Table */}
      <Paper style={{ padding: '20px', marginTop: '20px', borderRadius: '15px' }}>
        <Typography variant="h6" gutterBottom>
          Detailed Subject Performance
        </Typography>
        <Grid container spacing={2}>
          {subjectChartData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ borderRadius: '10px' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{item.subject}</Typography>
                  <Typography variant="h5" style={{ 
                    color: item.attendanceRate >= 75 ? '#2e7d32' : 
                           item.attendanceRate >= 50 ? '#ed6c02' : '#d32f2f' 
                  }}>
                    {item.attendanceRate}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.present} present / {item.absent} absent
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Number(item.attendanceRate)} 
                    style={{ marginTop: '8px', height: '6px', borderRadius: '3px' }}
                    color={item.attendanceRate >= 75 ? "success" : 
                           item.attendanceRate >= 50 ? "warning" : "error"}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default AttendanceAnalytics;