
function Authentication({logInAction, logOutAction, state}){

    const buttonText= state ? "Log Out" : "Log In";
    const headerText= state ? "" : "To start please log in into your Spotify account";

    function handleOnClick(e){
        if (state){
            logOutAction(); 
        } else {
            logInAction();
        }                       
    }

    return (
        <div>
            <h2>{headerText}</h2>
            <button onClick={handleOnClick}>{buttonText}</button>
        </div>
    )
    
}

export default Authentication;