import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface QuizResult {
  quiz_id: number;
  quiz_title: string;
  score: number;
  total_questions: number;
  date: string;
  time_taken: string | null;
  status: string;
}

export default function MyResults() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await authFetch(`${BACKEND_URL}/student-results/`);
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'not_started':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const handleViewResult = (result: QuizResult) => {
    navigate(`/student/result/${result.quiz_id}`);
  };

  const completedResults=results.filter(r=>r.status==='completed');
  const bestScore=completedResults.length>0 ? Math.max(...completedResults.map(r => r.score)) : 0;

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
        <button onClick={fetchResults} className="mt-2 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Quiz Results</h1>
        <p className="text-slate-600">View your quiz performance history</p>
      </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Quizzes</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {completedResults.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Best Score</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {bestScore}%
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Average Score</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {completedResults.length>0 ? Math.round(completedResults.reduce((sum,r)=>sum+r.score,0)/completedResults.length) : 0}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.quiz_id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {result.quiz_title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>{result.date}</span>
                    <span>{result.total_questions} Questions</span>
                    {result.status==='completed' && result.time_taken && (
                      <span>Time: {result.time_taken}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 self-start sm:self-auto">
                  {result.status === 'completed' ? (
                    <div className="text-left sm:text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </div>
                      <div className="text-sm text-slate-500">
                        {result.score>=75 ? 'Pass' : 'Fail'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-semibold text-slate-600">
                        {result.status==='not_started' ? 'Not Started' : result.status}
                      </div>
                    </div>
                  )}
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(result.status)}`}>
                    {result.status==='completed' ? 'Completed' : result.status==='not_started' ? 'Not Started' : result.status}
                  </span>
                  <button onClick={() => handleViewResult(result)} className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    {result.status==='completed' ? 'View Details' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No quiz results yet</h3>
            <p className="text-slate-500">Start taking quizzes to see your results here.</p>
          </div>
        )}
      </div>
  );
}