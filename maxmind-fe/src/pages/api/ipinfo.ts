// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import GeoLocation from '../interface/GeoLocation'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeoLocation[] | Error>,
) {
  if (req.method === 'POST') {
    try {
      const ipAddresses = req.body.ipAddresses;
      const response = await fetch(process.env.NEXT_PUBLIC_MAXMIND_BE_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipAddresses }),
      });
      const data = await response.json();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json(error);
    }
  } else {
    res.status(400).json(new Error('Bad request'));
  }
}
