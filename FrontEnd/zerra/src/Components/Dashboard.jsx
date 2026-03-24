import React, { useState, useEffect, } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Dashboard.module.css';
import axios from 'axios';
import NavBar from './NavBar';
import FileTable from './FileTable.jsx';

function Dashboard() {

  const [files, setFiles] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResult, setNoResult] = useState(false);

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

  const handleChange = async (value) => {
    setInput(value);
    if(value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response =await axios.get(`${import.meta.env.VITE_API_URL}/files/search/${localStorage.getItem("userId")}?keyword=${value}`);
        setSearchResults(response.data);
        setNoResult(response.data.length === 0);
      }
      catch (error) {
        console.error('Error searching files:', error);
      }
    }
    else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResult(false);
    }
  };


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
                onFocus={() => input && setShowSearchResults(true)}
                onBlur={() => {
                  // Delay hiding search results to allow click events to register
                  setTimeout(() => setShowSearchResults(false), 200);
                }}
                />

              {showSearchResults && (
                <div className={styles["search-dropdown"]}>
                  {noResult ? (
                    <div className={styles["search-result-item"]}>No results found</div>
                  ) : (
                    searchResults.map((file) => (
                      <div
                        key={file.id}
                        className={styles["search-result-item"]}
                        onClick={() => {
                          setInput(file.originalFileName);
                          setShowSearchResults(false);
                        }}
                      >
                        {file.originalFileName} - {file.owner.email}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <FileTable rows={files}/>
          </div>
      </div>
      </div>
      </>
  );
}

export default Dashboard;
