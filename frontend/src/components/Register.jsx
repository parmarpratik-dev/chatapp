import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authApi';

const Register = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    dob: "",
    gender: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("dob", form.dob);
      formData.append("gender", form.gender);
      formData.append("image", image);
      
      setLoading(true);

      await registerUser(formData);
      setMessage("Registered Successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-gray-100 font-sans">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 md:p-8">
        <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4 mb-6">
          Register
        </h2>
  
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            value={form.username} 
            onChange={handleChange} 
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm py-2.5 px-4 rounded-xl placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
  
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
  
          <input 
            type="date" 
            name="dob" 
            value={form.dob} 
            onChange={handleChange} 
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm py-2.5 px-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
  
          <select 
            name="gender" 
            value={form.gender} 
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm py-2.5 px-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          
          <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm py-2.5 px-4 rounded-xl"
            />
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition-colors mt-2 cursor-pointer flex items-center justify-center"
          >
            {loading ? 
            (
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
            )
            : ("Register")}
          </button>
        </form>
  
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 p-2.5 rounded-xl">
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-400 hover:underline font-semibold"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;