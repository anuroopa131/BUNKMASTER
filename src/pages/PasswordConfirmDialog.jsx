import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Typography, Button, Alert, Stack, Box
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { tokens } from '../styles/theme';
import { authorizedFetch } from '../services/authService';

// Generic "type your password to confirm" dialog. The caller decides what
// actually happens on success (onConfirmed) — this component only handles
// verifying the password against the backend and surfacing errors.
const PasswordConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  userId,
  onCancel,
  onConfirmed,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setPassword('');
    setError('');
    setLoading(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSubmit = async () => {
    if (!password) {
      setError('Enter your password to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authorizedFetch('http://localhost:5000/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }

      reset();
      onConfirmed();
    } catch (err) {
      setError('Could not verify password. Try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="error" icon={<WarningAmber />} sx={{ alignItems: 'flex-start' }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
              This action is permanent and cannot be undone.
            </Typography>
            <Typography variant="body2">{description}</Typography>
          </Alert>

          <Box>
            <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 1 }}>
              Enter your password to confirm.
            </Typography>
            <TextField
              type="password"
              fullWidth
              size="small"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              error={Boolean(error)}
              helperText={error || ' '}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Verifying...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordConfirmDialog;
