import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface QuizResult {
  score: number;
  obtained_marks: number;
  total_marks: number;
  total_questions: number;
  correct_answers: number;
  pending_answers: number;
}

export default function Result() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      if (!quizId) {
        setError('Quiz ID is required');
        setLoading(false);
        return;
      }

      try {
        const resultData = await authFetch(`${BACKEND_URL}/quizzes/${quizId}/result/`);
        setResult(resultData);
      } catch (error: any) {
        console.error('Error fetching result:', error);
        setError(error.message || 'Failed to load quiz result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if(isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <p className="mt-2 text-slate-600">Loading your results...</p>
      </div>
    );
  }

  if(error) {
    return (
      <div className="text-center py-8 text-red-600">
      <p>{error}</p>
      <button onClick={() => navigate('/student/my-results')} className="mt-2 underline">
        Back to My Results
      </button>
    </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-8 text-red-600">
        <h1 className="text-2xl font-semibold text-red-900 mb-2">Result not found</h1>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const percentage = result.total_marks > 0 ? Math.round((result.obtained_marks / result.total_marks) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h1>
          <p className="text-slate-600">Here are your results</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBg(percentage)} mb-6`}>
              <span className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                {percentage}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {result.correct_answers} out of {result.total_questions} Correct
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                {percentage >= 70 ? 'Pass' : 'Fail'}
              </div>
              <div className="text-sm text-slate-500">Status</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Quiz Summary</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.correct_answers}</div>
              <div className="text-sm text-slate-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{result.total_questions - result.correct_answers - result.pending_answers}</div>
              <div className="text-sm text-slate-500">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{result.pending_answers}</div>
              <div className="text-sm text-slate-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{result.total_questions}</div>
              <div className="text-sm text-slate-500">Total</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button onClick={() => navigate('/student/join-quiz')} className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700">
            Take Another Quiz
          </button>
          <button onClick={() => navigate('/student/my-results')} className="rounded-xl bg-slate-600 px-6 py-3 text-white font-semibold hover:bg-slate-700">
            View My Results
          </button>
        </div>
      </div>
    </div>
  );
}