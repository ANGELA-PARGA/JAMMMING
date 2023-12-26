/*This component render the search bar (form input and submit button). It handles the change of
the input value, and the handlerOnSubmit function calls the function onButtonClick passed from App.js
to make the search in the API*/

import styles from './SearchBar.module.css'

function SearchBar({inputValue, onChangeEvent, onButtonClick}){
    
    function handlerOnSubmit(e){
        e.preventDefault();
        return onButtonClick(inputValue);                
    }

    return (
        <div>
            <form 
                onSubmit={handlerOnSubmit} 
                className={styles.searchBar}                
            >
                <label htmlFor="inputSearch">Write song's name, album or artist</label>
                <input 
                    id="inputSearch" 
                    type="text"
                    placeholder='Name of the song, album or artist' 
                    value={inputValue} 
                    onChange={onChangeEvent}
                    className={styles.input}
                />
                <button type='submit' className={styles.button}>Search</button>
            </form>
        </div>
    )
}

export default SearchBar;