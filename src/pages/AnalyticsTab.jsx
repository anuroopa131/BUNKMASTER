import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid, Grow, Fade, Alert, CircularProgress } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { tokens } from '../styles/theme';

// Props: analytics, loading, cardHover, CHART_COLORS
const AnalyticsTab = ({ analytics, loading, cardHover, CHART_COLORS }) => {
  return (
            <Fade in timeout={400} key="analytics">
              <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Detailed analytics</Typography>

                {loading.analytics ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: tokens.primary }} />
                  </Box>
                ) : (
                  <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      {[
                        { label: 'Total days', value: analytics.overall.total_days, color: tokens.ink },
                        { label: 'Total classes', value: analytics.overall.total_classes, color: tokens.ink },
                        { label: 'Present', value: analytics.overall.present_count, color: tokens.success },
                        { label: 'Absent', value: (analytics.overall.total_classes || 0) - (analytics.overall.present_count || 0), color: tokens.critical },
                      ].map((stat, i) => (
                        <Grid item xs={12} md={3} key={stat.label}>
                          <Grow in timeout={300 + i * 100}>
                            <Card sx={cardHover}>
                              <CardContent>
                                <Typography color="text.secondary">{stat.label}</Typography>
                                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 34, color: stat.color }}>
                                  {stat.value || 0}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grow>
                        </Grid>
                      ))}
                    </Grid>

                    {analytics.subjects.length === 0 ? (
                      <Alert severity="info">Add subjects and mark attendance to see analytics.</Alert>
                    ) : (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Grow in timeout={500}>
                            <Card sx={cardHover}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>Subject-wise attendance</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                  <BarChart data={analytics.subjects}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} />
                                    <XAxis dataKey="subject_name" stroke={tokens.inkSoft} fontSize={12} />
                                    <YAxis stroke={tokens.inkSoft} fontSize={12} domain={[0, 100]} />
                                    <Tooltip
                                      contentStyle={{ borderRadius: 10, border: `1px solid ${tokens.border}` }}
                                      formatter={(value, name, props) =>
                                        props.payload.status === 'new' ? ['No data yet', 'Attendance %'] : [`${value}%`, 'Attendance %']
                                      }
                                    />
                                    <Bar dataKey="attendance_percentage" name="Attendance %" radius={[6, 6, 0, 0]} animationDuration={800}>
                                      {analytics.subjects.map((s, idx) => (
                                        <Cell key={idx} fill={s.status === 'new' ? tokens.border : CHART_COLORS[idx % CHART_COLORS.length]} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </Grow>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Grow in timeout={650}>
                            <Card sx={cardHover}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>Attendance distribution</Typography>
                                {analytics.overall.total_classes > 0 ? (
                                  <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                      <Pie
                                        data={[
                                         { name: 'Present', value: Number(analytics.overall.present_count) || 0 },
{ name: 'Absent', value: Number(analytics.overall.total_classes) - Number(analytics.overall.present_count) || 0 }
                                        ]}
                                        dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label
                                        animationDuration={800}
                                      >
                                        <Cell fill={tokens.success} />
                                        <Cell fill={tokens.critical} />
                                      </Pie>
                                      <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${tokens.border}` }} />
                                      <Legend />
                                    </PieChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: tokens.inkSoft }}>
                                    <Typography>No attendance marked yet</Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grow>
                        </Grid>

                        <Grid item xs={12}>
                          <Grow in timeout={800}>
                            <Card sx={cardHover}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>Daily attendance trend</Typography>
                                {analytics.daily && analytics.daily.length > 0 ? (
                                  <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={analytics.daily.slice().reverse()}>
                                      <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} />
                                      <XAxis dataKey="date" stroke={tokens.inkSoft} fontSize={12} />
                                      <YAxis stroke={tokens.inkSoft} fontSize={12} allowDecimals={false} />
                                      <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${tokens.border}` }} />
                                      <Legend />
                                      <Line type="monotone" dataKey="present_count" stroke={tokens.success} strokeWidth={2.5} name="Present" animationDuration={900} dot={{ r: 3 }} />
                                      <Line type="monotone" dataKey="total_classes" stroke={tokens.warning} strokeWidth={2.5} name="Total classes" animationDuration={900} dot={{ r: 3 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: tokens.inkSoft }}>
                                    <Typography>No daily records yet</Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grow>
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}
              </Paper>
            </Fade>
  );
};

export default AnalyticsTab;