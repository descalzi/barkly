import React from 'react';
import { Container, Typography, Box } from '@mui/material';

// TODO: Implement full timeline functionality in Phase 5

const TimelinePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
      <Typography variant="h4" gutterBottom>
        Timeline
      </Typography>
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Timeline view coming in Phase 5
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This is where you'll see all your dog's health events, vet visits, and medicine tracking
        </Typography>
      </Box>
    </Container>
  );
};

export default TimelinePage;
