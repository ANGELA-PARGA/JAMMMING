/*This component is used to render a button for log out and accept the Spotify conditions for
authorization. Also the button modify the state of the app changing the renderization of some
components*/
import styles from "./Authentication.module.css";

function AuthenticationLOGOUT({logOutAction, username}){

    const headerText= `Welcome...${username}`;

    return (
        <div className={styles.authenticationDiv}>
            <h2 className={styles.headerText}>{headerText}</h2>
            <button 
                onClick={logOutAction} 
                className={styles.authenticationButton}
            >Log Out
            </button>
        </div>
    )
    
}

export default AuthenticationLOGOUT;