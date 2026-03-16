import React, { useState } from 'react';
import './SharingPopup.css';
import axios from 'axios';
import { auth } from "../firebase.js";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ShareIcon from '@mui/icons-material/Share';
import SendIcon from '@mui/icons-material/Send';


const SharingPopup = (props) => {
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);

  async function handleShareFile() {
    if (email) {
      
      try{
        await axios.put(`${import.meta.env.VITE_API_URL}/files/share/${props.fileId}?email=${email}`);
        await getSharedUsers();
        } catch(error) {
          console.error("Error sharing file:", error)
        }
    }
  }

  async function removeUserShared(email) {
    try{
      await axios.delete(`${import.meta.env.VITE_API_URL}/files/share/${props.fileId}/${email}`)
      setUsers(users.filter((element) => element.email !== email))
    }catch(e){
      console.error("Error Removing User", e)
    }
  }

  const getSharedUsers = async () => {
    try{
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/files/sharedUsers/${props.fileId}`)
      const filteredUsers = response.data.filter((element) => {
        return element.email !== auth.currentUser.email;
      })
      setUsers(filteredUsers);
      
    }catch(e){
      console.error("Error fetching Users", e)
    }
  }

  function toggleDialog() {
      setOpen(true);
      getSharedUsers();
  }

  function checkUsers() {
    if(users.length > 0) {
      return 'Shared Users: '
    } else {
      return ''
    }
  }

  return (
    <div>
      <Button variant="outlined" startIcon={<ShareIcon />} sx={{
        color: 'rgb(28, 139, 158)', 
        borderColor: 'rgb(28, 139, 158)'}} onClick={() => toggleDialog()}>
          Share File
      </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Share</DialogTitle>

          <DialogContent>
            <label htmlFor="email">Email:</label>
            <input type="text" id="email" name="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)}/>
            <Button variant="outlined" endIcon={<SendIcon />} sx={{
              color: 'rgb(28, 139, 158)', 
              borderColor: 'rgb(28, 139, 158)'}} onClick={() => handleShareFile()}>
                Share
            </Button>
            <br/>
            <br/>
            <Typography>{checkUsers()}</Typography>
             {users.map((element, _) => (
                  <div key={element.id} className='SharedUsers-List'>
                    <Typography variant="body2" key={element.id}> {element.email} </Typography>
                    <Button variant="outlined" color="error" onClick={() => removeUserShared(element.email)}> Remove User</Button>
                  </div>
                ))}
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" sx={{
              color: 'rgb(28, 139, 158)', 
              borderColor: 'rgb(28, 139, 158)'}} onClick={() => setOpen(false)}>
                Close
            </Button>
          </DialogActions>
        </Dialog>
    </div>
  );
};

export default SharingPopup;