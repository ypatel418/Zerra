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
    const [success, setSuccess] = useState(null);

    const getFriendlyErrorMessage = (error) => {
        if (!error) {
            return "An unexpected error occurred. Please try again.";
        }
        if (error.code) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    return "This email is already in use. Please use a different email or sign in instead.";
                case "auth/invalid-email":
                    return "The email address you entered is not valid. Please check it and try again.";
                case "auth/weak-password":
                    return "Your password is too weak. Please choose a stronger password.";
                case "auth/network-request-failed":
                    return "A network error occurred. Please check your internet connection and try again.";
                default:
                    return "We couldn't create your account. Please try again.";
            }
        }
        return "We couldn't create your account. Please try again.";
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
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
            setSuccess("Account created successfully! Redirecting to home page...");
            
            // Redirect to home page after 4 seconds
            setTimeout(() => {
                navigate("/");
            }, 4000);
        } catch (e) {
            const friendlyMessage = getFriendlyErrorMessage(e);
            setError(friendlyMessage);
        }

    }

    return (
        <div className={styles["register-container"]}>
            <h1>Register</h1>
            <p>Password must be at least 8 characters long, contain at least one uppercase letter, and one number.</p>
            <form onSubmit={handleRegister} className={styles["register-form"]}>
                <div className={styles["field-group"]}>
                    <label htmlFor="email">Email:</label>
                    <TextField
                        required
                        name="email"
                        id="email"
                        label="Email"
                        type="email"
                    />
                </div>

                <div className={styles["field-group"]}>
                    <label htmlFor="password">Password:</label>
                    <TextField
                        required
                        name="password"
                        id="password"
                        label="Password"
                        type="password"
                    />
                </div>

                <div className={styles["field-group"]}>
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <TextField
                        required
                        name="confirmPassword"
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                    />
                </div>

                <button type="submit">Register</button>
            </form>

            {/* sets the error state to an alert if there is an error */}
            {error && <Alert variant="filled" severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {/* sets the success state to an alert if there is a success */}
            {success && <Alert variant="filled" severity="success" sx={{ mt: 2 }}>{success}</Alert>}

        </div>
    );
}

export default Register;