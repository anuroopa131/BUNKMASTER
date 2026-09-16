import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid, Stack, Button, Alert, IconButton, Fade, Chip } from '@mui/material';
import { AccessTime, CheckCircle, Cancel, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { tokens } from '../styles/theme';

// Props: calendarMonth/setCalendarMonth, calendarYear/setCalendarYear,
// monthSummary, selectedDate/setSelectedDate, calendarClasses,
// markWholeDay, markAttendance, cardHover
const CalendarTab = ({
  calendarMonth, setCalendarMonth, calendarYear, setCalendarYear,
  monthSummary, selectedDate, setSelectedDate, calendarClasses,
  markWholeDay, markAttendance, cardHover,
}) => {
  return (
            <Fade in timeout={400} key="calendar">
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Attendance calendar</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Click any past date to view or edit that day's attendance.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Card sx={cardHover}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <IconButton
                            onClick={() => {
                              let m = calendarMonth - 1, y = calendarYear;
                              if (m < 1) { m = 12; y -= 1; }
                              setCalendarMonth(m); setCalendarYear(y);
                            }}
                          >
                            <ChevronLeft />
                          </IconButton>
                          <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>
                            {new Date(calendarYear, calendarMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              let m = calendarMonth + 1, y = calendarYear;
                              if (m > 12) { m = 1; y += 1; }
                              setCalendarMonth(m); setCalendarYear(y);
                            }}
                            disabled={calendarYear === new Date().getFullYear() && calendarMonth === new Date().getMonth() + 1}
                          >
                            <ChevronRight />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <Typography key={d} sx={{ textAlign: 'center', fontSize: 12, color: tokens.inkSoft, fontWeight: 600 }}>
                              {d}
                            </Typography>
                          ))}
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                          {(() => {
                            const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                            const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                            const todayStr = new Date().toISOString().split('T')[0];
                            const cells = [];

                            for (let i = 0; i < firstDay; i++) {
                              cells.push(<Box key={`empty-${i}`} />);
                            }

                            for (let d = 1; d <= daysInMonth; d++) {
                              const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                              const summary = monthSummary[dateStr];
                              const isFuture = dateStr > todayStr;
                              const isSelected = dateStr === selectedDate;

                              let dotColor = tokens.border;
                              if (summary && summary.total_count > 0) {
                                const pct = (summary.present_count / summary.total_count) * 100;
                                dotColor = pct === 100 ? tokens.success : pct === 0 ? tokens.critical : tokens.warning;
                              }

                              cells.push(
                                <Box
                                  key={dateStr}
                                  onClick={() => !isFuture && setSelectedDate(dateStr)}
                                  sx={{
                                    aspectRatio: '1',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 2, cursor: isFuture ? 'default' : 'pointer', opacity: isFuture ? 0.35 : 1,
                                    border: isSelected ? `1.5px solid ${tokens.primary}` : '1.5px solid transparent',
                                    bgcolor: isSelected ? '#FAF8FF' : 'transparent',
                                    transition: 'all 150ms ease',
                                    '&:hover': !isFuture ? { bgcolor: tokens.bg } : {},
                                  }}
                                >
                                  <Typography sx={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: tokens.ink }}>
                                    {d}
                                  </Typography>
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dotColor, mt: 0.3 }} />
                                </Box>
                              );
                            }
                            return cells;
                          })()}
                        </Box>

                        <Stack direction="row" spacing={2} sx={{ mt: 2.5, flexWrap: 'wrap' }}>
                          {[
                            { color: tokens.success, label: 'All present' },
                            { color: tokens.warning, label: 'Partial' },
                            { color: tokens.critical, label: 'All absent' },
                            { color: tokens.border, label: 'No data' },
                          ].map(item => (
                            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                              <Typography sx={{ fontSize: 12, color: tokens.inkSoft }}>{item.label}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Card sx={{ ...cardHover, height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long', month: 'long', day: 'numeric'
                          })}
                        </Typography>

                        {calendarClasses.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1 }}>
                            <Button size="small" variant="outlined" color="success" onClick={() => markWholeDay('present')}>
                              Mark all present
                            </Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => markWholeDay('absent')}>
                              Mark all absent
                            </Button>
                          </Stack>
                        )}

                        {calendarClasses.length === 0 ? (
                          <Alert severity="info" sx={{ mt: 2 }}>No classes scheduled this day.</Alert>
                        ) : (
                          <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {calendarClasses.map(cls => {
                              const isPresent = cls.status === 'present';
                              const isAbsent = cls.status === 'absent';
                              return (
                                <Box
                                  key={cls.timetable_id}
                                  sx={{
                                    border: `1.5px solid ${isPresent ? '#1F9E82' : isAbsent ? '#E8574A' : tokens.border}`,
                                    background: isPresent
                                      ? 'linear-gradient(135deg, #EAF7EF 0%, #D4F4E2 100%)'
                                      : isAbsent
                                      ? 'linear-gradient(135deg, #FDEAEA 0%, #FCD2D2 100%)'
                                      : '#FFFFFF',
                                    borderRadius: 2.5,
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 1.5,
                                    boxShadow: isPresent
                                      ? '0 2px 8px rgba(31, 158, 130, 0.12)'
                                      : isAbsent
                                      ? '0 2px 8px rgba(232, 87, 74, 0.12)'
                                      : 'none',
                                    transition: 'all 200ms ease',
                                  }}
                                >
                                  <Box sx={{ flex: 1, minWidth: 140 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography sx={{ fontWeight: 700, fontSize: 15, color: tokens.ink }}>
                                        {cls.subject_name}
                                      </Typography>
                                      {isPresent && (
                                        <Chip
                                          label="PRESENT"
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            bgcolor: '#1F9E82',
                                            color: '#fff',
                                            letterSpacing: '0.5px',
                                          }}
                                        />
                                      )}
                                      {isAbsent && (
                                        <Chip
                                          label="ABSENT"
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            bgcolor: '#E8574A',
                                            color: '#fff',
                                            letterSpacing: '0.5px',
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Typography sx={{ fontSize: 12, color: tokens.inkSoft, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                      <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                                      {cls.start_time}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => markAttendance(cls.timetable_id, 'present', selectedDate)}
                                      sx={{
                                        color: isPresent ? '#fff' : tokens.inkSoft,
                                        bgcolor: isPresent ? '#1F9E82' : 'transparent',
                                        '&:hover': { bgcolor: isPresent ? '#18866E' : 'rgba(31, 158, 130, 0.1)' },
                                        width: 32,
                                        height: 32,
                                      }}
                                      title="Mark Present"
                                    >
                                      <CheckCircle sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => markAttendance(cls.timetable_id, 'absent', selectedDate)}
                                      sx={{
                                        color: isAbsent ? '#fff' : tokens.inkSoft,
                                        bgcolor: isAbsent ? '#E8574A' : 'transparent',
                                        '&:hover': { bgcolor: isAbsent ? '#C94034' : 'rgba(232, 87, 74, 0.1)' },
                                        width: 32,
                                        height: 32,
                                      }}
                                      title="Mark Absent"
                                    >
                                      <Cancel sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
  );
};

export default CalendarTab;