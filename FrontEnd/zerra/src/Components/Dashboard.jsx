 import React, { useState, useEffect, } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';
import NavBar from './NavBar';

function Dashboard() {

  const [files, setFiles] = useState([]);
  const [selectFile, setSelectFile] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResult, setNoResult] = useState(false);

  useEffect(() => {
   const fetchFiles = async () => {
     try{
        const response = await axios.get(`http://localhost:8080/files/${localStorage.getItem("userId")}`);
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

  function handleShareFile(fileId) {
     const email = prompt("Enter the email address to share the file with:");
    
    if (email) {
      axios.put(`http://localhost:8080/files/share/${fileId}?email=${email}`)
        .then(response => {
          alert("File shared successfully!");
        })
        .catch(error => {
          console.error("Error sharing file:", error);
          alert("Failed to share file");
        });
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
            <ul>
              <li>Home</li>
              <li>Shared with me</li>
              <li>Settings</li>
            </ul>
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
                        {file.originalFileName // Can also display other file details here if needed
                        }
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className={styles["file-list"]}>
              {files.map((element, index) => (
                <div key={element.id} className={styles["file-item"]}>
                  <span>{element.originalFileName}</span>
                  <button onClick={() => deleteFile(index)}>Delete</button> 
                  <button onClick={() => handleDownloadFile(index)}>Download</button>
                  <button onClick={() => handleShareFile(element.id)}>Share File</button>
                </div>
              ))}
            </div>
          </div>
      </div>
      </div>
      </>
  );
}

export default Dashboard;

