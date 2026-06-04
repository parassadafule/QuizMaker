import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    grade: '',
    institution: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) 
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) 
      newErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) 
      newErrors.username = 'Username is required';
    if (!formData.email.trim()) 
      newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) 
      newErrors.email = 'Email is invalid';

    if (!formData.password) 
      newErrors.password = 'Password is required';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (isStudent) {
      if (!formData.grade.trim()) 
        newErrors.grade = 'Grade is required';
      if (!formData.institution.trim()) 
        newErrors.institution = 'Institution is required';
    } else {
      if (!formData.bio.trim()) 
        newErrors.bio = 'Bio is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (a: React.FormEvent) => {
    a.preventDefault();

    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsLoading(true);

    try{
      const userRole = isStudent ? 'student' : 'admin';
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        cnf_password: formData.confirmPassword,
        role: userRole,
        bio: formData.bio,
        ...(isStudent && { grade: formData.grade, institution: formData.institution }),
      };

      const response = await fetch(`${BACKEND_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) 
        navigate(`/auth/login?role=${role}`);
      
    } catch (error) {
        setErrors({ general: 'Network error. Please try again.' });
    }  finally {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create {roleText} Account</h1>
          <p className="text-slate-600">Join QuizMaster and start {isStudent ? 'learning' : 'teaching'}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <input type="text" value={formData.firstName} onChange={(e) => updateFormData('firstName', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                  ${errors.firstName ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="First"/>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <input type="text" value={formData.lastName} onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                  ${errors.lastName ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="Last"/>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input type="text" value={formData.username} onChange={(e) => updateFormData('username', e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                ${errors.username ? 'border-red-300' : 'border-slate-200'}`}
                placeholder="Choose a unique username"/>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                ${errors.email ? 'border-red-300' : 'border-slate-200'}`}
                placeholder="Enter your email"/>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateFormData('password', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                  ${errors.password ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="Create a strong password"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                  ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="Confirm your password"/>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {isStudent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Grade
                  </label>
                  <select value={formData.grade} onChange={(e) => updateFormData('grade', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                    ${errors.grade ? 'border-red-300' : 'border-slate-200'}`}>
                    <option value="">Select your grade</option>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="College">College</option>
                  </select>
                  {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Institution
                  </label>
                  <input type="text" value={formData.institution} onChange={(e) => updateFormData('institution', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                    ${errors.institution ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="Your school/college"/>
                  {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bio
                </label>
                <textarea value={formData.bio} onChange={(e) => updateFormData('bio', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                  ${errors.bio ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="Tell us about yourself"/>
                {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
              </div>
            </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bio
                </label>
                <textarea value={formData.bio} onChange={(e) => updateFormData('bio', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 transition-colors 
                  ${errors.bio ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="Tell us about yourself"/>
                {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className={`w-full rounded-xl bg-${themeColor}-600 px-4 py-3 text-white font-semibold hover:bg-${themeColor}-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors`}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to={`/auth/login?role=${role}`} className={`text-${themeColor}-600 hover:text-${themeColor}-700 font-semibold`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}