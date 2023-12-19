/*This component is used to render a button for log in and accept the Spotify conditions for
authorization. Also the button modify the state of the app changing the renderization of some
components*/
import styles from "./Authentication.module.css";

function Authentication({logInAction, logOutAction, state, username}){

    const buttonText= state ? "Log Out" : "Log In";
    const headerText= state ? `Welcome...${username}`: "To start please log in into your Spotify account";

    function handleOnClick(e){
        if (state){
            logOutAction(); 
        } else {
            logInAction();
        }                       
    }

    return (
        <div className={styles.authenticationDiv}>
            <h2 className={styles.headerText}>{headerText}</h2>
            <button 
                onClick={handleOnClick} 
                className={styles.authenticationButton}
            >{buttonText}
            </button>
        </div>
    )
    
}

export default Authentication;