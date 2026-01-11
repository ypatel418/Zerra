import styles from './Dashboard.module.css';

function Dashboard() {

  function handleSearch(event) {
    const query = event.target.value;
    // Implement search logic here
    
  }

  return (
    <div className={styles["dashboard-container"]}>
      <h1>Dashboard</h1>
        <div className={styles["sidebar"]}>
          <ul>
            <li>Home</li>
            <li>Shared with me</li>
            <li>Settings</li>
          </ul>
        </div>

        <div className={styles["main-content"]}>

          <input type="text" placeholder='Search for files' onChange={handleSearch} />

          <div className={styles["file-list"]}>
            {/* Render list of files here */}
          </div>
        </div>
    </div>
  );
}

export default Dashboard;