/*Spotify module manage the Spotify API with the following functions:
1. getUserId: gets and return the User's ID for following requests
1.1 getUsername: gets and return the user's name.
2. redirectToAuthorization: creates the path (and redirect) to request for data authorization
3. creatingNewTokenURL: creates the path (and redirect) to request for a new token
4. logOutAction: clean the URL and set the token to 'null'
5. getAccessToken: returns the token 'if exists' or search for a new one in the URL, set
the token's expiration time and clean the URL to request a new token
6. search: function to get and return the data using a search term
7. savePlaylist: function to create a new playlist or modify the name or the items from a 
saved playlist.
8. getUserPlaylists: function to get the playlist saved in the user's spotify account
9. getPlaylistsTracks: function to get the tracks from a playlist using its ID*/


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
      if (!response.ok){
        throw new Error('Request failed');
      }
      const responseJson =  await response.json();
      return responseJson.id
    } catch (error){
      console.log('Error fetching user ID from Spotify:', error)
    }
  },

  async getUsername(token){
    let userID= await this.getUserId(accessToken);
    try {
      const retrievengUserName = await fetch(`https://api.spotify.com/v1/users/${userID}`, {
        headers: {Authorization: `Bearer ${token}`}
      })
      if (!retrievengUserName.ok){
        throw new Error('Request user data failed');
      }
      const userInfoJson =  await retrievengUserName.json();
      return userInfoJson.display_name
    } catch (error){
      console.log('Error fetching user name from Spotify:', error)
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
      }, expiresIn * 1000);
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
    if(!response.ok){
      throw new Error ('unable to search songs')
    }
    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) {
      return [];
    }
  
    return jsonResponse.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri,
      duration: track.duration_ms,
      preview: track.preview_url
    }));
  },

  async savePlaylist(name, trackUris, id, originalName, originalTrackUris) {
    if (!name || !trackUris.length) {
      return;
    }
        
    const accessToken = Spotify.getAccessToken();
    let userID= await this.getUserId(accessToken);

    if(id){      
      if(name !== originalName){
        try{
          const renamingPlaylist= await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${id}`, {
            headers: {Authorization: `Bearer ${accessToken}`},
            method: 'PUT',
            body: JSON.stringify({ name: name })
          });
          if (!renamingPlaylist.ok)
          {
            throw new Error('Renaming Playlist failed')
          }        
        }catch(error){
          console.log('Error renaming the playlist in Spotify:', error)
          throw error;
        }
      }

      const arrayTrackUris = JSON.stringify(trackUris)
      const arrayOriginalTrack = JSON.stringify(originalTrackUris)

      if(arrayTrackUris !== arrayOriginalTrack){
        try{
          const modifyingPlaylist= await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${id}/tracks`, {
            headers: {Authorization: `Bearer ${accessToken}`},
            method: 'PUT',
            body: JSON.stringify({uris: trackUris}),
          });  
          if (!modifyingPlaylist.ok){
            throw new Error('Modifying Playlist failed')
          }  
          return modifyingPlaylist;        
        }catch(error){
          console.log('Error saving the modified playlist in Spotify:', error)
          throw error;
        }
      }
    }

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
      if (!creatingPlaylist.ok){
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
        uri: item.track.uri,
        duration: item.track.duration_ms,
        preview: item.track.preview_url
      }));

    }catch(error){
      console.log('Error retrieving tracks from a saved playlist in Spotify:', error)
      throw error;
    }  
  },
};

export default Spotify;
