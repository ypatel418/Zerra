import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './Home.module.css';

function Home() {

    const navigate = useNavigate();

    const activateBackend = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/users/activate`);
        } catch (e) {
            console.error("Error activating backend:", e);
        }
    }

    // Activate the backend when the home page loads
    useEffect(() => {
        activateBackend();
    }, []);

    return(
        <div className={styles["home-container"]}>
            <div className={styles["welcome-section"]}>
                <h1>Welcome to Zerra</h1>
                <h3>An open source file sharing platform</h3>
                <p>Store Files, Share Files, Access Anywhere</p>
                <button className={styles["get-started-button"]} onClick={() => navigate("/register")}>Get Started</button>
                <button className={styles["login-button"]} onClick={() => navigate("/login")}>Log In</button>
            </div>

            <div className={styles["features-section"]}>
                <div className={styles["sharing-feature"]}>
                    <h2>Easy Sharing</h2>
                    <p>Share files with friends and colleagues effortlessly.</p>
                </div>
                <div className={styles["access-feature"]}>
                    <h2>Access Anywhere</h2>
                    <p>Access your files anytime on the web </p>
                </div>
            </div>

            <div className={styles["get-started-section"]}>
                <h2>Get Started Today!</h2>
                <p>Sign up now to get started.</p>
                <p>If you already have an account, log in to access your files.</p>
            </div>
        </div>

    );
}

export default Home;