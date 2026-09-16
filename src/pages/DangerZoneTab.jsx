import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Stack, Button, TextField, Divider,
  Alert, RadioGroup, FormControlLabel, Radio, Chip, CircularProgress
} from '@mui/material';
import {
  DeleteForever, MenuBook, Event, Fingerprint, Flag, History
} from '@mui/icons-material';
import PasswordConfirmDialog from './PasswordConfirmDialog';
import { tokens } from '../styles/theme';
import { authorizedFetch } from '../services/authService';

const todayStr = () => new Date().toISOString().split('T')[0];

const sectionCardStyle = {
  p: 3,
  borderRadius: 3,
  border: `1px solid ${tokens.border}`,
  boxShadow: 'none',
};

// Every destructive action funnels through here: set `pendingAction` to an
// object describing the confirm-dialog copy + what to actually call once
// the password checks out, which opens PasswordConfirmDialog.
const DangerZoneTab = ({ user, academicStartDate, onDataChanged }) => {
  const [pendingAction, setPendingAction] = useState(null);

  const [attendanceDeleteMode, setAttendanceDeleteMode] = useState('all'); // 'all' | 'from'
  const [attendanceFromDate, setAttendanceFromDate] = useState('');

  const [endSemesterDate, setEndSemesterDate] = useState(todayStr());
  const [semesterSummary, setSemesterSummary] = useState(null);
  const [endingSemester, setEndingSemester] = useState(false);
  const [endSemesterError, setEndSemesterError] = useState('');

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      try {
        const res = await authorizedFetch(`https://bunkmaster-gs92.onrender.com/api/semester/history/${user.id}`);
        if (res.ok) setHistory(await res.json());
      } catch (err) {
        // Non-critical — just don't show past semesters if this fails.
      }
    };
    fetchHistory();
  }, [user]);

  const runAndRefresh = async (url, options) => {
    const res = await authorizedFetch(url, options);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Request failed');
    }
    await onDataChanged();
  };

  // --- Delete all subjects (cascades: subjects -> timetable -> attendance) ---
  const confirmDeleteAllSubjects = () => setPendingAction({
    title: 'Delete all subjects?',
    description: 'This deletes every subject you\'ve added, your entire timetable, and every attendance log tied to them.',
    confirmLabel: 'Delete all subjects',
    onConfirmed: () => runAndRefresh(`https://bunkmaster-gs92.onrender.com/api/subjects/all/${user.id}`, { method: 'DELETE' }),
  });

  // --- Delete all timetable (cascades: timetable -> attendance; subjects stay) ---
  const confirmDeleteAllTimetable = () => setPendingAction({
    title: 'Delete your timetable?',
    description: 'This deletes every timetable entry and every attendance log tied to it. Your subjects list stays intact.',
    confirmLabel: 'Delete timetable',
    onConfirmed: () => runAndRefresh(`https://bunkmaster-gs92.onrender.com/api/timetable/all/${user.id}`, { method: 'DELETE' }),
  });

  // --- Delete attendance logs: wipe everything, or from a chosen date onward ---
  const confirmDeleteAttendance = () => {
    if (attendanceDeleteMode === 'from' && !attendanceFromDate) return;

    if (attendanceDeleteMode === 'all') {
      setPendingAction({
        title: 'Wipe all attendance logs?',
        description: 'This deletes every attendance record you have and resets your semester start date. Subjects and timetable stay intact.',
        confirmLabel: 'Wipe attendance',
        onConfirmed: () => runAndRefresh(`https://bunkmaster-gs92.onrender.com/api/attendance/all/${user.id}`, { method: 'DELETE' }),
      });
    } else {
      setPendingAction({
        title: `Delete attendance from ${attendanceFromDate} onward?`,
        description: `This deletes every attendance record dated ${attendanceFromDate} or later. Anything before that date is untouched.`,
        confirmLabel: 'Delete these logs',
        onConfirmed: () => runAndRefresh(`https://bunkmaster-gs92.onrender.com/api/attendance/from/${user.id}/${attendanceFromDate}`, { method: 'DELETE' }),
      });
    }
  };

  // --- End semester: archive a summary, no deletion ---
  const handleEndSemester = async () => {
    if (!endSemesterDate || endSemesterDate > todayStr()) {
      setEndSemesterError('Pick today or an earlier date — not a future one.');
      return;
    }
    setEndSemesterError('');
    setEndingSemester(true);
    try {
      const res = await authorizedFetch('[https://bunkmaster-gs92.onrender.com](https://bunkmaster-gs92.onrender.com)/api/semester/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate: endSemesterDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not end semester');
      await onDataChanged();
      setSemesterSummary(data);
      setHistory(prev => [data, ...prev]);
    } catch (err) {
      setEndSemesterError(err.message);
    } finally {
      setEndingSemester(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <DeleteForever sx={{ color: tokens.critical }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Danger zone</Typography>
      </Stack>

      <Stack spacing={3}>
        {/* Delete all subjects */}
        <Paper sx={sectionCardStyle}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <MenuBook sx={{ color: tokens.inkSoft }} />
            <Typography sx={{ fontWeight: 700 }}>Delete all subjects</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 2 }}>
            Removes every subject, plus the timetable entries and attendance logs built on top of them.
          </Typography>
          <Button variant="outlined" color="error" onClick={confirmDeleteAllSubjects}>
            Delete all subjects
          </Button>
        </Paper>

        {/* Delete all timetable */}
        <Paper sx={sectionCardStyle}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Event sx={{ color: tokens.inkSoft }} />
            <Typography sx={{ fontWeight: 700 }}>Delete timetable</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 2 }}>
            Removes your entire timetable and any attendance logged against it. Subjects themselves are kept.
          </Typography>
          <Button variant="outlined" color="error" onClick={confirmDeleteAllTimetable}>
            Delete timetable
          </Button>
        </Paper>

        {/* Delete attendance logs */}
        <Paper sx={sectionCardStyle}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Fingerprint sx={{ color: tokens.inkSoft }} />
            <Typography sx={{ fontWeight: 700 }}>Delete attendance logs</Typography>
          </Stack>
          <RadioGroup
            value={attendanceDeleteMode}
            onChange={e => setAttendanceDeleteMode(e.target.value)}
            sx={{ mb: 1.5 }}
          >
            <FormControlLabel value="all" control={<Radio size="small" />} label="Wipe every attendance log (also resets your start date)" />
            <FormControlLabel value="from" control={<Radio size="small" />} label="Delete logs from a specific date onward" />
          </RadioGroup>
          {attendanceDeleteMode === 'from' && (
            <TextField
              type="date"
              size="small"
              value={attendanceFromDate}
              onChange={e => setAttendanceFromDate(e.target.value)}
              inputProps={{ max: todayStr() }}
              sx={{ mb: 2, display: 'block' }}
            />
          )}
          <Button
            variant="outlined"
            color="error"
            onClick={confirmDeleteAttendance}
            disabled={attendanceDeleteMode === 'from' && !attendanceFromDate}
          >
            {attendanceDeleteMode === 'all' ? 'Wipe all attendance' : 'Delete from this date'}
          </Button>
        </Paper>

        <Divider />

        {/* End semester */}
        <Paper sx={sectionCardStyle}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Flag sx={{ color: tokens.primary }} />
            <Typography sx={{ fontWeight: 700 }}>End semester</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 2 }}>
            Saves a snapshot of your attendance trends for the period ending on the date you pick.
            Your current subjects, timetable, and attendance history are preserved, and a new empty
            semester opens automatically after archiving.
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <TextField
              type="date"
              size="small"
              label="Semester end date"
              InputLabelProps={{ shrink: true }}
              value={endSemesterDate}
              onChange={e => setEndSemesterDate(e.target.value)}
              inputProps={{ max: todayStr() }}
            />
            <Button variant="contained" onClick={handleEndSemester} disabled={endingSemester}>
              {endingSemester ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'End semester & archive'}
            </Button>
          </Stack>
          {endSemesterError && <Alert severity="error" sx={{ mt: 2 }}>{endSemesterError}</Alert>}

          {semesterSummary && (
            <Paper variant="outlined" sx={{ mt: 3, p: 2.5, borderRadius: 2, bgcolor: tokens.bg }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                {semesterSummary.start_date} → {semesterSummary.end_date}
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Overall attendance</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {semesterSummary.summary?.overall_percentage}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Classes attended</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {semesterSummary.summary?.present_count}/{semesterSummary.summary?.total_classes}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Longest perfect streak</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {semesterSummary.summary?.longest_streak} days
                  </Typography>
                </Box>
              </Stack>
              {semesterSummary.summary?.best_subject && (
                <Chip
                  size="small"
                  label={`Best: ${semesterSummary.summary.best_subject}`}
                  sx={{ mr: 1, bgcolor: '#EAF7EF', color: tokens.success, fontWeight: 600 }}
                />
              )}
              {semesterSummary.summary?.worst_subject && (
                <Chip
                  size="small"
                  label={`Needs attention: ${semesterSummary.summary.worst_subject}`}
                  sx={{ bgcolor: '#FDEAEA', color: tokens.critical, fontWeight: 600 }}
                />
              )}
            </Paper>
          )}

          {history.length > 0 && (
            <>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3, mb: 1 }}>
                <History fontSize="small" sx={{ color: tokens.inkSoft }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.inkSoft }}>
                  Past semesters
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {history.map(h => (
                  <Chip
                    key={h.id || `${h.start_date}-${h.end_date}`}
                    size="small"
                    label={`${h.start_date} → ${h.end_date} · ${h.summary?.overall_percentage ?? h.threshold}%`}
                  />
                ))}
              </Stack>
            </>
          )}

        </Paper>
      </Stack>

      <PasswordConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title}
        description={pendingAction?.description}
        confirmLabel={pendingAction?.confirmLabel}
        userId={user?.id}
        onCancel={() => setPendingAction(null)}
        onConfirmed={async () => {
          const action = pendingAction;
          setPendingAction(null);
          if (action?.onConfirmed) await action.onConfirmed();
        }}
      />
    </Box>
  );
};

export default DangerZoneTab;
