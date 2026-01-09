import React from 'react';
import { Container, Typography, Box, Paper, Avatar, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import helloImage from '../assets/hello.png';
import eventHealthIcon from '../assets/event_health.png';
import eventVetIcon from '../assets/event_vet.png';
import eventMedicineIcon from '../assets/event_medicine.png';
import pawIcon from '../assets/paw.png';

const AboutPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 10 }}>
      {/* Welcome Image */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <img src={helloImage} alt="Welcome to Barkly" style={{ width: '200px', height: 'auto' }} />
      </Box>

      <Typography variant="h3"  gutterBottom textAlign="center" sx={{ fontWeight: 600, fontFamily: '"Baloo 2", Roboto' }}>
        Welcome to Barkly!
      </Typography>
      <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ fontWeight: 500, fontFamily: '"Baloo 2", Roboto' }}>
        Your dog's health companion - track events, visits, and medications all in one place
      </Typography>

      {/* How It Works Section */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          How Barkly Works
        </Typography>

        {/* Setup Section */}
        <Box
          sx={{
            mb: 3,
            cursor: 'pointer',
            p: 1.5,
            borderRadius: 2,
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => navigate('/setup')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <img src={pawIcon} alt="" style={{ width: 28, height: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Setup
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
            Start by adding your dogs, veterinarians, and medicines. You can also create custom event types to track specific behaviors or symptoms.
          </Typography>
        </Box>

        {/* Timeline Section */}
        <Box
          sx={{
            mb: 3,
            cursor: 'pointer',
            p: 1.5,
            borderRadius: 2,
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => navigate('/')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <img src={eventHealthIcon} alt="" style={{ width: 28, height: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Timeline
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
            View all your dog's events in one chronological timeline. Filter by dog to focus on specific pets. Each day groups events by time of day (morning, afternoon, evening, overnight).
          </Typography>
        </Box>

        {/* Health Events */}
        <Card
          sx={{
            mb: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 4 },
          }}
          onClick={() => navigate('/')}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <img src={eventHealthIcon} alt="" style={{ width: 32, height: 32, marginTop: 4 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Health Events
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track daily events like poo quality (1-7 scale), vomiting (with quality type), itchy behavior, injuries, and more. Add notes for any additional details.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Vet Visits */}
        <Card
          sx={{
            mb: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 4 },
          }}
          onClick={() => navigate('/')}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <img src={eventVetIcon} alt="" style={{ width: 32, height: 32, marginTop: 4 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Vet Visits
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Record visits to your veterinarians with dates, times, and notes. Keep track of checkups, treatments, and diagnoses in one place.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Medicine Events */}
        <Card
          sx={{
            mb: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 4 },
          }}
          onClick={() => navigate('/')}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <img src={eventMedicineIcon} alt="" style={{ width: 32, height: 32, marginTop: 4 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Medicine Administration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Log when you give medications with precise dosages (0.25 increments). Never forget if you've given today's dose!
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* User Account Section */}
      {user && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
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
        </Paper>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0 | Built with React, Material-UI, and FastAPI
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutPage;
