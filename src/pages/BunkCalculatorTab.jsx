import React from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Grid, Stack, FormControl,
  Select, MenuItem, Button, Chip, Grow, Fade, Alert,
} from '@mui/material';
import AttendanceRing from './AttendanceRing';
import { tokens } from '../styles/theme';

// Props: analytics, thresholdInput/setThresholdInput, updateThreshold, cardHover
const BunkCalculatorTab = ({ analytics, thresholdInput, setThresholdInput, updateThreshold, cardHover }) => {
  return (
  <Fade in timeout={400} key="calculator">
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
        <Box>
          <Typography variant="h5" gutterBottom>Bunk calculator</Typography>
          <Typography color="text.secondary">
            Based on your {analytics.threshold || 75}% attendance target.
          </Typography>
        </Box>

        <Card sx={{ p: 1.5, bgcolor: tokens.bg, boxShadow: 'none', border: `1px solid ${tokens.border}` }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography sx={{ fontSize: 13, color: tokens.inkSoft, whiteSpace: 'nowrap' }}>
              Attendance target
            </Typography>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
              >
                {[60, 65, 70, 75, 80, 85, 90].map(v => (
                  <MenuItem key={v} value={v}>{v}%</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              disabled={thresholdInput === (analytics.threshold || 75)}
              onClick={() => updateThreshold(thresholdInput)}
            >
              Save
            </Button>
          </Stack>
        </Card>
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {analytics.subjects.map((subject, i) => (
          <Grid item xs={12} md={6} key={subject.subject_name}>
            <Grow in timeout={300 + i * 100}>
              <Card sx={cardHover}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <AttendanceRing
                    percentage={subject.attendance_percentage || 0}
                    status={subject.status || 'safe'}
                    size={92}
                    thickness={9}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>{subject.subject_name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {subject.present_count || 0} / {subject.total_classes || 0} classes attended
                    </Typography>
                    {subject.status === 'new' ? (
                      <Chip
                        label="No classes marked yet"
                        sx={{ bgcolor: tokens.bg, color: tokens.inkSoft, fontWeight: 600, border: `1px dashed ${tokens.border}` }}
                      />
                    ) : subject.status === 'safe' ? (
                      <Chip
                        label={`Safe to bunk ${subject.classes_can_skip} more`}
                        sx={{ bgcolor: tokens.successBg, color: tokens.success, fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label={`Attend ${subject.classes_needed} more to hit ${analytics.threshold}%`}
                        sx={{
                          bgcolor: subject.status === 'critical' ? tokens.criticalBg : tokens.warningBg,
                          color: subject.status === 'critical' ? tokens.critical : tokens.warning,
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
        {analytics.subjects.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">Add a subject first to see bunk calculations.</Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  </Fade>
  );
};

export default BunkCalculatorTab;