import { useState, useEffect } from 'react';
import Authentication from './components/Authentication/Authentication';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResult from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './assets/Spotify';
import styles from './App.module.css';
import PlaylistList from './components/PlaylistList/PlaylistList';

function App() {

  const [authorize, setAuthorize] = useState(false); //login'state use for renderization of components
  const [username, setUsername] = useState('')
  const [search, setSearch] = useState(''); // search'state, used with Spotify.search to get the Search results
  const [searchResult, setSearchResult] = useState([]); // set the array of search results.
  const [playlist, setPlaylist] = useState([]); //set the array of playlists (new or saved playlists)
  const [playlistName, setPlaylistName] = useState(''); // set the playlist name (new or modified)
  const [savedPlaylists, setSavedPlaylists] = useState([]) // set the array of a saved playlists
  const [savedplaylistID, setSavedPlaylistID] = useState(null); // set the id of the selected saved playlist
  const [savedPlaylistName, setSavedPlaylistName] = useState(''); // set the name of the selected saved playlist
  const [savedPlaylistURIs, setSavedPlaylistURIs] = useState([]); // set the array of Uris of the selected saved playlist 

  //authorization log in and log out functionality
  useEffect(()=>{    
    const IsThereAToken = Spotify.getAccessToken();
    setAuthorize(!!IsThereAToken)
    if (IsThereAToken){
      Spotify.getUsername(IsThereAToken).then(username => {
        setUsername(username);
      })
      .catch(error => console.log(`${error} trying to get the user's name`));
    }    
  },[])

  function logInAction(){
    Spotify.redirectToAuthorization();   
  }

  function logOutAction(){
    Spotify.logOutAction()
    setAuthorize(false);
  }

  //rending saved playlists
  useEffect(()=>{    
    if (authorize){ 
      Spotify.getUserPlaylists().then((arrayOfSavedPlaylist)=>{
        setSavedPlaylists(arrayOfSavedPlaylist)
      })
      .catch(error => console.log(`${error} trying to get the saved playlists`))
    }
  },[authorize])

  /* searchBar functionality: handleSearchChange set the 'search' state with a term: 'song, artist, album'
  searchAction use the Spotify.search to get the search results and set the state searchResults
  to an array of Tracks */
  function handleSearchChange(e){
    setSearch(e.target.value);
  }
  function searchAction(search){
    Spotify.search(search).then((searchResult)=> {
      setSearchResult(searchResult)
    })
    .catch(error => console.log(`${error} trying to get search results`))    
  }

  /*track functionality: add or remove songs from playlist, setting the state of 'playlist' to an array
  adding Tracks or removing Tracks from the array*/
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

  /*Playlist functionality: change the playlist's name, update items or save new playlists.
  Uses Spotify.savePlaylist to save the made changes or the new playlist, then set the related 
  states to their original states.
  Uses Spotify.getUserPlaylists to get and render the saved playlists setting the 'savedPlaylist' state
  to an array of playlists. The function renderSavedPlaylistsTracks render the tracks of a 
  selected playlist setting the state of playlist to an array of Tracks*/

  function handleChangeName(e){
    setPlaylistName(e.target.value);
  }

  function handleSubmitPlaylist(){
    const trackUris = playlist.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris, savedplaylistID, savedPlaylistName, savedPlaylistURIs).then(() => {
      setPlaylistName("");
      setPlaylist([]);
      setSavedPlaylistID(null);
      setSavedPlaylistURIs([]);
      Spotify.getUserPlaylists().then((arrayOfSavedPlaylist)=>{
        setSavedPlaylists(arrayOfSavedPlaylist)
      })
      .catch(error => console.log(`${error} trying to update the saved playlists`))
    });
  }

  function renderSavedPlaylistsTracks(id, name){
    Spotify.getPlaylistsTracks(id).then((savedPlaylistTracks)=>{
      setPlaylist(savedPlaylistTracks);
      setPlaylistName(name);
      setSavedPlaylistName(name);      
      setSavedPlaylistID(id);
      setSavedPlaylistURIs(savedPlaylistTracks.uri)
    })
    .catch(error => console.log(`${error} trying to render a selected playlist`))
  }

  function closePlaylist(){
    setPlaylistName("");
    setPlaylist([]);
  }

  return (
    <div className={styles.mainApp}>
      <header className='headerContainer'>
        <h1 className={styles.h1}>JAMMMING BROWSER</h1>
        <Authentication 
          state={authorize} 
          logInAction={logInAction} 
          logOutAction={logOutAction}
          username={username}
          />        
      </header>
        {authorize ? (
      <main>
        <div>
          <SearchBar 
            inputValue={search} 
            onChangeEvent={handleSearchChange}
            onButtonClick={searchAction}
          />
        </div>
        <div className={styles.tracklist}>
          <div className={styles.results}>
            <h2>Results</h2>
            <SearchResult  
              resultingSongs={searchResult} 
              onClickAdd={addSong}          
            />
          </div>
          <div className={styles.playlist}>
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
          <div className={styles.savedPlaylists}>
            <h2>Your Spotify Playlists</h2>
            <PlaylistList
              playlistsList={savedPlaylists}
              renderPlaylistTracks={renderSavedPlaylistsTracks}
            />
          </div>
        </div>
      </main>) : (
      <></>)}
    </div>
  );
}

export default App;
