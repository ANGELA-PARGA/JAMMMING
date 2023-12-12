import Tracklist from '..//Tracklist/TrackList'

function SearchResult({resultingSongs, onClickAdd}){
    return (
        <div>
            <h2>Results</h2>
            <div>
                <Tracklist 
                    songList={resultingSongs}
                    onClickAdd={onClickAdd}          
                />
            </div>
        </div>
    )
}

export default SearchResult;