/*this component render the name of the playlists saved in the Spotify account.
The render function is passed from PlaylistList.js, when a playlist is selected its tracks are rendered
in the Playlist component*/
import styles from "./SavedPlaylist.module.css";

function SavedPlaylist({name, id, render}){
    return(
        <div className={styles.savedPlaylistDiv} >
            <button 
                onClick={()=>render(id, name)}
                className={styles.savedPlaylist}
            >{name}</button>
        </div>
    )
}

export default SavedPlaylist;