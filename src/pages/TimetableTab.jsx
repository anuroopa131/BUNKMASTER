import React from 'react';
import {
  Box, Typography, Paper, Card, Grid, FormControl, InputLabel, Select,
  MenuItem, Button, CircularProgress, Alert, Grow, Fade, IconButton, TextField,
} from '@mui/material';
import { Add, Delete as DeleteIcon } from '@mui/icons-material';
import { tokens } from '../styles/theme';

// Props: subjects, newTimetableEntry, setNewTimetableEntry, daysOfWeek, timeSlots,
// addTimetableEntry, loading, timetable, groupedTimetable, deleteTimetableEntry,
// analytics, semesterName, setSemesterName, startDate, setStartDate, endDate, setEndDate, saveSemesterSettings
const TimetableTab = ({
  subjects, newTimetableEntry, setNewTimetableEntry, daysOfWeek, timeSlots,
  addTimetableEntry, loading, timetable, groupedTimetable, deleteTimetableEntry,
  analytics, semesterName, setSemesterName, startDate, setStartDate, endDate, setEndDate, saveSemesterSettings,
}) => {
  const activeDays = daysOfWeek.filter(day => (groupedTimetable[day] || []).length > 0);

  return (
    <Fade in timeout={400} key="timetable">
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Typography variant="h5">Timetable</Typography>
          {timetable.length > 0 && (
            <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
              {timetable.length} class{timetable.length > 1 ? 'es' : ''} across {activeDays.length} day{activeDays.length > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Semester Timeline & Backfill Card */}
        <Card sx={{ mb: 3, mt: 2, p: 2.5, bgcolor: tokens.bg, boxShadow: 'none', border: `1px solid ${tokens.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5, color: tokens.ink }}>
            Semester Timeline & Attendance Baseline
          </Typography>
          <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mb: 2 }}>
            Set your semester dates to automatically mark scheduled classes as present from your start date to today.
          </Typography>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth size="small" label="Semester Name" placeholder="e.g. Semester 5"
                value={semesterName} onChange={e => setSemesterName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth type="date" size="small" label="Start Date"
                InputLabelProps={{ shrink: true }} value={startDate} onChange={e => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth type="date" size="small" label="End Date (Optional)"
                InputLabelProps={{ shrink: true }} value={endDate} onChange={e => setEndDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth variant="contained" onClick={saveSemesterSettings}
                disabled={!startDate || timetable.length === 0}
                sx={{ bgcolor: tokens.ink, textTransform: 'none', fontWeight: 600, py: 0.9 }}
              >
                {analytics?.academic_start_date ? 'Save & Sync' : 'Save & Mark Present'}
              </Button>
            </Grid>
          </Grid>
          {timetable.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: tokens.warning, mt: 1.5, fontWeight: 600 }}>
              ⚠️ Add at least one class to your timetable below before syncing attendance.
            </Typography>
          ) : analytics?.academic_start_date ? (
            <Typography sx={{ fontSize: 12, color: tokens.inkSoft, mt: 1.5 }}>
              Active start date: <b>{analytics.academic_start_date}</b>. If you were absent on any past dates, head to the <b>Calendar</b> tab to mark them.
            </Typography>
          ) : null}
        </Card>

        <Card sx={{ mb: 3, p: 2, bgcolor: tokens.bg, boxShadow: 'none', border: `1px solid ${tokens.border}` }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select
                  value={newTimetableEntry.subject_id}
                  onChange={(e) => setNewTimetableEntry(prev => ({ ...prev, subject_id: e.target.value }))}
                  label="Subject"
                >
                  {subjects.map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>{subject.subject_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Day</InputLabel>
                <Select
                  value={newTimetableEntry.day_of_week}
                  onChange={(e) => setNewTimetableEntry(prev => ({ ...prev, day_of_week: e.target.value }))}
                  label="Day"
                >
                  {daysOfWeek.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time</InputLabel>
                <Select
                  value={newTimetableEntry.start_time}
                  onChange={(e) => setNewTimetableEntry(prev => ({ ...prev, start_time: e.target.value }))}
                  label="Time"
                >
                  {timeSlots.map(time => <MenuItem key={time} value={time}>{time}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth variant="contained" onClick={addTimetableEntry}
                startIcon={<Add />} disabled={!newTimetableEntry.subject_id}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Card>

        {loading.timetable ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress sx={{ color: tokens.primary }} />
  </Box>
) : timetable.length === 0 ? (
  <Alert severity="info">No timetable entries yet. Add your first class above.</Alert>
) : (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    {activeDays.map((day, i) => {
      const dayEntries = (groupedTimetable[day] || [])
        .slice()
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' });

      return (
        <Grow in timeout={200 + i * 60} key={day}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              border: `1px solid ${isToday ? tokens.primary : tokens.border}`,
              borderRadius: 2,
              bgcolor: '#fff',
              overflow: 'hidden',
            }}
          >
            {/* Day label column */}
            <Box
              sx={{
                flex: '0 0 100px',
                px: 1.5, py: 1.5,
                bgcolor: isToday ? '#FAF8FF' : tokens.bg,
                borderRight: `1px solid ${tokens.border}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: isToday ? tokens.primary : tokens.ink }}>
                {day}
              </Typography>
              <Typography sx={{ fontSize: 11, color: tokens.inkSoft, fontFamily: "'JetBrains Mono', monospace", mt: 0.3 }}>
                {dayEntries.length} class{dayEntries.length > 1 ? 'es' : ''}
              </Typography>
            </Box>

            {/* Classes for this day */}
            <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1, p: 1.25, alignItems: 'center' }}>
              {dayEntries.map(entry => (
                <Box
                  key={entry.id}
                  className="tt-entry"
                  sx={{
                    position: 'relative',
                    borderLeft: `3px solid ${tokens.primary}`,
                    bgcolor: tokens.bg,
                    borderRadius: '0 4px 4px 0',
                    px: 1.25, py: 0.6,
                    minWidth: 130,
                    transition: 'background 150ms ease',
                    '&:hover': { bgcolor: '#EFEAFB' },
                    '&:hover .tt-delete': { opacity: 1 },
                  }}
                >
                  <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: tokens.inkSoft }}>
                    {entry.start_time}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.ink, pr: 2, lineHeight: 1.3 }}>
                    {entry.subject_name}
                  </Typography>
                  <IconButton
                    className="tt-delete"
                    size="small"
                    onClick={() => deleteTimetableEntry(entry.id)}
                    sx={{
                      position: 'absolute', top: 2, right: 2, opacity: 0,
                      transition: 'opacity 160ms ease', p: 0.4,
                      color: tokens.inkSoft, '&:hover': { color: tokens.critical },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Grow>
      );
    })}
  </Box>
)}
      </Paper>
    </Fade>
  );
};

export default TimetableTab;