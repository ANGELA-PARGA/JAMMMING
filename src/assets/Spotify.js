/*Handle the API and the functionality of the application:
1. currentToken: Object with the token information and a function to store it. Set 
the expiration time.
2. redirectToauthorize: get the codes using the utilities functions at the bottom
and request for user authorization (Authorization code with PKCE extension)
3. handleRedirectAfterAuthorization: uses the URL code to request a token with the callback
function: getToken
4. getToken: get the token using the code_verifier, and stored it as an object. It's called
in handleRedirectAfterAuthorization.
5. removeCodeFromURL: remove the code from the URL
6. getAccessToken: return the token when called. If the token is expired, it calls refreshToken
7. getRefreshToken: get a new token using refresh_token.
8. logOutAction: clear the storage and redirect the user.
*/
const clientID = "3c4a15564c564c63bbd3d896fcd46746";
const redirectURI = "http://localhost:3000";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const authUrl = new URL("https://accounts.spotify.com/authorize")
const scope = [
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-read-email'
]

const Spotify = {
    currentToken: {
        get access_token(){
            return localStorage.getItem('access_token')
        },
        get refresh_token(){
            return localStorage.getItem('refresh_token')
        },
        get expires_in(){
            return localStorage.getItem('expires_in')
        },
        get expires(){
            const expiryTimeString = localStorage.getItem('expires');
            return expiryTimeString ? new Date(parseInt(expiryTimeString)) : null;
        },

        save(response){
            const { access_token, refresh_token, expires_in } = response;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('expires_in', expires_in);

            const now = new Date();
            const expiry = now.getTime() + (expires_in * 1000);
            localStorage.setItem('expires', expiry);
        }
    },
    
    async redirectToauthorize(){
        const codeVerifier = this.generateRandomString(64);  
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
        window.localStorage.setItem('code_verifier', codeVerifier);

        const params = {
        response_type: 'code',
        client_id: clientID,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectURI,
        };
        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    },

    async handleRedirectAfterAuthorization() {
        console.log('se llama handle redirect y se busca codigo');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            console.log('se encontró code');
            const token = await this.getToken(code);            
            if(token){
                console.log('se termina getToken y se guarda el token y retorna el access_token');
                this.currentToken.save(token);
                this.removeCodeFromURL();
                console.log('access_token:', this.currentToken.access_token);
                console.log('refresh_token:', this.currentToken.refresh_token);
                return this.currentToken.access_token;
            } else {
                console.error("Token not obtained in handleRedirectAfterAuthorization");
                return false;
            }
        }
    },

    async getToken(code) {
        console.log('se llama gettoken');
        const codeVerifier = localStorage.getItem('code_verifier');
        try {
            const response = await fetch(tokenEndpoint,{
                method: 'POST',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                client_id: clientID,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectURI,
                code_verifier: codeVerifier,
                }),
            });
            if (!response.ok){
                console.error('Response status:', response.status);
                console.error('Response status text:', response.statusText);
                const errorResponse = await response.text();
                console.error('Response body:', errorResponse);
                return null;
                
            }
            const data = await response.json();
            console.log('respuesta obtenida en getToken:', data);        
            return data;
        } catch (error) {
            console.log('Error fetching the token in getToken:', error)
            return null;      
        }    
    },

    removeCodeFromURL() {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        const updatedUrl = url.toString();
        window.history.replaceState({}, document.title, updatedUrl);
        console.log(`URL cleaned up: ${updatedUrl}`); // Debug
    },

    async getAccessToken() {
        console.log('llamando a getAccessToken:');      
        if (!this.currentToken.access_token){
            await this.redirectToauthorize()
        }
        if(this.currentToken.access_token && Date.now() > this.currentToken.expires.getTime()){
            return await this.getRefreshToken();
        }
        return this.currentToken.access_token;        
    },

    async getRefreshToken() { 
        console.log('llamando a getAccessRefreshToken:');   
        try {
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.currentToken.refresh_token,
                client_id: clientID
                }),
            });
            if(!response.ok){
                console.error('Response status:', response.status);
                console.error('Response status text:', response.statusText);
                const errorResponse = await response.text();
                console.error('Response body:', errorResponse);
                throw new Error('Failed to refresh token');
            }
            const token = await response.json();
            this.currentToken.save(token)
            console.log('se logro getAccessRefreshToken:', this.currentToken.refresh_token, this.currentToken.access_token);
            return this.currentToken.access_token;
        } catch (error){
            console.error('Error refreshing token:', error);
            this.redirectToauthorize();
        }          
    },

    logOutAction() {
        localStorage.clear();
        window.location.href = redirectURI;
    },

    async getUserId(token){
        console.log('llamando a getUserID:');
        try {
            const response = await fetch(`https://api.spotify.com/v1/me`, {
                headers: {Authorization: `Bearer ${token}`}
            })
            if (!response.ok){
                console.error('Response status:', response.status);
                console.error('Response status text:', response.statusText);
                const errorResponse = await response.text();
                console.error('Response body:', errorResponse);
                throw new Error('Request failed');
            }
            const responseJson =  await response.json();
            return responseJson.id
        } catch (error){
            console.log('Error fetching user ID from Spotify:', error)
        }
    },

    async getUsername(token){
        console.log('llamando a getUsername:');
        let userID= await this.getUserId(token);
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

    async search(term) {
        console.log('llamando a search:');
        let accessToken = await this.getAccessToken();
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
        let accessToken = await this.getAccessToken();
        let userID= await this.getUserId(accessToken);

        if(id){      
            if(name !== originalName){
                try{
                    const renamingPlaylist= await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${id}`, {
                        headers: {Authorization: `Bearer ${accessToken}`},
                        method: 'PUT',
                        body: JSON.stringify({ name: name })
                    });
                    if (!renamingPlaylist.ok){
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
        console.log('llamando a getUserPlaylist:');
        let accessToken = await this.getAccessToken();
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
        let accessToken = await this.getAccessToken();
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

    // utilities methods for the Authorization code with PKCE extension//
    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },

    async generateCodeChallenge(codeVerifier) {
        const hashed = await this.sha256(codeVerifier);
        return this.base64urlencode(hashed);
    },

    async sha256(plain) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    },

    base64urlencode(a) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
};

export default Spotify;
