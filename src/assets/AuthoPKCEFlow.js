/**/
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
            return localStorage.getItem('expires')
        },

        save(response){
            const { access_token, refresh_token, expires_in } = response;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('expires_in', expires_in);

            const now = new Date();
            const expiry = new Date(now.getTime() + (expires_in * 1000));
            localStorage.setItem('expires', expiry);
        }
    },
    // utilities functions at the bottom
    async redirectToauthorize(){
        const codeVerifier = this.generateRandomString(64);
        sessionStorage.setItem('debug_codeVerifier', codeVerifier); //debug   
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
        sessionStorage.setItem('debug_codeChallenge', codeChallenge); //debug 
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
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log(`code before the if ${code}`)
        if (code) {
            console.log(`auth code inside handleredirect ${code}`) //debug 
            console.log('Debug codeVerifier in handleredirect:', sessionStorage.getItem('debug_codeVerifier')); //debug 
            console.log('Debug codeChallenge: in handleredirect', sessionStorage.getItem('debug_codeChallenge')); //debug 
            const token = await this.getToken(code);
            this.currentToken.save(token);
            console.log(`currentToken token saved ${localStorage.getItem('access_token')}`)
            console.log(`currentToken refresh token saved ${localStorage.getItem('refresh_token')}`)
            console.log(`currentToken token saved ${localStorage.getItem('expires_in')}`)
            console.log(`currentToken token saved ${localStorage.getItem('expires')}`)

            const url = new URL(window.location.href);
            url.searchParams.delete("code");
            const updatedUrl = url.search ? url.href : url.href.replace('?', '');
            console.log(`updated URL ${updatedUrl}`)            
            window.history.replaceState({}, document.title, updatedUrl);
        }
    },

    async getToken(code) {
        const codeVerifier = localStorage.getItem('code_verifier');
        console.log(`code from calling of getToken in handleredirect: ${code}`) //debug 
        console.log(`code verifier inside localStorage from calling of getToken: ${codeVerifier}`) //debug 

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
                throw new Error('Token Request failed');
            }
            const data = await response.json();
            console.log('Access token:', data.access_token); 
            console.log('Complete response data:', data);        
            return data;
        } catch (error) {
            console.log('Error fetching the token in getToken:', error)      
        }    
    },

    async getAccessToken() { 
        if (!this.currentToken.access_token){
            this.redirectToauthorize()
        }
        if(Date.now() > this.currentToken.expiry.getTime()){
            await this.getRefreshToken()
            return this.currentToken.access_token;
        }
        return this.currentToken.access_token;        
    },

    async getRefreshToken() {    
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
        const token = await response.json();
        this.currentToken.save(token)
    },

    logOutAction() {
        localStorage.clear();
        window.location.href = redirectURI;
    },

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

    // utilities methods//
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
