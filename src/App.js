import { useState, useEffect, useRef } from 'react';
import AuthenticationLOGIN from './components/Authentication/AuthenticationLOGIN';
import AuthenticationLOGOUT from './components/Authentication/AuthenticationLOGOUT';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResult from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './assets/Spotify';
import styles from './App.module.css';
import PlaylistList from './components/PlaylistList/PlaylistList';

function App() {
  console.log('el componente App se montó')
  const [username, setUsername] = useState('')
  const [search, setSearch] = useState(''); 
  const [searchResult, setSearchResult] = useState([]);
  const [playlist, setPlaylist] = useState([]); 
  const [playlistName, setPlaylistName] = useState(''); 
  const [savedPlaylists, setSavedPlaylists] = useState([]) 
  const [savedplaylistID, setSavedPlaylistID] = useState(null); 
  const [savedPlaylistName, setSavedPlaylistName] = useState('');
  const [savedPlaylistURIs, setSavedPlaylistURIs] = useState([]);
  const authRequestSent = useRef(false); //if there's a request running is set to true
  const authorize = useRef(false); // if it's set to true, it renders the fundamental components

  /* verify if a token exists and if it's valid, then render the components. If not,
  search for a URL code to request the token. This occurs if the user has been redirected
  from the Spotify Auth page with the code in the URL */

  useEffect(() => {
    const accessToken = Spotify.currentToken.access_token;
    const expireTime = Spotify.currentToken.expires; 
    function handleAuthorizationCode(code){
      authRequestSent.current = true;
      Spotify.handleRedirectAfterAuthorization(code).then((tokenGotten) => {
        if (tokenGotten) {
          authorize.current = true;
          loadUserData(tokenGotten);
        } else {
          console.error('Error getting the token');
        }
        authRequestSent.current = false;
      });
    };  

    if (accessToken) {
      if (new Date() < expireTime){
        authorize.current = true;
        loadUserData(accessToken);
      } else {
        if (!authRequestSent.current){
          authRequestSent.current = true;
          Spotify.getRefreshToken().then((token)=>{
            authorize.current = true;
            loadUserData(token);
            authRequestSent.current = false;
          }).catch(()=>{
            console.log('Error getting a new token');
          })          
        }               
      }      
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code){
        if (!authRequestSent.current){
          handleAuthorizationCode(code);
        }
      } 
    }       
  },[]);
  
  function loadUserData(token){
    Spotify.getUsername(token).then(setUsername);
    Spotify.getUserPlaylists().then(setSavedPlaylists);
    const searchResultsStored = localStorage.getItem('searchResults');
    if (searchResultsStored){
      setSearchResult(JSON.parse(searchResultsStored))
    }
  };

  function logInAction(){
    Spotify.redirectToauthorize();
  }
    

  function logOutAction(){
    Spotify.logOutAction();
    authorize.current = false;
    authRequestSent.current = false;
  }

  /* searchBar functionality: handleSearchChange set the 'search' state with a term: 'song, artist, album'
  searchAction use the Spotify.search to get the search results and set the state searchResults
  to an array of Tracks */
  function handleSearchChange(e){
    setSearch(e.target.value);
  }
  function searchAction(search){
    Spotify.search(search).then((searchResults)=> {
      setSearchResult(searchResults)
      const searchResultsToSave = JSON.stringify(searchResults);
      localStorage.setItem('searchResults', searchResultsToSave)
    })
    .catch(error => console.log(`${error} trying to get search results`))    
  }

  /*track functionality: add or remove songs from playlist, setting the state of 'playlist' to an array
  adding or removing Tracks from the array*/

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
  Uses Spotify.savePlaylist to save the changes or the new playlist, then set the related 
  states to their original states. Uses Spotify.getUserPlaylists to get and render the saved 
  playlists setting the 'savedPlaylist' state to an array of playlists. The function 
  renderSavedPlaylistsTracks render the selected playlist's tracks*/

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
      </header>
        {authorize.current ? (
      <main>
        <AuthenticationLOGOUT
          logOutAction={logOutAction}
          username={username} 
        />        
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
      <>
        <AuthenticationLOGIN 
          logInAction={logInAction} 
        />
      </>)}
    </div>
  );
}

export default App;
