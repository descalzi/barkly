import { createTheme } from '@mui/material/styles';

// Dog-friendly color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF8A5B', // Warm orange (playful, energetic)
      light: '#FFB088',
      dark: '#E87744',
      contrastText: '#fff',
    },
    secondary: {
      main: '#5B9FFF', // Sky blue (trust, calm)
      light: '#88B8FF',
      dark: '#4485E8',
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50', // Green for positive health events
      light: '#7BC67E',
      dark: '#388E3C',
    },
    warning: {
      main: '#FFC107', // Amber for attention
      light: '#FFD54F',
      dark: '#FFA000',
    },
    error: {
      main: '#F44336', // Red for negative health events
      light: '#F6685E',
      dark: '#D32F2F',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Mobile-optimized sizes
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // Don't uppercase buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners for friendly feel
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.08)', // Subtle shadow
    '0px 4px 8px rgba(0,0,0,0.1)', // Light shadow
    '0px 6px 12px rgba(0,0,0,0.12)', // Medium shadow
    '0px 8px 16px rgba(0,0,0,0.14)', // Strong shadow
    '0px 10px 20px rgba(0,0,0,0.16)', // Very strong shadow
    '0px 2px 4px rgba(255,138,91,0.2)', // Primary glow (subtle)
    '0px 4px 8px rgba(255,138,91,0.25)', // Primary glow (light)
    '0px 6px 12px rgba(255,138,91,0.3)', // Primary glow (medium)
    '0px 8px 16px rgba(255,138,91,0.35)', // Primary glow (strong)
    '0px 2px 4px rgba(91,159,255,0.2)', // Secondary glow (subtle)
    '0px 4px 8px rgba(91,159,255,0.25)', // Secondary glow (light)
    '0px 6px 12px rgba(91,159,255,0.3)', // Secondary glow (medium)
    '0px 8px 16px rgba(91,159,255,0.35)', // Secondary glow (strong)
    '0px 4px 20px rgba(0,0,0,0.15)', // Elevated
    '0px 6px 24px rgba(0,0,0,0.18)', // Highly elevated
    '0px 8px 28px rgba(0,0,0,0.2)', // Maximum elevation
    '0px 10px 32px rgba(0,0,0,0.22)',
    '0px 12px 36px rgba(0,0,0,0.24)',
    '0px 14px 40px rgba(0,0,0,0.26)',
    '0px 16px 44px rgba(0,0,0,0.28)',
    '0px 18px 48px rgba(0,0,0,0.3)',
    '0px 20px 52px rgba(0,0,0,0.32)',
    '0px 22px 56px rgba(0,0,0,0.34)',
    '0px 24px 60px rgba(0,0,0,0.36)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Pill-shaped buttons
          padding: '10px 24px',
          fontSize: '1rem',
          // Smooth transitions
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 16px rgba(0,0,0,0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.12)',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(255,138,91,0.4)', // Glow on hover
          },
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(91,159,255,0.4)', // Glow on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove MUI default gradient
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 6px 20px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
        primary: {
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(255,138,91,0.4)', // Primary glow
          },
        },
        secondary: {
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(91,159,255,0.4)', // Secondary glow
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 12px 40px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 70, // Larger for mobile touch targets
          boxShadow: '0px -2px 12px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 80,
          padding: '8px 12px 10px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 12px rgba(255,138,91,0.15)',
            },
          },
        },
      },
    },
  },
  // Mobile-first breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
