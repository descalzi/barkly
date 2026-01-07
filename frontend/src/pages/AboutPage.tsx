import React from 'react';
import { Container, Typography, Box, Paper, Avatar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const AboutPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2 }}>
              <Avatar
                src={user.picture}
                alt={user.name}
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  boxShadow: 3,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ mt: 3 }}
              fullWidth
            >
              Logout
            </Button>
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
