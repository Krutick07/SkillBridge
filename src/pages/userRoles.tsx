import {useState,useEffect, use} from 'react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import Layout from './Layout';
import { useRouter } from 'next/navigation';


interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

export default function userRolePage() {
    const [users,setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [role,setRole] =useState<String | null>(null);

    const router = useRouter();
    useEffect(()=>{
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
        }
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            router.replace('/course'); // or home page
        }
        fetchUsers();
    }, []);

    const fetchUsers =async () => {
        setLoading(true);
        try{
            const res = await axiosInstance.get('/auth');
            setUsers(res.data);
        }catch(error){
            toast.error("Failed to load users");
        }
        setLoading(false);
    }

    const updateRole = async (userId: string,  newRole: 'user' | 'admin') => {
        try{
            await axiosInstance.put('/auth/update',{userId,role: newRole});
            toast.success("Role Updated.");
            fetchUsers();
        }catch(error){
            toast.error("Update fail.");
        }
    }

    return(
        <Layout>
            <div className="min-h-screen p-8 bg-gradient-to-br from-orange-100 to-yellow-200">
                <h1 className="text-3xl font-bold mb-6 text-center text-orange-600">Manage User Role</h1>
                {loading ? (
                    <p>Loading...</p>
                ):(
                    <div className="overflow-x-auto">
                        <table className="w-full bg-gray shadow-md rounded-xl">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} className="border text-black">
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3">{user.email}</td>
                                        <td className="p-3">
                                            <select value={user.role} onChange={(e) => updateRole(user._id, e.target.value as 'user' | 'admin')} className="border p-2 rouded-xl bg-transperent">
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    )
}