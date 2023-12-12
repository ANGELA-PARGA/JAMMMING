function SearchBar({inputValue, onChangeEvent, onButtonClick}){
    
    function handlerOnSubmit(e){
        e.preventDefault();
        return onButtonClick(inputValue);                
    }

    return (
        <div>
            <form action="" onSubmit={handlerOnSubmit}>
                <label htmlFor="inputSearch">Write song's name</label>
                <input id="inputSearch" type="text" value={inputValue} onChange={onChangeEvent}/>
                <button type='submit'>Search</button>
            </form>
        </div>
    )
}

export default SearchBar;