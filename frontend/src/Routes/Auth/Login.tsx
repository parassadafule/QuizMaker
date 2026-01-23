import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { saveToken } from '../../utils/auth.ts';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'student';

  useEffect(() => {
    if (!role || !['student', 'teacher'].includes(role)) {
      navigate('/');
    }
  }, [role, navigate]);

  const isStudent = role === 'student';
  const themeColor = isStudent ? 'blue' : 'emerald';
  const RoleIcon = isStudent ? FaUserGraduate : FaChalkboardTeacher;
  const roleText = isStudent ? 'Student' : 'Teacher';
  // const demoUsername = isStudent ? 'student' : 'admin1';
  // const demoPassword = isStudent ? 'student123' : 'admin123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/login/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username, password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        saveToken(data);
        if (isStudent) {
          navigate('/student/join-quiz');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${themeColor}-50 text-${themeColor}-700 mb-4`}>
            <RoleIcon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back, {roleText}</h1>
          <p className="text-slate-600">Sign in to your QuizMaster account</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors`}
                placeholder="Enter your username"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className={`w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors`}
                  placeholder="Enter your password"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className={`w-full rounded-xl bg-${themeColor}-600 px-4 py-3 text-white font-semibold hover:bg-${themeColor}-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors`} >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to={`/auth/register?role=${role}`} className={`text-${themeColor}-600 hover:text-${themeColor}-700 font-semibold`}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}