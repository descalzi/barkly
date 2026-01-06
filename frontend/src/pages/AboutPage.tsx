import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AboutPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 10 }}>
      <Typography variant="h4" gutterBottom>
        About Barkly
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          🐾 Your Dog's Health Companion
        </Typography>
        <Typography variant="body1" paragraph>
          Barkly helps you track and monitor your dog's health events, vet visits, and medicine
          schedules all in one place.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Features
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Track daily health events (poo quality, vomiting, nausea, etc.)</li>
            <li>Record vet visits and link them to specific vets</li>
            <li>Manage medicine schedules and dosages</li>
            <li>View timeline of all events in calendar or list format</li>
            <li>Mobile-first design for tracking on the go</li>
          </ul>
        </Typography>

        {user && (
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Your Account
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {user.name}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {user.email}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Version 1.0.0 | Built with React, Material-UI, and FastAPI
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
