import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import Aboutus from '../assets/Aboutus.json';
import { tokens } from '../styles/theme';

const AboutUs = () => {
  return (
   

      <Box sx={{ px: { xs: 3, md: 6 }, py: 5, maxWidth: 1100, mx: 'auto' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={5}>
            <Player
              src={Aboutus}
              autoplay
              loop
              style={{ width: '100%', maxWidth: 420, height: 'auto', margin: '0 auto', display: 'block' }}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: `1px solid ${tokens.border}`,
                boxShadow: 'none',
              }}
            >
              <Typography variant="body1" paragraph>
                <strong>BunkMaster</strong> tracks your class attendance against your college's
                cutoff and tells you, day by day, how much room you actually have —
                how many classes you can safely skip, or how many you need in a row
                to climb back above the line.
              </Typography>
              <Typography variant="body1" paragraph>
                Set up your timetable once, mark attendance as you go (or backfill
                from the start of term), and BunkMaster does the running math for
                every subject so you're not guessing at percentages in your head
                before deciding whether to bunk.
              </Typography>
              <Divider sx={{ my: 2.5 }} />
              <Typography
                variant="body1"
                sx={{ fontStyle: 'italic', color: tokens.primary, fontWeight: 500 }}
              >
                "Know your number before you skip the class, not after."
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
  
  );
};

export default AboutUs;