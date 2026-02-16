import React, { useState } from 'react';
import './SharingPopup.css';
import axios from 'axios';

const SharingPopup = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const toggleModal = () => setIsOpen(!isOpen);

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
                
            </div>

            <div className="modal-footer">
              <button onClick={ () => handleShareFile()} className="btn-secondary">Share</button>
              <button className="btn-primary" onClick={toggleModal}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingPopup;