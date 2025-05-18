import type {NextApiRequest , NextApiResponse} from 'next';
import axios from '../../../lib/axios';
import {Axios, AxiosError} from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'GET'){
        try{
            const {data} = await axios.get('/courses');
            res.status(200).json(data);
        }catch(error){
            const axiosError = error as AxiosError<{ message: String}>;
            res.status(axiosError.response?.status || 500).json({message: axiosError.response?.data?.message || 'Error'});
        }
    }else if(req.method === 'POST'){
        try{
            const {data} = await axios.post('/courses', req.body);
            res.status(200).json(data);
        }catch(error){
            const axiosError = error as AxiosError<{ message: String}>;
            res.status(axiosError.response?.status || 500).json({message: axiosError.response?.data?.message || 'Error'});
        }
    }else{
        res.status(405).json({ message: 'method not allowed'});
    }
}