/*This component renders the search results using the TrackList component and passing an array of Tracks
and the function to add a track to playlist*/
import Tracklist from '..//Tracklist/TrackList'
import styles from './Searchresults.module.css'

function SearchResult({songList, onClickAdd}){
    console.log('el componente Searchresults se montó')
    return (
        <div className={styles.resultsContainer}>
            <Tracklist 
                songList={songList}
                onClickAdd={onClickAdd} 
                isInPlaylist={false}         
            />
        </div>
    )
}

export default SearchResult;