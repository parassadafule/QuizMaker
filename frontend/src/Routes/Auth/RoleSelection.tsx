import { useNavigate } from 'react-router-dom';
import { FaBook, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    navigate(`/auth/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mb-4">
            <FaBook className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to QuizMaster</h1>
          <p className="text-slate-600">Choose your role to continue</p>
        </div>

        <div className="space-y-4">
          <button onClick={() => handleRoleSelect('student')}
            className="w-full rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <FaUserGraduate className="h-6 w-6" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-900">I'm a Student</h3>
                <p className="text-sm text-slate-600">Take quizzes and track your progress</p>
              </div>
            </div>
          </button>

          <button onClick={() => handleRoleSelect('teacher')}
            className="w-full rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                  <FaChalkboardTeacher className="h-6 w-6" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-900">I'm a Teacher</h3>
                <p className="text-sm text-slate-600">Create and manage quizzes</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <span className="text-emerald-600 font-medium">Select your role above to get started</span>
        </div>
      </div>
    </div>
  );
}