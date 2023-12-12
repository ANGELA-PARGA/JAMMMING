import Track from "../Track/Track";

function TrackList({songList, onClickAdd}){
    return (
        <div>
            {songList.map((song) => {
                return (
                    <Track
                        song={song}
                        key={song.id}
                        onAdd={onClickAdd}
                        
                    />
                );
            })}
        </div>
    )
}

export default TrackList;