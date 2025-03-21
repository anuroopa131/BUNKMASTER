import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const attendanceData = [
  { id: 1, name: 'John Doe', present: 15, absent: 5 },
  { id: 2, name: 'Jane Smith', present: 18, absent: 2 },
];

const AttendanceManagement = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Attendance Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Present</TableCell>
              <TableCell>Absent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.id}</TableCell>
                <TableCell>{data.name}</TableCell>
                <TableCell>{data.present}</TableCell>
                <TableCell>{data.absent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceManagement;