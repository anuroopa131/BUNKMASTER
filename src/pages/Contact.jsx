import React from 'react';
import { Box, Typography, Paper, Grid, Stack, Divider } from '@mui/material';
import { Email, Phone, LocationOn, AccessTime } from '@mui/icons-material';
import { Player } from '@lottiefiles/react-lottie-player';
import contactAnimation from '../assets/Contactus.json';
import { tokens } from '../styles/theme';

const CONTACT_DETAILS = [
  { icon: <Email />, label: 'Email', value: 'support@bunkmaster.com' },
  { icon: <Phone />, label: 'Phone', value: '+91 89049 76336' },
  { icon: <LocationOn />, label: 'Address', value: 'Koramangala, Bangalore - 560034' },
  { icon: <AccessTime />, label: 'Working hours', value: 'Mon-Fri, 9:00 AM - 6:00 PM' },
];

const Contact = () => {
  return (
    
    

      <Box sx={{ px: { xs: 3, md: 6 }, py: 5, maxWidth: 1000, mx: 'auto' }}>
        <Paper
          sx={{
            borderRadius: 3,
            border: `1px solid ${tokens.border}`,
            boxShadow: 'none',
            p: { xs: 3, md: 4 },
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Player
                src={contactAnimation}
                autoplay
                loop
                style={{ width: '100%', maxWidth: 320, height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <Stack divider={<Divider />} spacing={2.5}>
                {CONTACT_DETAILS.map(({ icon, label, value }) => (
                  <Stack key={label} direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ color: tokens.primary, mt: 0.3 }}>{icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: tokens.inkSoft }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>
  
  );
};

export default Contact;