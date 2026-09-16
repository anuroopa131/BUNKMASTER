import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid, Chip, Button, Grow, Fade, Alert } from '@mui/material';
import { AccessTime, CheckCircle, Cancel } from '@mui/icons-material';
import { tokens } from '../styles/theme';

// Props: todayClasses, markAttendance, cardHover
const TodayTab = ({ todayClasses, markAttendance, cardHover }) => {
  return (
            <Fade in timeout={400} key="today">
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Today's classes</Typography>

                {todayClasses.length === 0 ? (
                  <Alert severity="info">No classes scheduled for today. Add your timetable first.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {todayClasses.map((cls, i) => (
                      <Grid item xs={12} key={cls.timetable_id}>
                        <Grow in timeout={300 + i * 90}>
                          <Card sx={cardHover}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                <Box>
                                  <Typography variant="h6">{cls.subject_name}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                                    {cls.start_time}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Button
                                    variant={cls.status === 'present' ? "contained" : "outlined"}
                                    color="success"
                                    onClick={() => markAttendance(cls.timetable_id, 'present')}
                                    startIcon={<CheckCircle />}
                                    sx={{ mr: 1 }}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    variant={cls.status === 'absent' ? "contained" : "outlined"}
                                    color="error"
                                    onClick={() => markAttendance(cls.timetable_id, 'absent')}
                                    startIcon={<Cancel />}
                                  >
                                    Absent
                                  </Button>
                                </Box>
                              </Box>
                              {cls.status && (
                                <Chip
                                  label={`Marked ${cls.status}`}
                                  color={cls.status === 'present' ? "success" : "error"}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Fade>
  );
};

export default TodayTab;