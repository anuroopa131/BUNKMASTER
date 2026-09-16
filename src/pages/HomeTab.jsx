import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Grow, Fade, Chip, Button, Stack, CircularProgress } from '@mui/material';
import { WarningAmber, MenuBook, Event, CalendarToday, EmojiEvents, School } from '@mui/icons-material';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { tokens } from '../styles/theme';
import SemesterRecapCard from '../components/SemesterRecapCard';

// Props: analytics, loading, subjects, timetable, todayClasses, safeCount, watchCount,
// riskCount, weekDays, user, cardHover, setActiveTab, latestRecap, semesterHistory, onStartNewSemester, onOpenEndSemesterModal
const HomeTab = ({
  analytics, loading, subjects = [], timetable = [], todayClasses = [], safeCount, watchCount,
  riskCount, weekDays, user, cardHover, setActiveTab, latestRecap, semesterHistory = [],
  onStartNewSemester, onOpenEndSemesterModal,
}) => {
  const [showSemesterHistory, setShowSemesterHistory] = useState(false);
  const recapList = showSemesterHistory ? semesterHistory : latestRecap ? [latestRecap] : [];

  const renderRecaps = () => (
    <>
      {recapList.map((recap) => (
        <SemesterRecapCard
          key={recap.id}
          recap={recap}
          onStartNewSemester={onStartNewSemester || (() => setActiveTab(1))}
          cardHover={cardHover}
        />
      ))}
      {semesterHistory.length > 1 && (
        <Button
          size="small"
          onClick={() => setShowSemesterHistory(value => !value)}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          {showSemesterHistory ? 'Show latest semester' : 'View all past semesters'}
        </Button>
      )}
    </>
  );

  const isSetupIncomplete = !loading.subjects && !loading.timetable && (subjects.length === 0 || timetable.length === 0);

  if (isSetupIncomplete) {
    return (
      <Fade in timeout={400} key="home-empty">
        <Box>
          {/* If there is a previous semester recap, showcase it prominently */}
          {latestRecap && (
            <Grow in timeout={400}>
              <Box>
                {renderRecaps()}
              </Box>
            </Grow>
          )}

          <Grow in timeout={500}>
            <Card
              sx={{
                p: { xs: 3, md: 4.5 },
                borderRadius: 3,
                border: `1px solid ${tokens.border}`,
                bgcolor: tokens.surface,
                mb: 3,
                boxShadow: '0 8px 32px rgba(22, 33, 62, 0.06)',
              }}
            >
              <Box sx={{ maxWidth: 720, mb: 3.5 }}>
                <Chip
                  label="Getting Started"
                  size="small"
                  sx={{
                    bgcolor: '#FAF8FF',
                    color: tokens.primary,
                    fontWeight: 700,
                    fontSize: 12,
                    border: `1px solid ${tokens.border}`,
                    mb: 1.5,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: 26, md: 32 },
                    color: tokens.ink,
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {latestRecap ? 'Welcome to your new semester! 🎓' : `Let's get you set up, ${user?.username || 'there'}! 🚀`}
                </Typography>
                <Typography sx={{ color: tokens.inkSoft, fontSize: 15, lineHeight: 1.6 }}>
                  Follow these simple steps to configure your subjects and timetable.
                  Once added, your attendance stats, bunk limits, and safe-zone calculations will appear automatically.
                </Typography>
              </Box>

              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {/* Step 1: Subjects */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: `1.5px solid ${subjects.length > 0 ? tokens.success : tokens.border}`,
                      bgcolor: subjects.length > 0 ? '#FAFDFB' : tokens.bg,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fff', display: 'flex', color: tokens.ink }}>
                          <MenuBook fontSize="small" />
                        </Box>
                        <Chip
                          size="small"
                          label={subjects.length > 0 ? `${subjects.length} added` : 'Step 1'}
                          sx={{
                            bgcolor: subjects.length > 0 ? '#EAF7EF' : '#fff',
                            color: subjects.length > 0 ? tokens.success : tokens.inkSoft,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 16, color: tokens.ink, mb: 0.5 }}>
                        1. Add Subjects
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mb: 2, lineHeight: 1.4 }}>
                        Add all the course subjects or labs you are taking this semester.
                      </Typography>
                    </Box>
                    <Button
                      variant={subjects.length === 0 ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setActiveTab(1)}
                      sx={{
                        bgcolor: subjects.length === 0 ? tokens.ink : 'transparent',
                        color: subjects.length === 0 ? '#fff' : tokens.ink,
                        borderColor: tokens.border,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      {subjects.length > 0 ? 'Edit Subjects' : 'Add Subjects'}
                    </Button>
                  </Box>
                </Grid>

                {/* Step 2: Timetable */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: `1.5px solid ${timetable.length > 0 ? tokens.success : tokens.border}`,
                      bgcolor: timetable.length > 0 ? '#FAFDFB' : tokens.bg,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fff', display: 'flex', color: tokens.ink }}>
                          <Event fontSize="small" />
                        </Box>
                        <Chip
                          size="small"
                          label={timetable.length > 0 ? `${timetable.length} classes` : 'Step 2'}
                          sx={{
                            bgcolor: timetable.length > 0 ? '#EAF7EF' : '#fff',
                            color: timetable.length > 0 ? tokens.success : tokens.inkSoft,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 16, color: tokens.ink, mb: 0.5 }}>
                        2. Setup Timetable
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mb: 2, lineHeight: 1.4 }}>
                        Schedule your classes by day of week and time slot.
                      </Typography>
                    </Box>
                    <Button
                      variant={subjects.length > 0 && timetable.length === 0 ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setActiveTab(2)}
                      sx={{
                        bgcolor: subjects.length > 0 && timetable.length === 0 ? tokens.ink : 'transparent',
                        color: subjects.length > 0 && timetable.length === 0 ? '#fff' : tokens.ink,
                        borderColor: tokens.border,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      {timetable.length > 0 ? 'Edit Timetable' : 'Create Timetable'}
                    </Button>
                  </Box>
                </Grid>

                {/* Step 3: Track & Bunk */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: `1.5px solid ${tokens.border}`,
                      bgcolor: tokens.bg,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fff', display: 'flex', color: tokens.ink }}>
                          <CalendarToday fontSize="small" />
                        </Box>
                        <Chip
                          size="small"
                          label="Step 3"
                          sx={{ bgcolor: '#fff', color: tokens.inkSoft, fontWeight: 700, fontSize: 11 }}
                        />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 16, color: tokens.ink, mb: 0.5 }}>
                        3. Start Tracking
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mb: 2, lineHeight: 1.4 }}>
                        Log daily attendance, backfill past dates, and know exactly how many classes you can safely bunk.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={subjects.length === 0 || timetable.length === 0}
                      onClick={() => setActiveTab(3)}
                      sx={{
                        borderColor: tokens.border,
                        color: tokens.ink,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Go to Today's Classes
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Main Quick Action */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: tokens.bg,
                  border: `1px solid ${tokens.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, color: tokens.ink, fontSize: 15 }}>
                    {subjects.length === 0
                      ? 'Ready to get started? Add your subjects first.'
                      : 'Subjects added! Now let’s add your timetable schedule.'}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
                    It takes less than 2 minutes to set up your full academic schedule.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab(subjects.length === 0 ? 1 : 2)}
                  sx={{
                    bgcolor: tokens.ink,
                    color: '#fff',
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: tokens.primaryDeep },
                  }}
                >
                  {subjects.length === 0 ? 'Start with Subjects →' : 'Set Up Timetable →'}
                </Button>
              </Box>
            </Card>
          </Grow>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in timeout={400} key="home">
      <Box>
        {/* If user has past semester recap archived, show it optionally or at top */}
        {latestRecap && renderRecaps()}

        {analytics.warnings && analytics.warnings.length > 0 && (
          <Grow in timeout={350}>
            <Card sx={{ bgcolor: tokens.warningBg, border: `1px solid ${tokens.warning}`, mb: 2.5 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningAmber sx={{ color: tokens.warning }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: tokens.ink }}>
                    {analytics.warnings.length} subject{analytics.warnings.length > 1 ? 's' : ''} need attention
                  </Typography>
                  <Typography sx={{ color: tokens.inkSoft, fontSize: 14 }}>
                    {analytics.warnings.map(w => w.subject_name).join(', ')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        )}

        {/* Section 1 — hero */}
        <Grow in timeout={500}>
          <Box
            sx={{
              display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
              border: `1px solid ${tokens.border}`, borderRadius: 3, overflow: 'hidden', mb: 3,
            }}
          >
            <Box sx={{ bgcolor: tokens.surface, p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
                  Welcome back, {user?.username || 'there'} · <b>{analytics.semester_name || 'Active Semester'}</b>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2 }}>
                {loading.analytics ? (
                  <CircularProgress size={32} sx={{ color: tokens.primary }} />
                ) : (
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 44, color: tokens.ink, lineHeight: 1 }}>
                    {analytics.overall.attendance_percentage || 0}%
                  </Typography>
                )}
                <Typography sx={{ fontSize: 13, color: tokens.success }}>
                  {analytics.overall.present_count || 0} of {analytics.overall.total_classes || 0} classes attended
                </Typography>
              </Box>
              <Grid container spacing={1.25}>
                <Grid item xs={4}>
                  <Box sx={{ bgcolor: tokens.bg, borderRadius: 2, p: 1.25 }}>
                    <Typography sx={{ fontSize: 11, color: tokens.inkSoft }}>Classes</Typography>
                    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 20, color: tokens.ink }}>
                      {analytics.overall.total_classes || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ bgcolor: tokens.bg, borderRadius: 2, p: 1.25 }}>
                    <Typography sx={{ fontSize: 11, color: tokens.inkSoft }}>Subjects</Typography>
                    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 20, color: tokens.ink }}>
                      {subjects.length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ bgcolor: tokens.criticalBg, borderRadius: 2, p: 1.25 }}>
                    <Typography sx={{ fontSize: 11, color: tokens.critical }}>Can bunk</Typography>
                    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 20, color: tokens.critical }}>
                      {analytics.overall.classes_can_skip ?? 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ bgcolor: tokens.surface, p: { xs: 3, md: 3.5 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 16, fontWeight: 700 }}>Quick actions</Typography>
              <Stack spacing={1.25}>
                <Button fullWidth variant="contained" startIcon={<MenuBook />} onClick={() => setActiveTab(1)} sx={{ bgcolor: tokens.ink, textTransform: 'none' }}>
                  Manage subjects
                </Button>
                <Button fullWidth variant="contained" startIcon={<Event />} onClick={() => setActiveTab(2)}  sx={{ bgcolor: tokens.ink, textTransform: 'none' }}>
                  Edit timetable
                </Button>
                <Button fullWidth variant="contained" startIcon={<CalendarToday />} onClick={() => setActiveTab(3)} sx={{ bgcolor: tokens.ink, textTransform: 'none' }}>
                  Mark today's classes
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmojiEvents sx={{ color: tokens.warning }} />}
                  onClick={onOpenEndSemesterModal}
                  sx={{
                    borderColor: tokens.warning,
                    color: tokens.ink,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: tokens.warningBg,
                    '&:hover': { bgcolor: '#FDE6B0', borderColor: tokens.warning }
                  }}
                >
                  End & Archive Semester
                </Button>
              </Stack>
            </Box>
          </Box>
        </Grow>

        {/* Section 2 — traffic-light status + bunk budget */}
        <Grow in timeout={700}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={1.25} sx={{ mb: 1.25 }}>
              {[
                { label: 'Safe', count: safeCount, bg: tokens.successBg, fg: tokens.success },
                { label: 'Watch', count: watchCount, bg: tokens.warningBg, fg: tokens.warning },
                { label: 'At risk', count: riskCount, bg: tokens.surface, fg: tokens.ink },
              ].map(b => (
                <Grid item xs={4} key={b.label}>
                  <Box sx={{ bgcolor: b.bg, borderRadius: 3, p: 2, border: b.label === 'At risk' ? `1px solid ${tokens.border}` : 'none' }}>
                    <Typography sx={{ fontSize: 12, color: b.fg, mb: 0.5 }}>{b.label}</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 20, color: b.fg }}>
                      {b.count} subject{b.count !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ bgcolor: tokens.bg, border: `1px solid ${tokens.border}`, borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mb: 0.25 }}>
                  {analytics.overall.status === 'safe' ? 'You can miss' : 'You need to attend'}
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: tokens.ink }}>
                  {analytics.overall.status === 'safe'
                    ? `${analytics.overall.classes_can_skip || 0} more classes`
                    : `${analytics.overall.classes_needed || 0} more classes`}
                  <Typography component="span" sx={{ fontSize: 14, fontWeight: 400, color: tokens.inkSoft, ml: 1 }}>
                    {analytics.overall.status === 'safe' ? `before dropping below ${analytics.threshold}%` : `to reach ${analytics.threshold}%`}
                  </Typography>
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => setActiveTab(4)} sx={{ bgcolor: tokens.ink, textTransform: 'none' }}>Open calculator</Button>
            </Box>
          </Box>
        </Grow>

        {/* Section 3 — today + this week */}
        <Grow in timeout={900}>
          <Grid container spacing={1.25} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 3, p: 2.5, height: '100%' }}>
                <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mb: 1.25 }}>
                  Today, {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Typography>
                {todayClasses.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>No classes scheduled today.</Typography>
                ) : (
                  <Stack spacing={0}>
                    {todayClasses.map((cls, i) => (
                      <Box
                        key={cls.timetable_id}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          py: 1, borderBottom: i < todayClasses.length - 1 ? `1px solid ${tokens.border}` : 'none',
                        }}
                      >
                        <Typography sx={{ fontSize: 14, color: tokens.ink }}>
                          {cls.start_time} · {cls.subject_name}
                        </Typography>
                        <Chip
                          size="small"
                          label={cls.status ? cls.status : 'unmarked'}
                          sx={{
                            bgcolor: cls.status === 'present' ? tokens.successBg : cls.status === 'absent' ? tokens.criticalBg : tokens.bg,
                            color: cls.status === 'present' ? tokens.success : cls.status === 'absent' ? tokens.critical : tokens.inkSoft,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 3, p: 2.5, height: '100%' }}>
                <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mb: 1.25 }}>This week</Typography>
                {weekDays.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {weekDays.map((d) => {
                      const pct = d.total_classes > 0 ? d.present_count / d.total_classes : null;
                      const color = pct === null ? tokens.border : pct === 1 ? tokens.success : pct === 0 ? tokens.critical : tokens.warning;
                      return (
                        <Box key={d.date} sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography sx={{ fontSize: 11, color: tokens.inkSoft, mb: 0.5 }}>
                            {(d.day_name || '').slice(0, 1)}
                          </Typography>
                          <Box sx={{ width: '100%', aspectRatio: '1', borderRadius: 1.5, bgcolor: color }} />
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>No classes tracked yet.</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Grow>
      </Box>
    </Fade>
  );
};

export default HomeTab;