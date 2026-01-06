import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/darcy-logo-200.png';

// TODO: Icon placeholders - suggested prompts for Freepik special-lineal-color:
// - Timeline: "Calendar timeline icon with paw prints, colorful gradient"
// - Setup: "Settings gear icon with dog bone, colorful gradient"
// - About: "Information icon with heart, colorful gradient"

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleNavigation = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ pb: 7 }}>
      {/* Top App Bar */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              component="img"
              src={logo}
              alt="Barkly - Darcy the Dog"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
              }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Barkly
            </Typography>
          </Box>
          {user && (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  src={user.picture}
                  alt={user.name}
                  sx={{ width: 36, height: 36 }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main">
        <Outlet />
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={location.pathname}
        onChange={handleNavigation}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <BottomNavigationAction
          label="Timeline"
          value="/"
          icon={<TimelineIcon />}
        />
        <BottomNavigationAction
          label="Setup"
          value="/setup"
          icon={<SettingsIcon />}
        />
        <BottomNavigationAction
          label="About"
          value="/about"
          icon={<InfoIcon />}
        />
      </BottomNavigation>
    </Box>
  );
};

export default Layout;
