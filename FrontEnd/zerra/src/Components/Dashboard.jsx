import React, { useState, useEffect, } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Dashboard.module.css';
import axios from 'axios';
import NavBar from './NavBar';
import FileTable from './FileTable.jsx';

function Dashboard() {

  const [files, setFiles] = useState([]);
  const [input, setInput] = useState("");

  const location = useLocation();
  const isSharedPage = location.pathname === '/shared';

  useEffect(() => {
   const fetchFiles = async () => {
     try{
      const userId = localStorage.getItem("userId");
      if (isSharedPage) {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/files/share/${userId}`);
        setFiles(response.data);
        return;
      } else {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/files/${userId}`);
        setFiles(response.data);
        return;
      }
     }catch(e){
        console.error("Error fetching files:", e);
     }
    };
    fetchFiles();
  }, [isSharedPage]);

  const handleChange = (value) => {
    setInput(value);
  };

  const normalizedSearch = input.trim().toLowerCase();
  const filteredFiles = normalizedSearch
    ? files.filter((file) => {
        const fileName = file.originalFileName?.toLowerCase() || "";
        const ownerEmail = file.owner?.email?.toLowerCase() || "";
        return fileName.includes(normalizedSearch) || ownerEmail.includes(normalizedSearch);
      })
    : files;


  function handleUpload(file) {
    setFiles(f => [...f, file]);
  }
  return (
    <>
    <div className={styles.wrapper}>
      <NavBar handleUpload={handleUpload}/>
      <div className={styles["dashboard-container"]}>
        <h1>Dashboard</h1>

          <div className={styles["main-content"]}>

            <div className={styles["search-container"]}>
              <input
                type='search'
                className={styles["search-input"]}
                placeholder='Search files...'
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                />
            </div>
            
            <FileTable rows={filteredFiles}/>
          </div>
      </div>
      </div>
      </>
  );
}

export default Dashboard;
