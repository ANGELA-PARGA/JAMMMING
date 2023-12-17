
function SavedPlaylist({name, id, render}){

    return(
        <div>
            <button onClick={()=>render(id, name)}>{name}</button>
        </div>
    )
}

export default SavedPlaylist;