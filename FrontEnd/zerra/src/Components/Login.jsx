import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import styles from './Login.module.css';


function Login() {

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
            alert(e.message);
        }

    }


    return(
        <div className={styles["login-container"]}>
            <h1>Please Login</h1>
            <form onSubmit={handleLogin} className={styles["login-form"]}>
                <label className={styles["login-label"]}>
                    Email:
                    <input type="email" name="email" required placeholder="Enter Email"/>
                </label>
                <br />
                <label className={styles["login-label"]}>
                    Password:
                    <input type="password" name="password" required placeholder="Enter Password"/>
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>

    );
}

export default Login;