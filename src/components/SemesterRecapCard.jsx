import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Stack, Divider } from '@mui/material';
import { EmojiEvents, Favorite, FlashOn, AutoAwesome, AddCircleOutline, School, DoneAll } from '@mui/icons-material';
import { tokens } from '../styles/theme';

const SemesterRecapCard = ({ recap, onStartNewSemester, cardHover }) => {
  if (!recap || !recap.summary) return null;

  const { summary, semester_name, start_date, end_date } = recap;
  const {
    overall_percentage = 0,
    present_count = 0,
    bunked_count = 0,
    total_classes = 0,
    longest_streak = 0,
    favorite_subject: favoriteSubject,
    nemesis_subject: nemesisSubject,
    achievements = []
  } = summary;

  return (
    <Card
      sx={{
        ...cardHover,
        mb: 4,
        borderRadius: 3.5,
        overflow: 'hidden',
        border: `1.5px solid ${tokens.border}`,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F7FB 100%)',
        boxShadow: '0 10px 30px rgba(22, 33, 62, 0.08)',
        position: 'relative'
      }}
    >
      {/* Top Banner Stripe */}
      <Box
        sx={{
          background: 'linear-gradient(90deg, #16213E 0%, #2B3A67 50%, #F5B301 100%)',
          py: 1.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents sx={{ color: '#F5B301', fontSize: 24 }} />
          <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 16, letterSpacing: '0.3px' }}>
            {semester_name || 'Previous Semester'} — Recap & Achievements
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>
          {start_date} &rarr; {end_date}
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        {/* Top Summary Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Overall Percentage */}
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#FFFFFF',
                border: `1.5px solid ${overall_percentage >= 75 ? tokens.success : tokens.critical}`,
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <Typography sx={{ fontSize: 12, color: tokens.inkSoft, fontWeight: 600, textTransform: 'uppercase' }}>
                Final Attendance
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 24, md: 30 },
                  fontWeight: 800,
                  color: overall_percentage >= 75 ? tokens.success : tokens.critical,
                  mt: 0.5
                }}
              >
                {overall_percentage}%
              </Typography>
              <Chip
                label={overall_percentage >= 75 ? 'Goal Achieved 🎯' : 'Below Target ⚠️'}
                size="small"
                sx={{
                  mt: 1,
                  height: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: overall_percentage >= 75 ? tokens.successBg : tokens.criticalBg,
                  color: overall_percentage >= 75 ? tokens.success : tokens.critical
                }}
              />
            </Box>
          </Grid>

          {/* Classes Attended */}
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#FFFFFF',
                border: `1px solid ${tokens.border}`,
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <Typography sx={{ fontSize: 12, color: tokens.inkSoft, fontWeight: 600, textTransform: 'uppercase' }}>
                Attended
              </Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: tokens.ink, mt: 0.5 }}>
                {present_count}
                <Typography component="span" sx={{ fontSize: 14, color: tokens.inkSoft, fontWeight: 500 }}>
                  /{total_classes}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 11, color: tokens.inkSoft, mt: 1 }}>Total periods sat</Typography>
            </Box>
          </Grid>

          {/* Total Bunks */}
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#FFFFFF',
                border: `1px solid ${tokens.border}`,
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <Typography sx={{ fontSize: 12, color: tokens.inkSoft, fontWeight: 600, textTransform: 'uppercase' }}>
                Bunks Taken
              </Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: tokens.warning, mt: 0.5 }}>
                {bunked_count}
              </Typography>
              <Typography sx={{ fontSize: 11, color: tokens.inkSoft, mt: 1 }}>Classes skipped</Typography>
            </Box>
          </Grid>

          {/* Best Streak */}
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#FFFFFF',
                border: `1px solid ${tokens.border}`,
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <Typography sx={{ fontSize: 12, color: tokens.inkSoft, fontWeight: 600, textTransform: 'uppercase' }}>
                Iron Streak
              </Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: '#F59E0B', mt: 0.5 }}>
                {longest_streak} <span style={{ fontSize: 14 }}>days</span>
              </Typography>
              <Typography sx={{ fontSize: 11, color: tokens.inkSoft, mt: 1 }}>Consecutive 100% days</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Favorite vs Nemesis Subject Showcase */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Favorite Subject */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1.5px solid #1F9E82',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #EAF7EF 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Favorite sx={{ color: '#E8574A', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: tokens.ink }}>
                  Favourite Subject (Most Loved)
                </Typography>
              </Box>
              {favoriteSubject ? (
                <>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: tokens.ink }}>
                    {favoriteSubject.subject_name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mt: 0.5 }}>
                    Attended <b>{favoriteSubject.present_count}</b> of {favoriteSubject.total_classes} classes (
                    <span style={{ color: tokens.success, fontWeight: 700 }}>{favoriteSubject.pct}%</span>)
                  </Typography>
                </>
              ) : (
                <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>No classes recorded.</Typography>
              )}
            </Box>
          </Grid>

          {/* Nemesis Subject */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E8574A',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FDEAEA 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FlashOn sx={{ color: '#F59E0B', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: tokens.ink }}>
                  Nemesis Subject (Most Skipped)
                </Typography>
              </Box>
              {nemesisSubject ? (
                <>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: tokens.ink }}>
                    {nemesisSubject.subject_name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mt: 0.5 }}>
                    Skipped <b>{nemesisSubject.skipped_count}</b> classes (
                    <span style={{ color: tokens.critical, fontWeight: 700 }}>{nemesisSubject.pct}%</span> attendance)
                  </Typography>
                </>
              ) : (
                <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>No skipped classes recorded.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Badges & Achievements Carousel / Grid */}
        {achievements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: tokens.ink, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AutoAwesome sx={{ color: tokens.gold, fontSize: 18 }} />
              Earned Badges & Persona
            </Typography>
            <Grid container spacing={1.5}>
              {achievements.map((ach) => (
                <Grid item xs={12} sm={6} md={4} key={ach.id || ach.title}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: '#FFFFFF',
                      border: `1px solid ${tokens.border}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.25,
                      height: '100%'
                    }}
                  >
                    <Typography sx={{ fontSize: 24, lineHeight: 1 }}>{ach.emoji}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: tokens.ink }}>
                          {ach.title}
                        </Typography>
                        {ach.badge && (
                          <Chip
                            label={ach.badge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 9,
                              fontWeight: 700,
                              bgcolor: ach.color || tokens.primary,
                              color: '#fff'
                            }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 11, color: tokens.inkSoft, mt: 0.3 }}>
                        {ach.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 2.5 }} />

        {/* New Semester Call To Action */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            borderRadius: 2.5,
            bgcolor: 'rgba(22, 33, 62, 0.03)',
            border: `1px dashed ${tokens.border}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <School sx={{ color: tokens.primary, fontSize: 28 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: tokens.ink }}>
                Ready for a fresh start?
              </Typography>
              <Typography sx={{ fontSize: 12, color: tokens.inkSoft }}>
                Set up your new semester subjects, schedule, and attendance goal.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={onStartNewSemester}
            sx={{
              background: tokens.gradient,
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(22,33,62,0.25)',
              '&:hover': { opacity: 0.95 }
            }}
          >
            Start New Semester ✨
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SemesterRecapCard;
