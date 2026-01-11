 import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';

function Dashboard() {

  const [files, setFiles] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResult, setNoResult] = useState(false);

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

  const deleteFile = async (index) => {
    try {
      await axios.delete(`/files/delete/${files[index].id}`);
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
        const response =await axios.get(`/files/search?keyword=${value}`);
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
      setShowSearchResults([]);
      setNoResult(false);
    }
  };

  function handleDownloadFile(index) {
    axios({
      url: `/files/download/${files[index].id}`,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', files[index].originalFileName);
      document.body.appendChild(link);
      link.click();
    });
  }

  function handleShareFile(fileId) {
     const email = prompt("Enter the email address to share the file with:");

     if(!email){
       return;
     }

     try {
        axios.post('/files/share', {
          fileId: fileId,
          email: email
        });
        alert("File shared successfully!");
     } catch (error) {
        console.error('Error sharing file:', error);
        alert("Error sharing file. Please try again.");
     }
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

          <input 
            type='search'
            className={styles["search-input"]}
            placeholder='Search'
            value={input}
            onChange={(e) => handleChange(e.target.value)}
          />

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
  );
}

export default Dashboard;