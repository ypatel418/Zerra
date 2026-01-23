 import React, { useState, useEffect, } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';

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
        const response =await axios.get(`http://localhost:8080/files/search?keyword=${value}`);
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

     if(!email){
       return;
     }

     try {
        axios.post(`http://localhost:8080/files/share`, {
          fileId: fileId,
          email: email
        });
        alert("File shared successfully!");
     } catch (error) {
        console.error('Error sharing file:', error);
        alert("Error sharing file. Please try again.");
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

  // Current problems lie in upload file
  // When a user creates an account, their info is not being stored in the database
  // This gives us an error when we try to upload a file since we cant map an owner to it
  // Also, when uploading a file, the backend still states that the file is not present

  // I think there are problems with the file input and upload file button not working with each other

  // Download doesn't work as well

  // Search also doesn't work

  return (
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

