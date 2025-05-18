'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import Layout from './Layout';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function UserRolePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.replace('/course');
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/auth');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await axiosInstance.put('/auth/update', { userId, role: newRole });
      toast.success('Role Updated.');
      fetchUsers();
    } catch (error) {
      toast.error('Update failed.');
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="min-h-screen p-6 md:p-10 bg-gradient-to-br from-orange-100 to-yellow-200"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-600">
          Manage User Roles
        </h1>

        {loading ? (
          <p className="text-center text-orange-600 font-semibold">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <motion.table
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full bg-white shadow-xl rounded-xl overflow-hidden"
            >
              <thead className="bg-orange-500 text-white text-left">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    whileHover={{ scale: 1.01 }}
                    className="border-b hover:bg-orange-50 transition-all text-black"
                  >
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateRole(user._id, e.target.value as 'user' | 'admin')
                        }
                        className="border border-orange-300 px-3 py-2 rounded-lg bg-white text-orange-700 hover:bg-orange-100 transition"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
