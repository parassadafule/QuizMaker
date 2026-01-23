import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function JoinQuiz() {
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!quizCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const quiz = await authFetch(`${BACKEND_URL}/quizzes/join/${quizCode}/`);
      navigate(`/student/quiz-attempt/${quiz.id}`);
    } catch (error: any) {
      console.error('Error joining quiz:', error);
      setError(error.message || 'Quiz not found or not available');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">Join Quiz</h1>
            <p className="text-slate-600 text-center mb-8">Enter the quiz code provided by your instructor</p>

            <div className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quiz Code</label>
                <input type="text" value={quizCode} onChange={(e) => setQuizCode(e.target.value.toUpperCase())} placeholder="Enter quiz code"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={8}/>
              </div>

              <button onClick={handleJoin} disabled={!quizCode.trim() || loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
                {loading ? 'Joining...' : 'Join Quiz'}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Don't have a code? Contact your instructor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}