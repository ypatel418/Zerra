import * as React from "react";
import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import SharingPopup from './SharingPopup';
import axios from 'axios';
import Button from '@mui/material/Button';

const FileTable = (props) => {

  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      props.rows.map((file, _) => ({
        id: file.id,
        fileName: file.originalFileName,
        owner: file.owner.email
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

  const deleteFile = async (fileID) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/files/delete/${fileID}`);
      setRows(rows.filter((element, _) => element.id !== fileID));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };



  const columns = [
      { field: 'fileName', headerName: 'File Name', width: 200 },
      { field: 'owner', headerName: 'Owner', width: 200 },

      { 
        field: 'deleteButton', 
        headerName: 'Delete',
        width: 150,
        renderCell: (params) => (
          <Button variant="outlined" color="error" onClick={() => deleteFile(params.row.id)}>
            Delete
          </Button>
        )},

      { 
        field: 'downloadButton', 
        headerName: 'Download',
        width: 150,
        renderCell: (params) => (
          <Button variant="outlined" onClick={() => downloadFile(params.row)}>
            Download
          </Button>
        )},
      
      { 
        field: 'share', 
        headerName: 'Share',
        width: 150,
        renderCell: (params) => (
          <SharingPopup fileId={params.row.id}/>
        )}
  ];



  const paginationModel = { page: 0, pageSize: 5 };


  return (
    <Paper sx={{ height: 400, width: "100%" }}>
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