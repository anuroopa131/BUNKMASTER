import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Box, TextField, Alert, Typography, Paper, Button, Grid, Card, CardContent,
  Chip, FormControl, InputLabel, Select, MenuItem, IconButton, Stack, Fade, Grow, Snackbar,
} from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, LineChart, Line, AreaChart, Area
} from "recharts";
import {
  CheckCircle, Cancel, Delete as DeleteIcon, Add, Event, AccessTime,
  CalendarToday, Dashboard as DashboardIcon, MenuBook,
  Calculate, Analytics, WarningAmber,
  CalendarMonth, ChevronLeft, ChevronRight, DeleteForever, EmojiEvents,
} from "@mui/icons-material";
import AttendanceRing from "./AttendanceRing";
import DangerZoneTab from "./DangerZoneTab";
import HomeTab from "./HomeTab";
import SubjectsTab from "./SubjectsTab";
import TimetableTab from "./TimetableTab";
import TodayTab from "./TodayTab";
import BunkCalculatorTab from "./BunkCalculatorTab";
import AnalyticsTab from "./AnalyticsTab";
import CalendarTab from "./CalendarTab";
import EndSemesterModal from "../components/EndSemesterModal";
import { tokens } from "../styles/theme";
import { authorizedFetch } from '../services/authService';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [latestRecap, setLatestRecap] = useState(null);
  const [semesterHistory, setSemesterHistory] = useState([]);
  const [endSemesterOpen, setEndSemesterOpen] = useState(false);
  const [loading, setLoading] = useState({
    subjects: false,
    timetable: false,
    attendance: false,
    analytics: false
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarClasses, setCalendarClasses] = useState([]);
  const [monthSummary, setMonthSummary] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [error, setError] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [semesterName, setSemesterName] = useState('Semester 1');
  const [toastMessage, setToastMessage] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  const [timetable, setTimetable] = useState([]);
  const [newTimetableEntry, setNewTimetableEntry] = useState({
    subject_id: "",
    day_of_week: "Monday",
    start_time: "09:00"
  });


  const [analytics, setAnalytics] = useState({
    threshold: 75,
    academic_start_date: null,
    academic_end_date: null,
    semester_name: 'Semester 1',
    overall: { total_days: 0, total_classes: 0, present_count: 0, attendance_percentage: 0, status: 'safe', classes_needed: 0, classes_can_skip: 0 },
    subjects: [],
    warnings: [],
    daily: []
  });

  const [todayClasses, setTodayClasses] = useState([]);

     const [thresholdInput, setThresholdInput] = useState(analytics.threshold || 75);

     useEffect(() => {
       setThresholdInput(analytics.threshold || 75);
     }, [analytics.threshold]);

     // Prefill the semester timeline fields with whatever's saved
     useEffect(() => {
       if (analytics.academic_start_date) {
         setStartDate(analytics.academic_start_date);
       }
       if (analytics.academic_end_date) {
         setEndDate(analytics.academic_end_date);
       }
       if (analytics.semester_name) {
         setSemesterName(analytics.semester_name);
       }
     }, [analytics.academic_start_date, analytics.academic_end_date, analytics.semester_name]);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const CHART_COLORS = [tokens.primary, tokens.primaryLight, tokens.success, tokens.warning, tokens.critical, tokens.primaryDeep];

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    setLoading(prev => ({ ...prev, analytics: true }));
    try {
      const response = await authorizedFetch(`http://localhost:5000/api/analytics/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(prev => ({ ...prev, analytics: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  };

  // Re-pulls everything that a Danger Zone action (delete/reset) could have
  // touched — subjects, timetable, analytics, and the visible calendar month —
  // so the rest of the dashboard reflects the change immediately.
  const refreshAllData = async () => {
    if (!user?.id) return;
    try {
      const [subjectsRes, timetableRes] = await Promise.all([
        authorizedFetch(`http://localhost:5000/api/subjects/${user.id}`),
        authorizedFetch(`http://localhost:5000/api/timetable/${user.id}`),
      ]);
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (timetableRes.ok) setTimetable(await timetableRes.json());
    } catch (err) {
      // Individual tabs will still show stale data if this fails; analytics
      // and the calendar refresh below are the more visible pieces.
    }
    await fetchAnalytics();
    await fetchMonthSummary(calendarYear, calendarMonth);
  };

  const fetchSemesterRecaps = async () => {
    if (!user?.id) return;
    try {
      const [latestResponse, historyResponse] = await Promise.all([
        authorizedFetch(`http://localhost:5000/api/semester/latest/${user.id}`),
        authorizedFetch(`http://localhost:5000/api/semester/history/${user.id}`),
      ]);

      if (latestResponse.ok) {
        setLatestRecap(await latestResponse.json());
      }
      if (historyResponse.ok) {
        setSemesterHistory(await historyResponse.json());
      }
    } catch (err) {
      console.error('Error fetching latest recap:', err);
    }
  };

  const handleEndSemester = async (endDate) => {
    if (!user?.id) return;
    const response = await authorizedFetch('http://localhost:5000/api/semester/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endDate }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to end semester');
    }
    setToastMessage('🎉 Semester archived! Ready for your fresh start.');
    await refreshAllData();
    await fetchSemesterRecaps();
    navigate('/dashboard');
  };

  useEffect(() => {
    fetchSemesterRecaps();
  }, [user]);

  useEffect(() => {
    // Whenever tab/path changes, fetch fresh data
    refreshAllData();
  }, [location.pathname]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user?.id) return;
      setLoading(prev => ({ ...prev, subjects: true }));
      try {
        const response = await authorizedFetch(`http://localhost:5000/api/subjects/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(data);
      } catch (err) {
        setError(prev => ({ ...prev, subjects: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!user?.id) return;
      setLoading(prev => ({ ...prev, timetable: true }));
      try {
        const response = await authorizedFetch(`http://localhost:5000/api/timetable/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch timetable');
        const data = await response.json();
        setTimetable(data);
      } catch (err) {
        setError(prev => ({ ...prev, timetable: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, timetable: false }));
      }
    };
    fetchTimetable();
  }, [user]);

  useEffect(() => {
    const fetchTodayClasses = async () => {
      if (!user?.id) return;
      try {
        const response = await authorizedFetch(`http://localhost:5000/api/attendance/today/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch today's classes");
        const data = await response.json();
        setTodayClasses(data);
      } catch (err) {
        console.error("Error fetching today's classes:", err);
      }
    };
    fetchTodayClasses();
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const addSubject = async () => {
    if (!user?.id || !newSubject.trim()) return;
    try {
      const response = await authorizedFetch('http://localhost:5000/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_name: newSubject.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add subject');
      const addedSubject = await response.json();
      setSubjects(prev => [...prev, addedSubject]);
      setNewSubject("");
    } catch (err) {
      alert('Failed to add subject');
    }
  };

  const deleteSubject = async (subjectId) => {
    if (!window.confirm('Delete this subject? All related data will be removed.')) return;
    try {
      const response = await authorizedFetch(`http://localhost:5000/api/subjects/${subjectId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete subject');
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
    } catch (err) {
      alert('Failed to delete subject');
    }
  };

  const fetchDayClasses = async (date) => {
    if (!user?.id) return;
    try {
      const response = await authorizedFetch(`http://localhost:5000/api/attendance/date/${user.id}/${date}`);
      const data = await response.json();
      setCalendarClasses(data);
    } catch (err) {
      console.error('Error fetching day classes:', err);
    }
  };

  const fetchMonthSummary = async (year, month) => {
    if (!user?.id) return;
    try {
      const response = await authorizedFetch(`http://localhost:5000/api/attendance/month/${user.id}/${year}/${month}`);
      const data = await response.json();
      const summaryMap = {};
      data.forEach(row => { summaryMap[row.date] = row; });
      setMonthSummary(summaryMap);
    } catch (err) {
      console.error('Error fetching month summary:', err);
    }
  };

  useEffect(() => { fetchDayClasses(selectedDate); }, [selectedDate, user]);
  useEffect(() => { fetchMonthSummary(calendarYear, calendarMonth); }, [calendarYear, calendarMonth, user]);

  const addTimetableEntry = async () => {
    if (!user?.id || !newTimetableEntry.subject_id || !newTimetableEntry.start_time) return;
    try {
      const response = await authorizedFetch('http://localhost:5000/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTimetableEntry),
      });
      if (!response.ok) throw new Error('Failed to add timetable entry');
      const newEntry = await response.json();
      setTimetable(prev => [...prev, newEntry]);
      setNewTimetableEntry({ subject_id: "", day_of_week: "Monday", start_time: "09:00" });

      // Auto re-run backfill if user already has a saved semester start date
      const effectiveStartDate = analytics.academic_start_date || startDate;
      console.log('[Auto-Backfill Debug] effectiveStartDate:', effectiveStartDate, 'userId:', user?.id, 'newEntry:', newEntry);
      if (effectiveStartDate) {
        try {
          const bfRes = await authorizedFetch('http://localhost:5000/api/attendance/backfill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: effectiveStartDate }),
          });
          if (bfRes.ok) {
            const data = await bfRes.json();
            console.log('[Auto-Backfill Debug] Response from /api/attendance/backfill:', data);
            const subName = newEntry.subject_name || 'new class';
            const count = data.insertedCount ?? data.count ?? 0;
            setToastMessage(`Auto-backfilled attendance for ${subName} since ${effectiveStartDate} (${count} classes added)`);
          }
        } catch (e) {
          console.error('Auto-backfill error:', e);
        }
      }

      await fetchAnalytics();
      await fetchMonthSummary(calendarYear, calendarMonth);
    } catch (err) {
      alert('Failed to add timetable entry');
    }
  };

  const deleteTimetableEntry = async (entryId) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      const response = await authorizedFetch(`http://localhost:5000/api/timetable/${entryId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete entry');
      setTimetable(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  const markAttendance = async (timetableId, status, date = selectedDate) => {
    try {
      const response = await authorizedFetch('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timetable_id: timetableId, date, status }),
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      setCalendarClasses(prev => prev.map(cls =>
        cls.timetable_id === timetableId ? { ...cls, status } : cls
      ));
      if (date === new Date().toISOString().split('T')[0]) {
        setTodayClasses(prev => prev.map(cls =>
          cls.timetable_id === timetableId ? { ...cls, status } : cls
        ));
      }
      await fetchAnalytics();
      await fetchMonthSummary(calendarYear, calendarMonth);
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance');
    }
  };


     const updateThreshold = async (newValue) => {
       if (!user?.id) return;
       try {
         const response = await authorizedFetch(`http://localhost:5000/api/users/${user.id}/threshold`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ target_percentage: newValue }),
         });
         if (!response.ok) throw new Error('Failed to update threshold');
         await fetchAnalytics();
       } catch (err) {
         alert('Failed to update attendance target');
       }
     };

  const runBackfill = async () => {
    if (!startDate || !user?.id) return;

    const existing = analytics.academic_start_date;
    if (existing && startDate === existing) return; // nothing changed

    let confirmMsg;
    if (!existing) {
      confirmMsg = `Mark all classes present from ${startDate} to today? You can go to Calendar afterward and flip any day you were absent.`;
    } else if (startDate < existing) {
      confirmMsg = `Move your start date back to ${startDate}? Classes from ${startDate} up to your old start date (${existing}) will be marked present. You can flip any day you were actually absent in Calendar afterward.`;
    } else {
      confirmMsg = `Move your start date forward to ${startDate}? Auto-filled attendance before that date will be removed. Any days you've already corrected by hand will be left as they are.`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await authorizedFetch('http://localhost:5000/api/attendance/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate }),
      });
      const data = await res.json();

      if (data.action === 'shrunk') {
        const keptNote = data.keptManualCount > 0
          ? ` ${data.keptManualCount} day${data.keptManualCount > 1 ? 's' : ''} you'd corrected by hand were left as-is.`
          : '';
        alert(`Start date updated. Removed ${data.deletedCount} auto-filled day${data.deletedCount === 1 ? '' : 's'} before ${data.newStartDate}.${keptNote}`);
      } else {
        alert(`Marked ${data.insertedCount} classes as present. Go to Calendar to correct any absences.`);
      }

      await fetchAnalytics();
      await fetchMonthSummary(calendarYear, calendarMonth);
    } catch (err) {
      alert('Backfill failed');
    }
  };

  const saveSemesterSettings = async () => {
    if (!user?.id) return;
    try {
      await authorizedFetch(`http://localhost:5000/api/users/${user.id}/semester`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester_name: semesterName,
          academic_start_date: startDate || null,
          academic_end_date: endDate || null
        }),
      });

      if (startDate && timetable.length > 0) {
        await runBackfill();
      } else {
        await fetchAnalytics();
        setToastMessage('Semester settings saved');
      }
    } catch (err) {
      alert('Failed to save semester settings');
    }
  };

  const markWholeDay = async (status) => {
    try {
      await authorizedFetch('http://localhost:5000/api/attendance/day-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, status }),
      });
      await fetchDayClasses(selectedDate);
      await fetchAnalytics();
      await fetchMonthSummary(calendarYear, calendarMonth);
    } catch (err) {
      alert('Failed to update day');
    }
  };

  const groupedTimetable = timetable.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) acc[entry.day_of_week] = [];
    acc[entry.day_of_week].push(entry);
    return acc;
  }, {});

  const tabConfig = [
    { path: "/dashboard", icon: <DashboardIcon fontSize="small" />, label: "Home" },
    { path: "/subjects", icon: <MenuBook fontSize="small" />, label: "Subjects" },
    { path: "/timetable", icon: <Event fontSize="small" />, label: "Timetable" },
    { path: "/today", icon: <CalendarToday fontSize="small" />, label: "Today" },
    { path: "/bunk-calculator", icon: <Calculate fontSize="small" />, label: "Bunk calculator" },
    { path: "/analytics", icon: <Analytics fontSize="small" />, label: "Analytics" },
    { path: "/calendar", icon: <CalendarMonth fontSize="small" />, label: "Calendar" },
    { path: "/danger-zone", icon: <DeleteForever fontSize="small" />, label: "Danger zone" },
  ];

  const pathToIndex = {
    '/dashboard': 0,
    '/': 0,
    '/home': 0,
    '/subjects': 1,
    '/subject': 1,
    '/timetable': 2,
    '/today': 3,
    '/bunk-calculator': 4,
    '/calculator': 4,
    '/analytics': 5,
    '/calendar': 6,
    '/danger-zone': 7,
  };
  const activeTab = pathToIndex[location.pathname] !== undefined ? pathToIndex[location.pathname] : 0;

  const cardHover = {
    transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 220ms ease',
  };

  const safeCount = analytics.subjects.filter(s => s.status === 'safe').length;
  const watchCount = analytics.subjects.filter(s => s.status === 'warning').length;
  const riskCount = analytics.subjects.filter(s => s.status === 'critical').length;
  const weekDays = (analytics.daily || []).slice(0, 5).slice().reverse();

  return (
    <Box sx={{ bgcolor: tokens.bg, minHeight: '100vh', display: 'flex' }}>

      {/* ---------- Sidebar nav ---------- */}
      <Box
        sx={{
          width: 220, flexShrink: 0, bgcolor: tokens.surface,
          borderRight: `1px solid ${tokens.border}`, minHeight: '100vh',
          position: 'sticky', top: 0, alignSelf: 'flex-start',
          display: 'flex', flexDirection: 'column', py: 3, px: 2,
        }}
      >
  
        <Stack spacing={0.5}>
          {tabConfig.map((t, i) => (
            <Box
              key={t.label}
              onClick={() => navigate(t.path)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.25,
                px: 1.5, py: 1, borderRadius: 2, cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                color: activeTab === i ? '#fff' : tokens.inkSoft,
                background: activeTab === i ? tokens.gradient : 'transparent',
                boxShadow: activeTab === i ? '0 4px 14px rgba(22,33,62,0.28)' : 'none',
                transition: 'all 160ms ease',
                '&:hover': activeTab === i ? {} : { bgcolor: tokens.bg },
              }}
            >
              {t.icon}
              {t.label}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ---------- Main content ---------- */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>

          {/* Home Tab */}
          {activeTab === 0 && (
            <HomeTab
              analytics={analytics}
              loading={loading}
              subjects={subjects}
              timetable={timetable}
              todayClasses={todayClasses}
              safeCount={safeCount}
              watchCount={watchCount}
              riskCount={riskCount}
              weekDays={weekDays}
              user={user}
              cardHover={cardHover}
              setActiveTab={(i) => navigate(tabConfig[i].path)}
              latestRecap={latestRecap}
              semesterHistory={semesterHistory}
              onStartNewSemester={() => navigate('/subjects')}
              onOpenEndSemesterModal={() => setEndSemesterOpen(true)}
            />
          )}

          {/* Subjects Tab */}
          {activeTab === 1 && (
            <SubjectsTab
              subjects={subjects}
              newSubject={newSubject}
              setNewSubject={setNewSubject}
              addSubject={addSubject}
              loading={loading}
              deleteSubject={deleteSubject}
              cardHover={cardHover}
            />
          )}

          {/* Timetable Tab */}
          {activeTab === 2 && (
            <TimetableTab
              subjects={subjects}
              newTimetableEntry={newTimetableEntry}
              setNewTimetableEntry={setNewTimetableEntry}
              daysOfWeek={daysOfWeek}
              timeSlots={timeSlots}
              addTimetableEntry={addTimetableEntry}
              loading={loading}
              timetable={timetable}
              groupedTimetable={groupedTimetable}
              deleteTimetableEntry={deleteTimetableEntry}
              analytics={analytics}
              semesterName={semesterName}
              setSemesterName={setSemesterName}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              saveSemesterSettings={saveSemesterSettings}
            />
          )}

          {/* Today's Classes Tab */}
          {activeTab === 3 && (
            <TodayTab
              todayClasses={todayClasses}
              markAttendance={markAttendance}
              cardHover={cardHover}
            />
          )}

          {/* Bunk Calculator Tab */}
          {activeTab === 4 && (
            <BunkCalculatorTab
              analytics={analytics}
              thresholdInput={thresholdInput}
              setThresholdInput={setThresholdInput}
              updateThreshold={updateThreshold}
              cardHover={cardHover}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 5 && (
            <AnalyticsTab
              analytics={analytics}
              loading={loading}
              cardHover={cardHover}
              CHART_COLORS={CHART_COLORS}
            />
          )}

          {/* Calendar Tab */}
          {activeTab === 6 && (
            <CalendarTab
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              calendarYear={calendarYear}
              setCalendarYear={setCalendarYear}
              monthSummary={monthSummary}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              calendarClasses={calendarClasses}
              markWholeDay={markWholeDay}
              markAttendance={markAttendance}
              cardHover={cardHover}
            />
          )}

          {/* Danger Zone Tab */}
          {activeTab === 7 && (
            <Fade in>
              <Box>
                <DangerZoneTab
                  user={user}
                  academicStartDate={analytics.academic_start_date}
                  onDataChanged={refreshAllData}
                />
              </Box>
            </Fade>
          )}

        </Container>
        <EndSemesterModal
          open={endSemesterOpen}
          onClose={() => setEndSemesterOpen(false)}
          onEndSemester={handleEndSemester}
          semesterName={analytics.semester_name}
          defaultEndDate={analytics.academic_end_date}
        />
        <Snackbar
          open={Boolean(toastMessage)}
          autoHideDuration={4500}
          onClose={() => setToastMessage('')}
          message={toastMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
