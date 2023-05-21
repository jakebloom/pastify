import Playlist from '@/components/Playlist';
import { SPOTIFY_AUTH_URI, useSpotifyPlaylist, useSpotifyToken } from '@/spotify';
import { Inter } from 'next/font/google'
import queryString from 'query-string';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [authorizationCode, setAuthorizationCode] = useState<string>()
  const {token} = useSpotifyToken(authorizationCode);
  const [content, setContent] = useState('');
  const [contentForProps, setContentForProps] = useState('');
  const isLoggedIn = token !== null;
  

  useEffect(() => {
    const params = queryString.parse(window.location.search);
    if (typeof params.code === 'string') {
      setAuthorizationCode(params.code);
    }
  }, []);

  return (
    <main
      className={`flex h-screen flex-col items-center p-24 ${inter.className} gap-8`}
    >
      {!isLoggedIn ? <a href={SPOTIFY_AUTH_URI}>Log in with spotify</a> : null}
      {isLoggedIn ? <div className='flex flex-col gap-8 flex-1 w-full overflow-hidden'>
        <div className='flex w-full gap-8 flex-1 overflow-hidden'>
          <textarea
            className='flex-1 p-4 overflow-auto'
            value={content}
            onChange={e => setContent(e.target.value)}
            />
          <div className='flex-1 overflow-auto'>
            <Playlist content={contentForProps} />
          </div>
        </div>
        <button onClick={() => setContentForProps(content)}>Generate Playlist</button>
      </div> : null}
    </main>
  )
}
