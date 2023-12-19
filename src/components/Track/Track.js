/* this component render a Track with (name, artist, album). It has a button to add a track or
remove a track depending if the track belongs to search results or to playlist. To achieve this
it receives a boolean 'isInPlaylist' that indicates if the Track belongs to Search Results or Playlist 
Also, it has a button to play-pause a track's preview (in some cases there is not preview). Here useRef
keep tracksa reference of the audio*/
import { UilPlayCircle } from '@iconscout/react-unicons';
import { UilPauseCircle } from '@iconscout/react-unicons';
import styles from './Track.module.css';
import { useRef, useState } from 'react';

function Track({song, onClickAdd, isInPlaylist, onClickRemove}){
    const [isTrackPlaying, setIsTrackPlaying] = useState(false);
    const playingRef = useRef(new Audio (song.preview));

    function audioPlayer(){
        const audio = playingRef.current;
        if(!isTrackPlaying){
            audio.play();
        } else {
            audio.pause();
        }
        setIsTrackPlaying(!isTrackPlaying)
    }

    function currentlyButton(){
        if(!isTrackPlaying){
            return(
                <UilPlayCircle/>
            )
        } else {
            return (
                <UilPauseCircle/>
            )
        }
    }

    const actionButton = isInPlaylist ? "-" : "+";

    function handleOnClick(e){
        if (isInPlaylist){
            onClickRemove(song); 
        } else {
            onClickAdd(song);
        }                       
    }

    function changeToMinutes(milliseconds){
        let seconds = Math.floor(milliseconds / 1000);
        let deciseconds = Math.floor((milliseconds % 1000) / 100);
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${deciseconds}`;
    }

    return(
        <div className={styles.track}>
            <div className={styles.nameInfoContainer}>
                <h3 className={styles.name}>{song.name}</h3>
                <p className={styles.info}>{song.artist} | {song.album} | {changeToMinutes(song.duration)}</p>
            </div>
            { song.preview ? (
                <button onClick={audioPlayer} className={styles.playButton}>{currentlyButton()}</button>
            ) : (
                <button className={styles.notPreviewButton}>preview unavailable</button>
            )}            
            <button onClick={handleOnClick} className={styles.buttonTrack}>{actionButton}</button>
        </div>
    )
}

export default Track;