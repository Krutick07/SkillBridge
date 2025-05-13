import type {NextApiRequest,NextApiResponse} from 'next';
import axios from '../../../lib/axios';
import { AxiosError} from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {id }= req.query;

    if(req.method === 'DELETE'){
        try{
            const { data} = await axios.delete(`/courses/${id}`);
            res.status(200).json(data);
        }catch(error){
            const axiosError = error as AxiosError<{message: String}>;
            res.status(axiosError.response?.status || 500).json({message: axiosError.response?.data?.message || 'Error'});
        }
    }else if(req.method === 'PUT'){
        try{
            const { data } = await axios.put(`/courses/${id}`, req.body);
            res.status(200).json(data);
        }catch(error){
            const axiosError = error as AxiosError<{message: String}>;
            res.status(axiosError.response?.status || 500).json({message: axiosError.response?.data?.message || 'Error'});
        }
    }else{
        res.status(405).json({message: 'Method not allowed'});
    }
}
