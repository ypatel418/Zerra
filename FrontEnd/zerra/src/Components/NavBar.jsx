import styles from './NavBar.module.css'
import { auth } from "../firebase.js";

function NavBar() {

    const handleLogout = () => {
        auth.signOut().then(() => {
            localStorage.removeItem("userId");
            console.log("User signed out");
        }).catch((error) => {
            alert(error.message);
            console.log("Error signing out: ", error);
        });
    }

    return (
        <>
            <div className={styles.NavBar}>
                <a href='./dashboard' className={styles.links}>Dashboard</a>
                <hr className={styles.hr}/>
                <a href='' className={styles.links}>Shared Files</a>
                <hr className={styles.hr}/>
                <a href='' className={styles.links}>Settings</a>

                
                <a href='./' className={styles.logout} onClick={handleLogout}>Logout</a>
            </div>
        </>
    )
}

export default NavBar