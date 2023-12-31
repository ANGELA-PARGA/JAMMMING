/* this component render the playlist tracks, using the playlist state (it can be tracks added from the 
search, or tracks from a selected saved playlist). It has a button to remove the track, 
another one to save the playlist and one to close the playlist without changes*/

import Tracklist from '..//Tracklist/TrackList';
import styles from "./Playlist.module.css";

function Playlist({songList, onClickRemove, inputValue, onInputChange, handleSubmitPlaylist, closePlaylist}){
    
    function handleSubmit(e){
        e.preventDefault();
        return handleSubmitPlaylist(e);
    }

    return (
        <div className={styles.playlistContainer}>
            <form action="" onSubmit={handleSubmit} className={styles.playlistForm}>
                <label htmlFor="name">Set or change the playlist's name</label>
                <input 
                    id='name' 
                    type="text" 
                    value={inputValue} 
                    onChange={onInputChange}
                    placeholder="Write an awesome name"
                    maxLength={30}
                />
                <div>
                <Tracklist 
                    songList={songList}
                    onClickRemove={onClickRemove} 
                    isInPlaylist={true}         
                />
                </div>
                <button type="submit" className={styles.buttonSave}>SAVE TO SPOTIFY</button>
            </form>
            <button onClick={closePlaylist} className={styles.buttonClose}>CLOSE WITHOUT SAVE</button>            
        </div>
    )

}

export default Playlist;