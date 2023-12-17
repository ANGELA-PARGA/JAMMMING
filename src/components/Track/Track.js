import styles from './Track.module.css'

function Track({song, onClickAdd, isInPlaylist, onClickRemove}){

    function handleOnClick(e){
        if (isInPlaylist){
            onClickRemove(song); 
        } else {
            onClickAdd(song);
        }                       
    }

    const actionButton = isInPlaylist ? "-" : "+";

    return(
        <div className={styles.track}>
            <div className={styles.nameInfoContainer}>
                <h3 className={styles.name}>{song.name}</h3>
                <p className={styles.info}>{song.artist} | {song.album}</p>
            </div>
            <button onClick={handleOnClick} className={styles.button}>{actionButton}</button>
        </div>
    )
}

export default Track;