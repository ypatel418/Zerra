import React, { useState } from 'react';
import './SharingPopup.css';
import axios from 'axios';
import { auth } from "../firebase.js";

const SharingPopup = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);

  function handleShareFile() {
    if (email) {
      axios.put(`http://localhost:8080/files/share/${props.fileId}?email=${email}`)
        .then(response => {
          alert("File shared successfully!");
        })
        .catch(error => {
          console.error("Error sharing file:", error);
          alert("Failed to share file");
        });
    }
  }

  function removeUserShared(email) {
    try{
      axios.delete(`http://localhost:8080/files/share/${props.fileId}/${email}`)
      setUsers(users.filter( (element ,i) => {
        element.email != email;
      }))
    }catch(e){
      console.error("Error Removing User", e)
    }
  }

  const getSharedUsers = async () => {
    try{
      const response = await axios.get(`http://localhost:8080/files/share/${props.fileId}`)
      const filteredUsers = response.data.filter((element) => {
        return element.email !== auth.currentUser.email;
      })
      setUsers(filteredUsers);
    }catch(e){
      console.error("Error fetching Users", e)
    }
  }

  const toggleModal = () => {
      setIsOpen(!isOpen);
      getSharedUsers();
    }

  return (
    <div className="app-container">
      <button onClick={toggleModal} className="open-btn">Share File (better)</button>

      {isOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          {/* stopPropagation stops the window from closing when clicking inside the white box */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share File</h3>
              <button className="close-x" onClick={toggleModal}>&times;</button>
            </div>

            <div className="modal-body">
              <label htmlFor="email">Email:</label>
              <input type="text" id="email" name="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)}/>
              <button onClick={ () => handleShareFile()} className="btn-secondary">Share</button>
              <div className="SharedUsers">
                {users.map((element, index) => (
                    <ol key={element.id}>
                      {element.email}
                      <button onClick={() => removeUserShared(element.email)}> Remove User</button>
                    </ol>
                ))}
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={toggleModal}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingPopup;