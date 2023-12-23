/*This component is used to render a button for log in and accept the Spotify conditions for
authorization. Also the button modify the state of the app changing the renderization of some
components*/
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