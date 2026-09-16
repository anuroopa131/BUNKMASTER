import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { EmojiEvents, WarningAmber } from '@mui/icons-material';
import { tokens } from '../styles/theme';

const EndSemesterModal = ({ open, onClose, onEndSemester, semesterName, defaultEndDate }) => {
  const [endDate, setEndDate] = useState(defaultEndDate || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onEndSemester(endDate);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to end semester');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1,
          border: `1.5px solid ${tokens.border}`,
          boxShadow: '0 20px 50px rgba(22, 33, 62, 0.2)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: tokens.warningBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.warning
          }}
        >
          <EmojiEvents sx={{ fontSize: 26 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: tokens.ink }}>
            End Current Semester
          </Typography>
          <Typography sx={{ fontSize: 12, color: tokens.inkSoft }}>
            Archive stats, generate achievements, and start fresh
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Typography sx={{ fontSize: 14, color: tokens.inkSoft, mb: 2.5, lineHeight: 1.6 }}>
          Ending <b>{semesterName || 'this semester'}</b> will compute your final performance report, award your
          attendance achievements (e.g. Favorite Subject, Nemesis Subject, and Iron Streaks), and safely archive it to
          your history.
        </Typography>

        <Alert
          icon={<WarningAmber fontSize="inherit" />}
          severity="info"
          sx={{ mb: 3, borderRadius: 2, bgcolor: '#F0F4FA', color: tokens.ink }}
        >
          Your active timetable and attendance logs will be cleared to provide a clean slate for your new semester. You
          can always view past sem performance in your Recap Card.
        </Alert>

        <TextField
          label="Semester End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: new Date().toISOString().split('T')[0] }}
          size="small"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: tokens.inkSoft, fontWeight: 600, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #E8574A 0%, #C94034 100%)',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            px: 2.5,
            boxShadow: '0 4px 14px rgba(232, 87, 74, 0.3)',
            '&:hover': { opacity: 0.95 }
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm & End Semester'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EndSemesterModal;
