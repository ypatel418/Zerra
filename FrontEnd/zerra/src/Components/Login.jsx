import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import styles from './Login.module.css';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';


function Login() {

    const [error, setError] = useState(null);


    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const email = e.target.email.value;
        const password = e.target.password.value;

        try{
            await signInWithEmailAndPassword(auth, email, password);
            // Save user's UID to local storage
            const user = auth.currentUser;
            localStorage.setItem("userId", user.uid);
            navigate("/dashboard");
        } catch (e) {
            setError(getFriendlyErrorMessage(e));
        }
    }

    const getFriendlyErrorMessage = (error) => {
        if (!error) {
            return "An unexpected error occurred. Please try again.";
        }
        if (error.code) {
            switch (error.code) {
                case "auth/user-not-found":
                    return "No account found with this email. Please check your email or register for a new account.";
                case "auth/wrong-password":
                    return "Incorrect password. Please try again.";
                case "auth/invalid-email":
                    return "The email address you entered is not valid. Please check it and try again.";
                case "auth/network-request-failed":
                    return "A network error occurred. Please check your internet connection and try again.";
                default:
                    return "Failed to login. Please check your credentials and try again.";
            }
        }
        return "Failed to login. Please check your credentials and try again.";
    }


    return(
        <div className={styles["login-container"]}>
            <h1>Please Login</h1>
            <form onSubmit={handleLogin} className={styles["login-form"]}>
                <label className={styles["login-label"]}>
                    Email:
                    <div>
                        <br />
                        <TextField
                        required
                        name="email"
                        id="email"
                        label="Email"
                        placeholder="Enter Email"
                        type="email"
                        autoComplete="email"
                        />
                    </div>
                </label>
                <br />
                <label className={styles["login-label"]}>
                    Password:
                    <div>
                        <br />
                        <TextField
                        required
                        name="password"
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Enter Password"
                        />
                    </div>
                </label>
                <br />
                <button type="submit">Login</button>
                
                {/* Add a button to navigate to the register page */}
                <button type="button" onClick={() => navigate("/register")}>
                    Don't have an account?
                </button>

                {/* Add a button to navigate to the forgot password page */}
                <button type="button" onClick={() => navigate("/reset-password")}>
                    Forgot Password?
                </button>
            </form>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

        </div>

    );
}

export default Login;