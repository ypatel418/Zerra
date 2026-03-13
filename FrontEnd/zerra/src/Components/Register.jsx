import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from './Register.module.css';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';


function Register() {

    // Creates a navigate hook to redirect the user to the home page
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;
        
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if(password.length < 8) {
            setError("Password should be at least 8 characters long!");
            return;
        }

        if(!/[A-Z]/.test(password)) {
            setError("Password should contain at least one uppercase letter!");
            return;
        }

        if(!/[0-9]/.test(password)) {
            setError("Password should contain at least one number!");
            return;
        }

        try{
            await createUserWithEmailAndPassword(auth, email, password);

            // Send to the backend the user's email and their firebase unique ID
            const user = auth.currentUser;
            
            // Sends a POST request to the backend to create a new user
            // Sends the email and UID in the request body
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, {
                email: user.email,
                id: user.uid
            });
            alert("Account Created Successfully!");

            // Redirect to home page
            navigate("/");
        } catch (e) {
            setError(e.message);
        }

    }

    return (
        <div className={styles["register-container"]}>
            <h1>Register</h1>
            <p>Password must be at least 8 characters long, contain at least one uppercase letter, and one number.</p>
            <form onSubmit={handleRegister} className={styles["register-form"]}>
                <label htmlFor="email">Email:</label>
                <TextField
                    required
                    name="email"
                    id="outlined-required"
                    label="Required"
                    type="email"
                />
                <label htmlFor="password">Password:</label>
                <TextField
                    required
                    name="password"
                    id="outlined-required"
                    label="Required"
                    type="password"
                />
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <TextField
                    required
                    name="confirmPassword"
                    id="outlined-required"
                    label="Required"
                    type="password"
                />
                <button type="submit">Register</button>
            </form>

            { // sets the error state to an alert if there is an error
            error && <Alert variant="filled" severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
        </div>
    );
}

export default Register;