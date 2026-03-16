import * as React from "react";
import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import SharingPopup from './SharingPopup';
import axios from 'axios';
import Button from '@mui/material/Button';
import { auth } from "../firebase.js";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeletePopup from "./DeletePopup.jsx";

const FileTable = (props) => {

  const [rows, setRows] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setRows(
      props.rows.map((file, _) => ({
        id: file.id,
        fileName: file.originalFileName,
        owner: (file.owner.email === currentUser?.email) ? "Me" : file.owner.email
      }))
    );
  }, [props.rows]);


  async function downloadFile(file) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files/download/${file.id}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file");
    }
  }

  function handleDeleteFile(fileID) {
    setRows(rows.filter((element, _) => element.id !== fileID));
  }


  const columns = [
      { field: 'fileName', headerName: 'File Name', width: 200 },
      { field: 'owner', headerName: 'Owner', width: 200 },

      { 
        field: 'deleteButton', 
        headerName: 'Delete',
        width: 150,
        renderCell: (params) => (
          <DeletePopup fileID={params.row.id} onDelete={handleDeleteFile}/>
        )},

      { 
        field: 'downloadButton', 
        headerName: 'Download',
        width: 170,
        renderCell: (params) => (
          <Button variant="outlined" startIcon={<FileDownloadIcon />} sx={{color: 'rgb(28, 139, 158)', borderColor: 'rgb(28, 139, 158)'}} onClick={() => downloadFile(params.row)}>
            Download
          </Button>
        )},
      
      { 
        field: 'share', 
        headerName: 'Share',
        width: 170,
        renderCell: (params) => (
          <SharingPopup fileId={params.row.id}/>
        )}
  ];



  const paginationModel = { page: 0, pageSize: 5 };


  return (
    <Paper sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        sx={{ border: 0 }}
      />
    </Paper>
  );
};

export default FileTable