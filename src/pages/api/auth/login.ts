import type { NextApiRequest, NextApiResponse } from 'next';
import axios from '../../../lib/axios';
import { AxiosError } from 'axios'; // ✅ Import AxiosError

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { data } = await axios.post('/auth/login', req.body);
      res.status(200).json(data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>; // ✅ Assert type

      res
        .status(axiosError.response?.status || 500)
        .json({ message: axiosError.response?.data?.message || 'Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
