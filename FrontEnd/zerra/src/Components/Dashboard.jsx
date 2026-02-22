import React, { useState, useEffect, } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Dashboard.module.css';
import axios from 'axios';
import NavBar from './NavBar';
import SharingPopup from './SharingPopup'

function Dashboard() {

  const [files, setFiles] = useState([]);
  const [selectFile, setSelectFile] = useState(null);
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
        const response = await axios.get(`http://localhost:8080/files/share/${userId}`);
        setFiles(response.data);
        return;
      } else {
        const response = await axios.get(`http://localhost:8080/files/${userId}`);
        setFiles(response.data);
        return;
      }
     }catch(e){
        console.error("Error fetching files:", e);
     }
    };
    fetchFiles();
  }, [isSharedPage]);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`http://localhost:8080/files/upload/${localStorage.getItem("userId")}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      setFiles(f => [...f, response.data]);
      setSelectFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const deleteFile = async (index) => {
    try {
      await axios.delete(`http://localhost:8080/files/delete/${files[index].id}`);
      setFiles(files.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleChange = async (value) => {
    setInput(value);
    if(value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response =await axios.get(`http://localhost:8080/files/search/${localStorage.getItem("userId")}?keyword=${value}`);
        setSearchResults(response.data);
        setNoResult(response.data.length === 0);
        console.log("Search results:", response.data);
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

  async function handleDownloadFile(index) {
    try {
      const response = await axios.get(
        `http://localhost:8080/files/download/${files[index].id}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = files[index].originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file");
    }
  }

  const handleFileChange = (e) => {
    setSelectFile(e.target.files[0]);
  }

  const handleUploadClick = () => {
    if (!selectFile){
      alert("Please select a file to upload.");
      return;
    }
    uploadFile(selectFile);
  }

  return (
    <>
    <div className={styles.wrapper}>
      <NavBar/>
      <div className={styles["dashboard-container"]}>
        <h1>Dashboard</h1>
          <div className={styles["sidebar"]}>
            <input 
              type="file" 
              onChange={handleFileChange}
            />
            <button onClick={handleUploadClick}>Upload File</button>
          </div>

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

            <div className={styles["file-list"]}>
              <div className={styles["files-header"]}>
                <span>File Name</span>
                <span>Owner</span>
              </div>
              <hr className={styles["hr-header"]}/>
              {files.map((element, index) => (
                console.log(element),
                <>
                  <div key={element.id} className={styles["file-item"]}>
                    <span>{element.originalFileName}</span>
                    <span>{element.owner.email}</span>
                    <button onClick={() => deleteFile(index)}>Delete</button> 
                    <button onClick={() => handleDownloadFile(index)}>Download</button>
                    <SharingPopup fileId={element.id}/>
                  </div>
                  <hr className={styles["hr-list"]}/>
                </>
              ))}
            </div>
          </div>
      </div>
      </div>
      </>
  );
}

export default Dashboard;
