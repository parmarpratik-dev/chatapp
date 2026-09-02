import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../services/authApi';

const Login = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
  
    try {
      const data = await loginUser(form);
      onLoginSuccess(data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-gray-100 font-sans">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 md:p-8">
        <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm py-2.5 px-4 rounded-xl placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm py-2.5 px-4 rounded-xl placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition-colors mt-2 cursor-pointer flex items-center justify-center"
          >
            {loading ? (
             <svg
             className="w-5 h-5 animate-spin"
             viewBox="0 0 24 24"
             fill="none"
           >
             <circle
               className="opacity-25"
               cx="12"
               cy="12"
               r="10"
               stroke="currentColor"
               strokeWidth="4"
             />
             <path
               className="opacity-75"
               fill="currentColor"
               d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
             />
           </svg>
            
          ) : (
            "Login"
          )}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-red-400 bg-gray-800 border border-gray-700 p-2.5 rounded-xl">
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-blue-400 hover:underline font-semibold"
          >
            Register here
          </Link>
        </div>
        <Link className="w-full bg-red-600 hover:bg-red-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition-colors mt-2 cursor-pointer flex items-center justify-center" to="/guest">Login As Guest</Link>
      </div>
    </div>
  );
};

export default Login;