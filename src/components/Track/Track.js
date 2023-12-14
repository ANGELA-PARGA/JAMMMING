
function Track({song, onClickAdd, isInPlaylist, onClickRemove}){

    function handleOnClick(){
        if (isInPlaylist){
            onClickRemove(song); 
        } else {
            onClickAdd(song);
        }                       
    }

    const actionButton = isInPlaylist ? "-" : "+";

    return(
        <div>
            <div>
                <h3>{song.name}</h3>
                <p>{song.artist} | {song.album}</p>
            </div>
            <div>
                <p>{song.duration}</p>
            </div>
            <button onClick={handleOnClick}>{actionButton}</button>
        </div>
    )
}

export default Track;