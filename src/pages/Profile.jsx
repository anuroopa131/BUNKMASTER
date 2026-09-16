import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, Chip, Avatar, Stack,
  CircularProgress, Alert
} from '@mui/material';
import AttendanceRing from './AttendanceRing';
import { tokens } from '../styles/theme';
import { authorizedFetch } from '../services/authService';

const STATUS_COPY = {
  safe: { label: 'On track', color: 'success' },
  warning: { label: 'Watch', color: 'warning' },
  critical: { label: 'Shortage', color: 'error' },
  new: { label: 'No data yet', color: 'default' },
};

const cardStyle = {
  borderRadius: 3,
  border: `1px solid ${tokens.border}`,
  boxShadow: 'none',
};

const Profile = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await authorizedFetch(`https://bunkmaster-gs92.onrender.com/api/analytics/${user.id}`);
        if (!res.ok) throw new Error('Failed to load your attendance data');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  const overall = analytics?.overall || {
    total_classes: 0, present_count: 0, attendance_percentage: 0, status: 'new'
  };
  const subjects = analytics?.subjects || [];
  const threshold = analytics?.threshold ?? 75;
  const status = STATUS_COPY[overall.status] || STATUS_COPY.new;

  const safeCount = subjects.filter(s => s.status === 'safe').length;
  const watchCount = subjects.filter(s => s.status === 'warning').length;
  const riskCount = subjects.filter(s => s.status === 'critical').length;

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <Box sx={{ bgcolor: tokens.bg, minHeight: '100vh' }}>
      {/* Header banner — same gradient the app's top bar uses, so this reads
          as part of BunkMaster rather than a bolted-on settings page. */}
    
    

      <Box sx={{ px: { xs: 3, md: 6 }, py: 4, maxWidth: 1000, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Overall attendance — the ring is the same component used on
                Dashboard's subject cards, reused here as the page's focal stat. */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ ...cardStyle, p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 600, color: tokens.primary, mb: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Overall attendance
                </Typography>
                <AttendanceRing
                  percentage={overall.attendance_percentage || 0}
                  status={overall.status || 'safe'}
                  size={140}
                  thickness={12}
                />
                <Chip label={status.label} color={status.color} sx={{ mt: 2, fontWeight: 600 }} />
                <Typography variant="caption" sx={{ color: tokens.inkSoft, mt: 1 }}>
                  Target: {threshold}%
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Paper sx={{ ...cardStyle, p: 3 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Account
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Name</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{user?.username || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Email</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{user?.email || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ ...cardStyle, p: 3, flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Classes tracked
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{overall.total_classes || 0}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Present</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: tokens.success }}>{overall.present_count || 0}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Subjects</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{subjects.length}</Typography>
                    </Grid>
                  </Grid>

                  {subjects.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Chip size="small" label={`${safeCount} on track`} sx={{ bgcolor: '#EAF7EF', color: tokens.success, fontWeight: 600 }} />
                        <Chip size="small" label={`${watchCount} to watch`} sx={{ bgcolor: '#FFF6E5', color: tokens.warning, fontWeight: 600 }} />
                        <Chip size="small" label={`${riskCount} at risk`} sx={{ bgcolor: '#FDEAEA', color: tokens.critical, fontWeight: 600 }} />
                      </Stack>
                    </>
                  )}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        <Typography variant="body2" sx={{ color: tokens.inkSoft, textAlign: 'center', mt: 4 }}>
          Synced live from your BunkMaster account.
        </Typography>
      </Box>
    </Box>
  );
};

export default Profile;
