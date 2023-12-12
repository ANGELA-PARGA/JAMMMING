import Track from "../Track/Track";

function Playlist({songList, onClickRemove, inputValue, onInputChange, handleSubmitPlaylist}){
    function handleSubmit(e){
        e.preventDefault();
        return handleSubmitPlaylist(e);
    }
    return (
        <div>
            <h2>Your Playlist:</h2>
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="">Playlist's name</label>
                <input type="text" value={inputValue} onChange={onInputChange}/>
                <div>
                {songList.map((song) => {
                    return (
                        <Track
                            song={song}
                            key={song.id}
                            onRemove={onClickRemove}
                        />
                    );
                })}
            </div>
                <button type="submit">SAVE TO SPOTIFY</button>
            </form>            
        </div>
    )

}

export default Playlist;