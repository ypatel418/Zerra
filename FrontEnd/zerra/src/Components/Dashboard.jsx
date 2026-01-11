 import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';

function Dashboard() {

  const [files, setFiles] = useState([]);

  useEffect(() => {
   const fetchFiles = async () => {
     try{
        const response = await axios.get(`/files/${localStorage.getItem("userId")}`);
        console.log("Fetched files:", response.data);
        setFiles(response.data);
     }catch(e){
        console.error("Error fetching files:", e);
     }
    };
    fetchFiles();
  }, []);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      setFiles(f => [...f, response.data]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/files/delete/${fileId}`);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  function handleSearch(event) {
    
    
  }

  function handleDownloadFile(fileId) {

  }

  // Need to add an upload file section
  // Currently getting an error regarding file mapping (Cannot use map on file since backend is not set up)
  return (
    <div className={styles["dashboard-container"]}>
      <h1>Dashboard</h1>
        <div className={styles["sidebar"]}>
          <button onClick={() => uploadFile()}>Upload File</button>
          <ul>
            <li>Home</li>
            <li>Shared with me</li>
            <li>Settings</li>
          </ul>
        </div>

        <div className={styles["main-content"]}>

          <input type="text" placeholder='Search for files' onChange={handleSearch} />

          <div className={styles["file-list"]}>
            {files.map(file => (
              <div key={file.id} className={styles["file-item"]}>
                <span>{file.originalFileName}</span>
                <button onClick={() => deleteFile(file.id)}>Delete</button> 
                <button onClick={() => handleDownloadFile(file.id)}>Download</button>
                <button onClick={() => handleShareFile(file.id)}>Share File</button>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

export default Dashboard;