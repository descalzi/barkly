import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import logo from '../assets/darcy-logo-200.png';
import calendarIcon from '../assets/calendar-nav.png';
import configIcon from '../assets/config-nav.png';
import accountIcon from '../assets/account-nav.png';

interface NavigationIconProps {
  src: string;
  alt: string;
  isActive: boolean;
}

const NavigationIcon: React.FC<NavigationIconProps> = ({ src, alt, isActive }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: "75%",
      height: "100%",
      borderRadius: 5,
      bgcolor: isActive ? 'rgba(255, 138, 91, 0.15)' : 'transparent',
      transition: 'background-color 0.3s',
    }}
  >
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: 32,
        height: 32,
        opacity: isActive ? 1 : 0.5,
        transition: 'opacity 0.3s',
      }}
    />
  </Box>
);

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
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
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 64,
          // '& .Mui-selected': {
          //   paddingTop: 0,
          // },
          '& .MuiBottomNavigationAction-label': {
            display: 'none',
          },
        }}
      >
        <BottomNavigationAction
          label="Timeline"
          value="/"
          icon={<NavigationIcon src={calendarIcon} alt="Timeline" isActive={location.pathname === '/'} />}
          sx={{ minWidth: 0 }}
        />
        <BottomNavigationAction
          label="Setup"
          value="/setup"
          icon={<NavigationIcon src={configIcon} alt="Setup" isActive={location.pathname === '/setup'} />}
          sx={{ minWidth: 0 }}
        />
        <BottomNavigationAction
          label="About"
          value="/about"
          icon={<NavigationIcon src={accountIcon} alt="About" isActive={location.pathname === '/about'} />}
          sx={{ minWidth: 0 }}
        />
      </BottomNavigation>
    </Box>
  );
};

export default Layout;
