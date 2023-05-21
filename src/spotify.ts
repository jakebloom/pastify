import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import { AsyncState } from 'react-use/lib/useAsyncFn';

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
export const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
export const SPOTIFY_AUTHORIZATION_HEADER = 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');
const SPOTIFY_SCOPE = process.env.NEXT_PUBLIC_SPOTIFY_SCOPE;
const SPOTIFY_SEARCH_API = "https://api.spotify.com/v1/search";

export const SPOTIFY_AUTH_URI = "https://accounts.spotify.com/authorize?" + queryString.stringify({
  response_type: 'code',
  client_id: SPOTIFY_CLIENT_ID,
  scope: SPOTIFY_SCOPE,
  redirect_uri: SPOTIFY_REDIRECT_URI,
});

interface UseSpotifyToken {
  token: string | null;
  reloadToken: () => void;
}

export const useSpotifyToken = (code?: string): UseSpotifyToken  => {
  const [token, setToken] = useState<string | null>(null);

  const reloadToken = () => {
    refreshTokenIfRequired().then(() => {
      const accessToken = localStorage.getItem("accessToken");
      setToken(accessToken);
    })
  }

  useEffect(() => {
    if (code) {
      fetch(`/api/spotify-token?${queryString.stringify({code})}`)
        .then(res => res.json())
        .then((data) => {
          setTokenStorage(data);
          reloadToken();
        });
    }
  }, [code]);

  useEffect(() => {
    reloadToken();
  }, []);
  

  return {
    token,
    reloadToken,
  }
}

interface SpotifyTokenPayload {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
}

export const setTokenStorage = ({
  access_token: accessToken,
  expires_in: expiresIn,
  refresh_token: refreshToken,
}: SpotifyTokenPayload) => {
  if (accessToken && expiresIn && refreshToken) {
    const now = (new Date()).valueOf();
    const expiresAt = now + (expiresIn * 1000);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("expiresAt", expiresAt.toString());
    localStorage.setItem("refreshToken", refreshToken);
  }
}

const refreshTokenIfRequired = async () => {
    const expiresAtStr = localStorage.getItem("expiresAt");
    const refreshToken = localStorage.getItem("refreshToken");

    if (expiresAtStr === null || refreshToken === null) {
      return;
    }

    const expiresAt = parseInt(expiresAtStr);
    const now = (new Date()).valueOf();
    if (now > expiresAt) {
      // refresh the token
      const res = await fetch(`/api/spotify-token?${queryString.stringify({token: refreshToken})}`);
      const resJson = await res.json();
      setTokenStorage(resJson);
    }
}

export interface SpotifySong {
  title: string;
  artist: string;
}

export const useSpotifyPlaylist = (content: string): AsyncState<SpotifySong[][]> => {
  const {token} = useSpotifyToken();
  return useAsync(async () => {
    const res = await Promise.all(content.split("\n").map(async (c) => {
      if (token === null) {
        return [];
      }
      if (c.trim().length === 0) {
        return [];
      }

      const url = queryString.stringifyUrl({
        url: SPOTIFY_SEARCH_API,
        query: {
          q: `track:${c}`,
          type: 'track',
          market: 'US',
          limit: 10,
        },
      });

      const request = new Request(url, { headers: {
        Authorization: `Bearer ${token}`
      }});
      const res = await fetch(request);
      const resJson = await res.json();

      const tracks = resJson.tracks;
      if (tracks && tracks.items) {
        
        return tracks.items.map((track: {name: string, artists: {name: string}[]}) => ({
          title: track.name,
          artist: track.artists.map((a: {name: string}) => a.name).join(", "),
        }));
      }
      return null;
    }));
    return res.filter(notNullSong);
  }, [content, token]);
};

function notNullSong(song: SpotifySong[] | null): song is SpotifySong[] {
  return song !== null && song.length > 0;
}