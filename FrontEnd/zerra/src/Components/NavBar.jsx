import { NavLink, useLocation } from 'react-router-dom';
import { auth } from "../firebase.js";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const DRAWER_WIDTH = 240;

const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
    { label: 'Shared', path: '/shared', icon: <PeopleIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    { label: 'Logout', path: '/', icon: <LogoutIcon sx={{ color: 'error.main' }} />, onClick: () => auth.signOut().then(() => localStorage.removeItem("userId")).catch((error) => alert(error.message)) }
];

function NavBar() {
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
        >
            <List>
                {navItems.map(({ label, path, icon }) => (
                    <ListItemButton
                        key={label}
                        component={NavLink}
                        to={path}
                        selected={location.pathname === path}
                        
                        sx={label === 'Logout' ? {
                            color: 'error.main',
                            '&.Mui-selected': {
                                color: 'error.main',
                                backgroundColor: 'transparent',
                            }
                        } : {}
                        }
                    >
                        <ListItemIcon>
                            {icon}
                        </ListItemIcon>
                        <ListItemText primary={label} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
}

export default NavBar