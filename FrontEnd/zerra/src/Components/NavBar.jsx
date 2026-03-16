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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const NavBar = ({handleUpload}) => {
    const location = useLocation();

    const DRAWER_WIDTH = 240;


    const navItems = [
        { label: 'Upload File', path: null, icon: <CloudUploadIcon />, isUpload: true},
        { label: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
        { label: 'Shared', path: '/shared', icon: <PeopleIcon /> },
        { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
        { label: 'Logout', path: '/', icon: <LogoutIcon sx={{ color: 'error.main' }} />, onClick: () => auth.signOut().then(() => localStorage.removeItem("userId")).catch((error) => alert(error.message)) }
    ];

    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/files/upload/${localStorage.getItem("userId")}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });
        handleUpload(response.data);
        } catch (error) {
        console.error('Error uploading file:', error);
        }
    };

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
                {navItems.map(({ label, path, icon, onClick, isUpload }) => {
                    if (isUpload) {
                        return (
                            <ListItemButton key={label} component="label" sx={{
                                border: '1px solid rgb(28, 139, 158)',
                                borderRadius: '8px',
                                color: 'black',
                                
                                margin: '10px',
                                
                            }}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={label} />
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) =>{
                                        try{
                                            uploadFile(e.target.files[0]);
                                        }catch(e) {
                                            
                                        }
                                    } }
                                />
                            </ListItemButton>
                    )} else {
                        return ( 
                            <ListItemButton
                                key={label}
                                component={NavLink}
                                to={path}
                                selected={location.pathname === path}
                                onClick={onClick}
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
                    )}})}
            </List>
        </Drawer>
    );
}

export default NavBar