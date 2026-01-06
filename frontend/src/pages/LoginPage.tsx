import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import logo from '../assets/darcy-logo-200.png';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Failed to get credentials from Google');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.auth.googleAuth(credentialResponse.credential);
      login(response.access_token, response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFB088 0%, #5B9FFF 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: { xs: 3, sm: 5 },
            borderRadius: 4,
            textAlign: 'center',
            boxShadow: '0px 12px 40px rgba(0,0,0,0.15)',
          }}
        >
          {/* Darcy Logo */}
          <Box
            sx={{
              width: 150,
              height: 150,
              margin: '0 auto 24px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0px 8px 24px rgba(255,138,91,0.3)',
              border: '4px solid white',
            }}
          >
            <img
              src={logo}
              alt="Barkly - Darcy the Dog"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FF8A5B, #5B9FFF)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Barkly
          </Typography>

          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Track your dog's health journey
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="pill"
            />
          </Box>

          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Signing in...
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
            Sign in with Google to start tracking your dog's health events
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
