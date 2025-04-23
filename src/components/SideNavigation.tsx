import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Define the app color
const appColor = '#18859A';

interface SideNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ currentPage, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const toggleDrawer = (isOpen: boolean) => (event: any) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(isOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
    { text: 'Transactions', icon: <SwapHorizIcon />, value: 'transactions' },
    { text: 'Non-Wallet Transfers', icon: <SwapHorizIcon />, value: 'non-wallet-transfers' },
    { text: 'Reports', icon: <AssessmentIcon />, value: 'reports' },
    { text: 'Profile', icon: <PersonIcon />, value: 'profile' },
    { text: 'Settings', icon: <SettingsIcon />, value: 'settings' }
  ];

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/logo.png" 
          alt="Lul Admin Panel" 
          style={{ height: 40, width: 'auto' }} 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => onNavigate(item.value)}
            selected={currentPage === item.value}
            sx={{
              '&.Mui-selected': {
                backgroundColor: `${appColor}20`,
                '&:hover': {
                  backgroundColor: `${appColor}30`,
                },
              },
              '&:hover': {
                backgroundColor: `${appColor}10`,
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: currentPage === item.value ? appColor : 'inherit' 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: currentPage === item.value ? 'bold' : 'normal',
                color: currentPage === item.value ? appColor : 'inherit'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <IconButton
        color="primary"
        aria-label="open drawer"
        edge="start"
        onClick={toggleDrawer(true)}
        sx={{ 
          position: 'fixed', 
          top: 16, 
          left: 16, 
          zIndex: 1100,
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: 'white',
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default SideNavigation; 