/*This component render the SavedPlaylist component in a group. It passes a list of
playlists and a function to render the playlist's tracks*/

import SavedPlaylist from "../SavedPlaylist/SavedPlaylist";

function PlaylistList({playlistsList, renderPlaylistTracks}){
    return (
        <div>
            {playlistsList.map((savedPlaylist) => {
                return (
                    <>
                    <SavedPlaylist
                        name={savedPlaylist.name}
                        key={savedPlaylist.id}
                        id={savedPlaylist.id}
                        render={renderPlaylistTracks}                     
                    />
                    </>
                );
            })}
        </div>
    )
}

export default PlaylistList;