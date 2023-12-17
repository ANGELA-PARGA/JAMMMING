import Track from "../Track/Track";

function Playlist({songList, onClickRemove, inputValue, onInputChange, handleSubmitPlaylist, closePlaylist}){
    
    function handleSubmit(e){
        e.preventDefault();
        return handleSubmitPlaylist(e);
    }

    return (
        <div>
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="name">Set or change the playlist's name</label>
                <input id='name' type="text" value={inputValue} onChange={onInputChange}/>
                <div>
                {songList.map((song) => {
                    return (
                        <Track
                            song={song}
                            key={song.id}
                            onClickRemove={onClickRemove}
                            isInPlaylist={true}
                        />
                    );
                })}
                </div>
                <button type="submit">SAVE TO SPOTIFY</button>
                <button onClick={closePlaylist}>CLOSE WITHOUT SAVE</button>
            </form>            
        </div>
    )

}

export default Playlist;