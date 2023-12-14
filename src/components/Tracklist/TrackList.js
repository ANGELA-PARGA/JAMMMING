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