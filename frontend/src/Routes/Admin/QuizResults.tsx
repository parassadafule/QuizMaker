import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface QuizAttempt {
  id: number;
  user_name: string;
  score: number;
  completed_at: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
}

export default function QuizResults() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setError('Quiz ID is required');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const quiz = await authFetch(`${BACKEND_URL}/quizzes/${quizId}/`);
        setQuiz(quiz);

        const attempts = await authFetch(`${BACKEND_URL}/quizzes/${quizId}/attempts/`);
        setAttempts(attempts);

        setLoading(false);
      } catch (err: any) {
          console.error('Error fetching quiz results:', err);
          setError(err.message || 'Failed to load quiz results');
          setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center">Loading quiz results...</div>
        </div>
      </div>
    );
  }

  if(error) {
    return (
      <div className="text-center py-8 text-red-600">
        <h1 className="text-2xl font-semibold text-red-900 mb-2">Error</h1>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-semibold text-red-900 mb-2">Quiz Not Found</h1>
          <p className="text-red-700">The requested quiz could not be found.</p>
        </div>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const averageScore = totalAttempts > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Results: {quiz.title}</h1>

        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Attempts</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{totalAttempts}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Average Score</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{averageScore}%</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Attempts</h2>
            {attempts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No attempts yet for this quiz.
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{attempt.user_name}</p>
                        <p className="text-sm text-slate-500">
                          Completed: {new Date(attempt.completed_at).toLocaleDateString()} at {new Date(attempt.completed_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-semibold text-emerald-600">{attempt.score}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}