/*This component is used to render a button for log out. 
When clicked modify the state of the app changing the renderization of some
components,  and the function clear the local Storage*/
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