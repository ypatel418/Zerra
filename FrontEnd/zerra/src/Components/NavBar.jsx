import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from "../firebase.js";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const NavBar = ({ handleUpload = () => {} }) => {
    const location = useLocation();
    const [storageUsageBytes, setStorageUsageBytes] = useState(0);
    const [uploadError, setUploadError] = useState("");

    const DRAWER_WIDTH = 240;
    const MAX_STORAGE_BYTES = 100 * 1024 * 1024;

    const navItems = [
        { label: 'Upload File', path: null, icon: <CloudUploadIcon />, isUpload: true},
        { label: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
        { label: 'Shared', path: '/shared', icon: <PeopleIcon /> },
        { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
        { label: 'Logout', path: '/', icon: <LogoutIcon sx={{ color: 'error.main' }} />, onClick: () => auth.signOut().then(() => localStorage.removeItem("userId")).catch((error) => alert(error.message)) }
    ];

    const handleCloseUploadError = (_, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setUploadError("");
    };

    async function uploadFile(file) {
        const remainingBytes = Math.max(MAX_STORAGE_BYTES - storageUsageBytes, 0);
        if (file.size > remainingBytes) {
            setUploadError("Upload failed: This file exceeds your remaining storage.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/files/upload/${localStorage.getItem("userId")}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });
        handleUpload(response.data);
        const latestUsage = await getUserStorageUsage();
        if (latestUsage !== null) {
            setStorageUsageBytes(latestUsage);
        }
        } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = typeof error.response?.data === 'string' ? error.response.data : '';

            if (status === 409 || status === 413 || message.toLowerCase().includes('size')) {
                setUploadError("Upload failed: you exceeded your 100 MB storage limit.");
                return;
            }
        }
        setUploadError("Upload failed. Please try again.");
        console.error('Error uploading file:', error);
        }
    };

    const getUserStorageUsage = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${localStorage.getItem("userId")}/storage`);
            return Number(response.data) || 0;
        } catch (error) {
            console.error('Error fetching storage usage:', error);
            return null;
        }
    }

    useEffect(() => {
        const loadStorageUsage = async () => {
            const usage = await getUserStorageUsage();
            if (usage !== null) {
                setStorageUsageBytes(usage);
            }
        };

        loadStorageUsage();
    }, []);

    const usedBytes = Math.min(storageUsageBytes, MAX_STORAGE_BYTES);
    const usedMegabytes = usedBytes / (1024 * 1024);
    const remainingMegabytes = Math.max((MAX_STORAGE_BYTES - usedBytes) / (1024 * 1024), 0);
    const usedPercent = Math.min((usedBytes / MAX_STORAGE_BYTES) * 100, 100);

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                },
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
                                    onChange={(e) => {
                                        const file = e.target.files && e.target.files[0];
                                        if (!file) {
                                            e.target.value = "";
                                            return;
                                        }
                                        uploadFile(file);
                                    }}
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

            <Box sx={{ px: 2, pb: 2, mt: 'auto' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    {`${usedMegabytes.toFixed(2)} MB / 100 MB used`}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={usedPercent}
                    sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: '#E9EEF5',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            backgroundColor: 'rgb(28, 139, 158)',
                        },
                    }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
                    {`${usedPercent.toFixed(1)}% used - ${remainingMegabytes.toFixed(2)} MB left`}
                </Typography>
            </Box>

            <Snackbar
                open={Boolean(uploadError)}
                autoHideDuration={5000}
                onClose={handleCloseUploadError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseUploadError}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {uploadError}
                </Alert>
            </Snackbar>
        </Drawer>
    );
}

export default NavBar