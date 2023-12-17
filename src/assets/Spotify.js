const clientID = "3c4a15564c564c63bbd3d896fcd46746";
const redirectURI = "http://localhost:3000";
const endpoint = "https://accounts.spotify.com/authorize"
const scope = [
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-read-email'
]
let accessToken;

const Spotify = {

  async getUserId(token){
    try {
      const response = await fetch(`https://api.spotify.com/v1/me`, {
        headers: {Authorization: `Bearer ${token}`}
      })
      if (!response){
        throw new Error('Request failed');
      }
      const responseJson =  await response.json();
      return responseJson.id
    } catch (error){
      console.log('Error fetching user ID from Spotify:', error)
    }
  },

  redirectToAuthorization(){
    const accessUrl = `${endpoint}?client_id=${clientID}&response_type=token&scope=${scope.join(" ")}&redirect_uri=${redirectURI}&show_dialog=true`;
    window.location = accessUrl;
  },

  creatingNewTokenURL(){
    const accessUrl = `${endpoint}?client_id=${clientID}&response_type=token&scope=${scope.join(" ")}&redirect_uri=${redirectURI}`;
    window.location = accessUrl;
  },

  logOutAction(){
    accessToken = null;
    window.history.pushState('Access Token', null, '/')    
  },

  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    let accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    let expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if(accessTokenMatch&&expiresInMatch){
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => {
      accessToken = null;
      }, expiresIn * 1000);//for testing 20000
      // This clears the parameters, allowing us to grab a new access token when it expires.
      window.history.pushState('Access Token', null, '/')
      return accessToken;
    } else {
      this.creatingNewTokenURL();      
    }   
  },

  async search(term) {
    const accessToken = Spotify.getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) {
      return [];
    }
  
    return jsonResponse.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri
    }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }
    const accessToken = Spotify.getAccessToken();
    let userID= await this.getUserId(accessToken);

    try{
      const response =  await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
        headers: {Authorization: `Bearer ${accessToken}`},
        method: 'POST',
        body: JSON.stringify({name: name})
      })
      if (!response.ok){
        throw new Error('Creating playlist name failed')
      }
      const responseJson = await response.json();
      const playlistID = responseJson.id;

      const creatingPlaylist= await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
        headers: {Authorization: `Bearer ${accessToken}`},
        method: 'POST',
        body: JSON.stringify({uris: trackUris})
      });

      if (!response.ok){
        throw new Error('Creating Playlist items failed')
      }

      return creatingPlaylist;
      
    }catch(error){
      console.log('Error saving the new playlist in Spotify:', error)
      throw error;
    }
  
  },

  async getUserPlaylists(){
    const accessToken = Spotify.getAccessToken();
    let userID= await this.getUserId(accessToken); 
    
    try{
      const response =  await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
        headers: {Authorization: `Bearer ${accessToken}`},
      })
      if (!response.ok){
        throw new Error('Request failed')
      }
      const responseJson = await response.json();
      if (!responseJson.total){
        return [];
      }   

      return responseJson.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        uri: playlist.uri
      }));

    }catch(error){
      console.log('Error retrieving the saved playlists in Spotify:', error)
      throw error;
    }  
  },

  async getPlaylistsTracks(playlistID){
    const accessToken = Spotify.getAccessToken();
    let userID= await this.getUserId(accessToken); 
    
    try{
        const retrievingPlaylistTracks= await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
        headers: {Authorization: `Bearer ${accessToken}`},
      })
      if (!retrievingPlaylistTracks.ok){
        throw new Error('Retrieving playlist tracks failed')
      }
      const responseJson = await retrievingPlaylistTracks.json();

      return responseJson.items.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        uri: item.track.uri
      }));

    }catch(error){
      console.log('Error retrieving tracks from a saved playlist in Spotify:', error)
      throw error;
    }  
  },
};

export default Spotify;
