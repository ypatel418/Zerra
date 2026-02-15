import styles from './NavBar.module.css'
import { NavLink } from 'react-router-dom';
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
                <NavLink to='/dashboard' className={styles.links}>Dashboard</NavLink>
                <hr className={styles.hr}/>
                <NavLink to='/shared' className={styles.links}>Shared Files</NavLink>
                <hr className={styles.hr}/>
                <NavLink to='/settings' className={styles.links}>Settings</NavLink>

                
                <NavLink to='/' className={styles.logout} onClick={handleLogout}>Logout</NavLink>
            </div>
        </>
    )
}

export default NavBar