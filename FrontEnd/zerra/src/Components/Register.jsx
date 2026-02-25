import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from './Register.module.css';

function Register() {

    // Creates a navigate hook to redirect the user to the home page
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;
        
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if(password.length < 8) {
            alert("Password should be at least 8 characters long!");
            return;
        }

        if(!/[A-Z]/.test(password)) {
            alert("Password should contain at least one uppercase letter!");
            return;
        }

        if(!/[0-9]/.test(password)) {
            alert("Password should contain at least one number!");
            return;
        }

        try{
            await createUserWithEmailAndPassword(auth, email, password);

            // Send to the backend the user's email and their firebase unique ID
            const user = auth.currentUser;
            
            // Sends a POST request to the backend to create a new user
            // Sends the email and UID in the request body
            const response = await axios.post('${import.meta.env.VITE_API_URL}/users/register', {
                email: user.email,
                id: user.uid
            });
            alert("Account Created Successfully!");

            // Redirect to home page
            navigate("/");
        } catch (e) {
            alert(e.message);
        }

    }

    return (
        <div className={styles["register-container"]}>
            <h1>Register</h1>
            <p>Password must be at least 8 characters long, contain at least one uppercase letter, and one number.</p>
            <form onSubmit={handleRegister} className={styles["register-form"]}>
                <label htmlFor="email">Email:</label>
                <input type="email" name="email" placeholder="Enter Email" required /> <br />
                <label htmlFor="password">Password:</label>
                <input type="password" name="password" placeholder="Enter Password" required /> <br />
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input type="password" name="confirmPassword" placeholder="Confirm Password" required /> <br />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;