import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'John Doe', attendance: 75 },
  { name: 'Jane Smith', attendance: 90 },
];

const Analytics = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Analytics
      </Typography>
      <BarChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="attendance" fill="#8884d8" />
      </BarChart>
    </Box>
  );
};

export default Analytics;