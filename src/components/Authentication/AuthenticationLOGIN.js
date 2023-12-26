/*This component is used to render a button for login, redirect the user to the Spotify authorization
page*/

import styles from "./Authentication.module.css";

function AuthenticationLOGIN({logInAction}){

    const headerText= "To start please log in into your Spotify account";

    return (
        <div className={styles.authenticationDiv}>
            <h2 className={styles.headerText}>{headerText}</h2>
            <button 
                onClick={logInAction} 
                className={styles.authenticationButton}
            >Log In
            </button>
        </div>
    )
    
}

export default AuthenticationLOGIN;