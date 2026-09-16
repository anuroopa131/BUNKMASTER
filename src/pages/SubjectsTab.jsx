import React from 'react';
import {
  Box, Typography, Paper, TextField, Button, Chip,
  CircularProgress, Grow, Fade, IconButton,
} from '@mui/material';
import { Add, Delete as DeleteIcon, MenuBook } from '@mui/icons-material';
import { tokens } from '../styles/theme';

const ACCENT_COLORS = [tokens.primary, tokens.success, tokens.warning, tokens.critical, tokens.primaryDeep, tokens.primaryLight];

// Props: subjects, newSubject, setNewSubject, addSubject, loading, deleteSubject, cardHover
const SubjectsTab = ({
  subjects, newSubject, setNewSubject, addSubject,
  loading, deleteSubject, cardHover,
}) => {
  return (
    <Fade in timeout={400} key="subjects">
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2, bgcolor: '#FAF8FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: tokens.primary, flexShrink: 0,
          }}>
            <MenuBook fontSize="small" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage subjects</Typography>
              {subjects.length > 0 && (
                <Chip
                  label={`${subjects.length} subject${subjects.length > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ bgcolor: tokens.bg, color: tokens.inkSoft, border: `1px solid ${tokens.border}`, fontWeight: 600 }}
                />
              )}
            </Box>
            <Typography sx={{ color: tokens.inkSoft, fontSize: 14, mt: 0.3 }}>
              Add the courses you're taking this semester.
            </Typography>
          </Box>
        </Box>

        {/* Add subject card */}
        <Box
          sx={{
            border: `1px solid ${tokens.border}`, borderRadius: 3, p: 2, mb: 3,
            bgcolor: tokens.bg, display: 'flex', gap: 1.5, flexWrap: 'wrap',
          }}
        >
          <TextField
            label="Subject name"
            placeholder="e.g. Data Structures"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            size="small"
            sx={{ flex: 1, minWidth: 220, bgcolor: '#fff', borderRadius: 1.5 }}
          />
          <Button
            variant="contained"
            onClick={addSubject}
            startIcon={<Add />}
            disabled={!newSubject.trim()}
            sx={{ flexShrink: 0, px: 2.5, fontWeight: 600, textTransform: 'none' }}
          >
            Add subject
          </Button>
        </Box>

        {/* Subject list */}
        {loading.subjects ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress sx={{ color: tokens.primary }} />
          </Box>
        ) : subjects.length === 0 ? (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', py: 6, textAlign: 'center',
          }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%', bgcolor: tokens.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: tokens.inkSoft, mb: 2,
            }}>
              <MenuBook />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: tokens.ink, mb: 0.5 }}>
              No subjects yet
            </Typography>
            <Typography sx={{ color: tokens.inkSoft, fontSize: 14, maxWidth: 320 }}>
              Add your first subject above to start building your timetable and tracking attendance.
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}>
            {subjects.map((subject, i) => {
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <Grow in timeout={250 + i * 60} key={subject.id}>
                  <Box
                    className="subject-card"
                    sx={{
                      position: 'relative',
                      borderRadius: 2,
                      border: `1px solid ${tokens.border}`,
                      borderLeft: `4px solid ${accent}`,
                      bgcolor: '#fff',
                      px: 2, py: 1.75,
                      transition: 'all 180ms ease',
                      '&:hover': {
                        borderColor: tokens.border,
                        boxShadow: '0 6px 16px rgba(22,33,62,0.08)',
                        transform: 'translateY(-1px)',
                      },
                      '&:hover .subject-delete': { opacity: 1 },
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: tokens.ink, pr: 3 }}>
                      {subject.subject_name}
                    </Typography>
                    <IconButton
                      className="subject-delete"
                      size="small"
                      onClick={() => deleteSubject(subject.id)}
                      sx={{
                        position: 'absolute', top: 8, right: 8, opacity: 0,
                        transition: 'opacity 160ms ease', p: 0.5,
                        color: tokens.inkSoft, '&:hover': { color: tokens.critical, bgcolor: 'transparent' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 17 }} />
                    </IconButton>
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

export default SubjectsTab;