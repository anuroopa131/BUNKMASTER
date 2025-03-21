import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from '@mui/icons-material/BarChart';

const drawerWidth = 240;

const Sidebar = ({ activeFeature, setActiveFeature }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px', // Adjust this value to match the header height
          height: 'calc(100vh - 64px)', // Adjust height to fit below the header
        },
      }}
    >
      <List>
        {[
          { text: 'User Management', icon: <PeopleIcon />, value: 'users' },
          { text: 'Attendance Management', icon: <CalendarTodayIcon />, value: 'attendance' },
          { text: 'Analytics', icon: <BarChartIcon />, value: 'analytics' },
        ].map((item) => (
          <ListItem
            button
            key={item.value}
            selected={activeFeature === item.value}
            onClick={() => setActiveFeature(item.value)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;