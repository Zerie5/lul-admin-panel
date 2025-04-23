import { createTheme } from '@mui/material/styles';

// Define the brand colors - convert from hex format 0xFF18859A
const primaryColor = '#18859A';  // Teal/blue
const complementaryColor = '#FFE24B';  // Yellow/gold
const primaryColorDark = '#106d7f';  // Darker version of primary
const primaryColorLight = '#4ba8ba';  // Lighter version of primary
const complementaryDark = '#e5c835';  // Darker version of complementary
const complementaryLight = '#fff49e';  // Lighter version of complementary

const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: primaryColorLight,
      dark: primaryColorDark,
      contrastText: '#fff',
    },
    secondary: {
      main: complementaryColor,
      light: complementaryLight,
      dark: complementaryDark,
      contrastText: '#000', // Dark text on yellow background for better readability
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#fff',
    },
    info: {
      main: primaryColor, // Using primary color for info as well
      light: primaryColorLight,
      dark: primaryColorDark,
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    background: {
      default: '#f9fafb', // Light gray background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          backgroundColor: primaryColor,
          '&:hover': {
            backgroundColor: primaryColorDark,
          },
        },
        // Add a style for accent buttons using complementary color
        outlinedSecondary: {
          color: complementaryDark,
          borderColor: complementaryColor,
          '&:hover': {
            backgroundColor: `${complementaryLight}22`, // Using alpha for hover state
            borderColor: complementaryDark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)`,
          borderBottom: `1px solid ${primaryColor}15`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.MuiIconButton-colorPrimary': {
            color: primaryColor,
          },
          '&.MuiIconButton-colorSecondary': {
            color: complementaryDark,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: primaryColor,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: primaryColor,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: `${primaryColor}15`,
          color: primaryColorDark,
          borderColor: `${primaryColor}30`,
        },
        colorSecondary: {
          backgroundColor: `${complementaryColor}20`,
          color: '#000',
          borderColor: `${complementaryColor}40`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme; 