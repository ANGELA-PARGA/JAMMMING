import { useState, useEffect } from 'react';
import Authentication from './components/Authentication/Authentication';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResult from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './assets/Spotify';
import styles from './App.module.css';
import PlaylistList from './components/PlaylistList/PlaylistList';

function App() {
  // all states
  const [authorize, setAuthorize] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [savedPlaylists, setSavedPlaylists] = useState([])

  //authorization log in and log out functionality
  useEffect(()=>{    
    const IsThereAToken = Spotify.getAccessToken();
    setAuthorize(!!IsThereAToken)
  },[])

  useEffect(()=>{    
    if (authorize){ 
      Spotify.getUserPlaylists().then((arrayOfSavedPlaylist)=>{
        setSavedPlaylists(arrayOfSavedPlaylist)
      })
    }
  },[authorize])
  
  function logInAction(){
    Spotify.redirectToAuthorization();    
  }

  function logOutAction(){
    Spotify.logOutAction()
    setAuthorize(false);
  }

  // searchBar functionality
  function handleSearchChange(e){
    setSearch(e.target.value);
  }
  function searchAction(search){
    Spotify.search(search).then((searchResult)=> {
      setSearchResult(searchResult)
    })
  }

  //track functionality
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

  //Playlist functionality
  function handleChangeName(e){
    setPlaylistName(e.target.value);
  }
  function handleSubmitPlaylist(){
    const trackUris = playlist.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris).then(() => {
      setPlaylistName("");
      setPlaylist([]);
      Spotify.getUserPlaylists().then((arrayOfSavedPlaylist)=>{
        setSavedPlaylists(arrayOfSavedPlaylist)
      })
    });
  }

  function renderSavedPlaylists(id, name){
    Spotify.getPlaylistsTracks(id).then((savedPlaylistTracks)=>{
      setPlaylist(savedPlaylistTracks);
      setPlaylistName(name);
    })
  }

  function closePlaylist(){
    setPlaylist([]);
  }

  //JSX components
  return (
    <div className={styles.mainApp}>
      <header>
        <h1 className={styles.h1}>JAMMMING BROWSER</h1>
      </header>
      <main>
        <Authentication 
        state={authorize} 
        logInAction={logInAction} 
        logOutAction={logOutAction}
        />
        {authorize ? (
        <>
        <div>
          <SearchBar 
            inputValue={search} 
            onChangeEvent={handleSearchChange}
            onButtonClick={searchAction}
          />
        </div>
        <div className={styles.tracklist}>
          <SearchResult  
            resultingSongs={searchResult} 
            onClickAdd={addSong}          
          />
          <div>
            <h2>{!playlistName ? `My new Playlist`: playlistName}</h2>
            <Playlist
            songList={playlist}
            onClickRemove={removeSong}
            inputValue={playlistName} 
            onInputChange={handleChangeName}
            handleSubmitPlaylist={handleSubmitPlaylist}
            closePlaylist={closePlaylist}
            />
          </div>
        </div>
        <div>
          <h2>Your Spotify Playlists</h2>
          <PlaylistList
            playlistsList={savedPlaylists}
            savedPlaylistRender={renderSavedPlaylists}
          />
        </div>
        </> ) : (
        <></>)}
      </main>
    </div>
  );
}

export default App;
