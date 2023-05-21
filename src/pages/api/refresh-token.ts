import { SPOTIFY_AUTHORIZATION_HEADER, SPOTIFY_REDIRECT_URI, SPOTIFY_TOKEN_ENDPOINT } from '@/spotify'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const spotifyRequest = new Request(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: SPOTIFY_AUTHORIZATION_HEADER,
      'Content-type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${req.query.token}`,
  });

  const spotifyResponse = await fetch(spotifyRequest);
  const json = await spotifyResponse.json();

  res.status(200).json({
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_in: json.expires_in,
  });
}
