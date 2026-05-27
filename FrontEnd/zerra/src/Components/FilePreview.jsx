import Dialog from "@mui/material/Dialog";
import React, { useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import DeletePopup from "./DeletePopup.jsx";
import SharingPopup from './SharingPopup';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';



const FilePreview = ({file, onDownload, onDelete2}) => {

    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        if (!open && previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewFile(null);
        }
    }, [open, previewUrl]);
    async function handlePreview() {
        try {
            const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/files/preview/${file.id}`,
            { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(response.data);
            setPreviewUrl(url);
            setPreviewFile(file);
            setOpen(true);
        } catch (e) {
            console.error("Preview failed", e);
        }
    }


    function renderPreview() {
        const type = file.type || '';

        if (type.startsWith('image/')) return <img src={previewUrl} style={{ width: '100%' }} />;
        if (type === 'application/pdf') {
            return (
                <object
                data={previewUrl}
                type="application/pdf"
                width="100%"
                height="700px"
                style={{ minHeight: '70vh' }}
                >
                <Typography>PDF preview not available in your browser.</Typography>
                </object>
            );
        }
        if (type.startsWith('video/')) return <video src={previewUrl} controls style={{ width: '100%' }} />;
        
        return <Typography>Preview not available for this file type</Typography>;
    }

    function handleDeleteFile(fileID) {
        onDelete2(fileID);
    }

    return (
        <div>
            <span onClick={() => handlePreview(file)} style={{ cursor: 'pointer' }}>{file.fileName}</span>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>File Preview - {file.fileName}</DialogTitle>

                <DialogContent>
                    {previewFile && renderPreview()}
                </DialogContent>

                <DialogActions>
                    <DeletePopup fileID={file.id} onDelete={handleDeleteFile}/>
                    <SharingPopup fileId={file.id}/>
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} sx={{color: 'rgb(28, 139, 158)', borderColor: 'rgb(28, 139, 158)'}} onClick={() => onDownload(file)}>
                        Download
                    </Button>
                    
                    <Button variant="outlined" sx={{
                        color: 'rgb(28, 139, 158)', 
                        borderColor: 'rgb(28, 139, 158)'}} onClick={() => setOpen(false)}>
                            Close
                    </Button>
                </DialogActions>

            </Dialog>
        </div>
    );
};

export default FilePreview;