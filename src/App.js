import './App.css';
import { useState } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResult from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import songData from './assets/UtilityData';

function App() {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState('');

  function handleSearchChange(e){
    setSearch(e.target.value);
  }

  function searchAction(search){
    setSearchResult(songData.filter((song) =>(song.name.includes(search) || song.album.includes(search))      
    ))
  }

  function addSong(song){    
    if (playlist.some((currentSong) => currentSong.id === song.id)){
      return;
    }
    setPlaylist((prevPlayList) => [...prevPlayList, song])
  }

  function removeSong(song){
    setPlaylist((prevPlayList) => 
      prevPlayList.filter((currentSong) => currentSong.id !== song.id )
    )
  }

  function handleChangeName(e){
    setPlaylistName(e.target.value);
  }

  function handleSubmitPlaylist(e){
    //not yet//
  }

  return (
    <div className="App">
      <header>
        <h1>JAMMMING BROWSER</h1>
      </header>
      <main>
        <div>
          <SearchBar 
            inputValue={search} 
            onChangeEvent={handleSearchChange}
            onButtonClick={searchAction}
          />
        </div>
        <div>
          <SearchResult  
            resultingSongs={searchResult} 
            onClickAdd={addSong}           
          />
          <Playlist
            songList={playlist}
            onClickRemove={removeSong}
            inputValue={playlistName} 
            onInputChange={handleChangeName}
            handleSubmitPlaylist={handleSubmitPlaylist}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
