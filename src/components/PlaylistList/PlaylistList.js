import SavedPlaylist from "../SavedPlaylist/SavedPlaylist";

function PlaylistList({playlistsList, savedPlaylistRender}){
    return (
        <div>
            {playlistsList.map((savedPlaylist) => {
                return (
                    <>
                    <SavedPlaylist
                        name={savedPlaylist.name}
                        key={savedPlaylist.id}
                        id={savedPlaylist.id}
                        render={savedPlaylistRender}                     
                    />
                    </>
                );
            })}
        </div>
    )
}

export default PlaylistList;