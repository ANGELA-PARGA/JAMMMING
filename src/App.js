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

  const [username, setUsername] = useState('')
  const [search, setSearch] = useState(''); 
  const [searchResult, setSearchResult] = useState([]); 
  const [playlist, setPlaylist] = useState([]); 
  const [playlistName, setPlaylistName] = useState(''); 
  const [savedPlaylists, setSavedPlaylists] = useState([]) 
  const [savedplaylistID, setSavedPlaylistID] = useState(null); 
  const [savedPlaylistName, setSavedPlaylistName] = useState('');
  const [savedPlaylistURIs, setSavedPlaylistURIs] = useState([]);
  const authRequestSent = useRef(false);
  const authorize = useRef(false);


  useEffect(() => {
    console.log('el componente se esta montando');
    const accessToken = Spotify.currentToken.access_token;
    console.log('este es valor de accessToken antes de inicia', accessToken);
    console.log(new Date(Spotify.currentToken.expires))
    console.log(new Date())
    if (accessToken && new Date() < new Date(Spotify.currentToken.expires)) {
      console.log('se encontró token y no esta vencido');
      authorize.current = true;
      loadUserData(accessToken);
    } else {
      console.log('no hay token asi que se busca code en URL');
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      console.log('este es el code de url', code);
      console.log('este es el token', accessToken);
      if (code && !accessToken) {
        console.log('se encontro code se va a llamar a handleAuth');
        if (!authRequestSent.current){
          handleAuthorizationCode(code);
        }
      }
    }
  }, []);

  function handleAuthorizationCode(code){
    console.log('aqui en handleAuth se cambia authRequest a true y se llamaa handleRedirect');
    authRequestSent.current = true;
    Spotify.handleRedirectAfterAuthorization(code).then((tokenGotten) => {
      console.log('handleRedirect se completo y hay token');
      if (tokenGotten) {
        console.log('token existe!');
        authorize.current = true;
        loadUserData(tokenGotten);
      } else {
        console.error('No se pudo obtener el token');
      }
      authRequestSent.current = false;
      console.log('autheRequest regresa a false', authRequestSent.current);
    });
  };
  
  function loadUserData(token){
    Spotify.getUsername(token).then(setUsername);
    Spotify.getUserPlaylists().then(setSavedPlaylists);
  };

  function logInAction(){
    console.log('log in se esta llamando');
    Spotify.redirectToauthorize();
  }
    

  function logOutAction(){
    console.log('log out se esta llamando')
    Spotify.logOutAction()
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
