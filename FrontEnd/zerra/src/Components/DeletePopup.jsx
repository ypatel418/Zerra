import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const DeletePopup = ({fileID, onDelete}) => {
    const [open, setOpen] = useState(false);


    async function deleteFile() {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/files/delete/${fileID}`);
            onDelete(fileID);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };


    return(
        <>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setOpen(true)}>Delete</Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Delete File?</DialogTitle>

            <DialogContent>
                <Typography variant="h5">Are you sure you want to delete this file?</Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', gap: 4 }}>
                <Button variant="outlined" size= "large" sx={{
                    color: 'rgb(28, 139, 158)', 
                    borderColor: 'rgb(28, 139, 158)'}} onClick={() => setOpen(false)}>
                        Cancel
                </Button>

                <Button variant="outlined" color="error" size= "large" startIcon={<DeleteIcon />} onClick={() => {
                    deleteFile();
                    setOpen(false);
                    }}>
                        Delete
                </Button>
            </DialogActions>
            </Dialog>
        </>
    )
} 

export default DeletePopup;