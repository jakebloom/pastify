import { SpotifySong, useSpotifyPlaylist } from "@/spotify";
import { useState } from "react";

interface Props {
  content: string
}

interface PlaylistItemProps {
  songs: SpotifySong[];
}

function PlaylistItem({songs}: PlaylistItemProps): JSX.Element {
  const [selected, setSelected] = useState(songs[0]);
  return <div>
    <select className="w-full">
      {songs.map(s => <option>{s.title} - {s.artist}</option>)}
    </select>
  </div>
}

export default function Playlist({content}: Props): JSX.Element {
  const {value: playlist} = useSpotifyPlaylist(content);

  return <>
    {playlist?.map(p => <PlaylistItem songs={p} />)}
  </>
}