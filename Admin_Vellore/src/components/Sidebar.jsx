import { useState } from 'react';
import { Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme, Badge } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsIcon from '@mui/icons-material/Settings';
import { useOrderNotifications } from '../context/OrderNotificationContext';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const theme = useTheme();
  const { newOrdersCount } = useOrderNotifications();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Hero Banners', icon: <ViewCarouselIcon />, path: '/banners' },
    { text: 'Products', icon: <InventoryIcon />, path: '/products' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Combo Offers', icon: <ShoppingBagIcon />, path: '/combo-offers' },
    { text: 'Vendors', icon: <PeopleIcon />, path: '/vendors' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
    { text: 'Exchange Manage', icon: <SwapHorizIcon />, path: '/exchange-manage' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Deals', icon: <ShoppingBasketIcon />, path: '/deals' },
    { text: 'Shipping', icon: <LocalShippingIcon />, path: '/shipping' },
    { text: 'Admin Users', icon: <AdminPanelSettingsIcon />, path: '/admin-users' },
    { text: 'Store Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <div className="sidebar">
      <Drawer
      variant="permanent"
      open={isSidebarOpen}
      sx={{
        width: isSidebarOpen ? 240 : 65,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: isSidebarOpen ? 240 : 65,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', padding: theme.spacing(2) }}>
        {isSidebarOpen && (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '0.04em', fontSize: '1rem', fontWeight: 600 }}>
            Shri Deepaalaya Silks
          </Typography>
        )}
        <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} sx={{ color: 'white' }}>
          {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={
              location.pathname === item.path ||
              (item.path === '/exchange-manage' && location.pathname === '/exchanges')
            }
            sx={{
              minHeight: 48,
              justifyContent: isSidebarOpen ? 'initial' : 'center',
              px: 2.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isSidebarOpen ? 3 : 'auto', color: 'white' }}>
              {item.path === '/orders' && newOrdersCount > 0 ? (
                <Badge badgeContent={newOrdersCount} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>
    </Drawer>
    </div>
  );
};

export default Sidebar; 