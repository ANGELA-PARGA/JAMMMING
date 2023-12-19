/*This component renders each Track of search results or the playlist list using the Track 
component and passing an array of tracks and the functions to add a track to playlist (if the track
belongs to Search Results) or remove the track if belongs to Playlist*/

import Track from "../Track/Track";

function TrackList({songList, onClickAdd, isInPlaylist, onClickRemove}){
    return (
        <div>
            {songList.map((song) => {
                return (
                    <Track
                        song={song}
                        key={song.id}
                        onClickAdd={onClickAdd}
                        isInPlaylist={isInPlaylist}
                        onClickRemove={onClickRemove}                      
                    />
                );
            })}
        </div>
    )
}

export default TrackList;