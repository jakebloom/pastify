import { SPOTIFY_AUTH_URI, useSpotifyPlaylist, useSpotifyToken } from '@/spotify';
import { Inter } from 'next/font/google'
import queryString from 'query-string';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [authorizationCode, setAuthorizationCode] = useState<string>()
  const {token} = useSpotifyToken(authorizationCode);
  const [content, setContent] = useState('');
  const isLoggedIn = token !== null;
  const {value: playlist} = useSpotifyPlaylist(content);

  useEffect(() => {
    const params = queryString.parse(window.location.search);
    if (typeof params.code === 'string') {
      setAuthorizationCode(params.code);
    }
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 ${inter.className} gap-8`}
    >
      {!isLoggedIn ? <a href={SPOTIFY_AUTH_URI}>Log in with spotify</a> : null}
      {isLoggedIn ? <p> Logged in to Spotify </p> : null }
      {isLoggedIn ? <div className='flex flex-col gap-8 flex-1 w-full'>
        <div className='flex w-full gap-8 flex-1'>
          <textarea
            className='flex-1 p-4'
            value={content}
            onChange={e => setContent(e.target.value)}
            />
          <div className='flex-1 h-full overflow-scroll'>
            {playlist?.map(p => <p>{p[0].title} - {p[0].artist}</p>)}
          </div>
        </div>
      </div> : null}
    </main>
  )
}
