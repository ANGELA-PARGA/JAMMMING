
function Track({song, onAdd  }){
    function handlerOnAdd(){
        return onAdd(song);                
    }
    return(
        <div>
            <div>
                <h3>{song.name}</h3>
                <p>{song.artist} | {song.album}</p>
            </div>
            <div>
                <p>{song.duration}</p>
            </div>
            <button onClick={handlerOnAdd}>+</button>
        </div>
    )
}

export default Track;