import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../lib/axios';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

const SignupPage = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', { name, email, password }, { withCredentials: true });
      alert('Signup Successful! Please Login.');
      router.push('/login');
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        alert(axiosError.response.data.message || 'Signup Failed');
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-200">
      <form onSubmit={handleSignup} className="bg-white p-10 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl mb-8 text-center font-extrabold text-orange-500">Signup</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 p-3 border border-orange-300 rounded-xl text-gray-800 focus:outline-none placeholder-orange-300 focus:ring-2 focus:ring-orange-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border border-orange-300 text-gray-800 rounded-xl focus:outline-none placeholder-orange-300 focus:ring-2 focus:ring-orange-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 border border-orange-300 rounded-xl text-gray-800 focus:outline-none placeholder-orange-300 focus:ring-2 focus:ring-orange-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-orange-400 hover:bg-orange-500 text-white p-3 rounded-xl font-semibold transition duration-300">
          Signup
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-orange-500 font-medium hover:underline">Login</a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
