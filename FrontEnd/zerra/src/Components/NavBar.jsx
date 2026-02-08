import styles from './NavBar.module.css'
function NavBar() {


    return (
        <>
            <div className={styles.NavBar}>
                <a href='./dashboard' className={styles.links}>Dashboard</a>
                <hr className={styles.hr}/>
                <a href='' className={styles.links}>Shared Files</a>
                <hr className={styles.hr}/>
                <a href='' className={styles.links}>Settings</a>

                
                <a href='./' className={styles.logout}>Logout</a>
            </div>
        </>
    )
}

export default NavBar