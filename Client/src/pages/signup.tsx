import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from '../lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface ErrorResponse {
  message: string;
}

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isMatch, setIsMatch] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Password strength checker
    const getStrength = (pwd: string) => {
      if (pwd.length < 6) return 'Weak';
      if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*]/.test(pwd)) return 'Strong';
      return 'Medium';
    };
    setPasswordStrength(getStrength(password));

    // Password match validation
    setIsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/auth/register', { name, email, password }, { withCredentials: true });
      toast.success('Signup Successful! Please Login.');
      router.push('/login');
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-400 p-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-2xl space-y-6 transition-all duration-500"
      >
        <h2 className="text-3xl mb-4 text-center font-extrabold text-white">Create Account</h2>

        {/* Name */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
          <input
            type="text"
            placeholder="Name"
            className="w-full pl-10 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 backdrop-blur-sm transition-all duration-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 backdrop-blur-sm transition-all duration-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full pl-10 pr-12 py-3 bg-white/70 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 backdrop-blur-sm transition-all duration-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Strength */}
        {password && (
          <p className={`text-sm font-medium transition-colors ${passwordStrength === 'Weak' ? 'text-red-600' : passwordStrength === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
            Password Strength: {passwordStrength}
          </p>
        )}

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            className={`w-full pl-10 pr-12 py-3 bg-white/70 border ${isMatch ? 'border-white/30' : 'border-red-500'} rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 backdrop-blur-sm transition-all duration-300`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {!isMatch && <p className="text-red-600 text-sm font-medium">Passwords do not match</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing up...</span>
            </>
          ) : (
            <span>Signup</span>
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white">
          Already have an account?{' '}
          <a href="/login" className="font-medium hover:text-blue-500 transition-colors">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
