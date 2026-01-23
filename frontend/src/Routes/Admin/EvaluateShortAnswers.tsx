import { useState, useEffect } from 'react';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface PendingAnswer {
  id: number;
  quiz_title: string;
  student_name: string;
  question_text: string;
  student_answer: string;
  marks: number;
  submitted_at: string;
}

export default function EvaluateShortAnswers() {
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswer[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluating, setEvaluating] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingAnswers();
  }, []);

  const fetchPendingAnswers = async () => {
    try {
      const data = await authFetch(`${BACKEND_URL}/answers/pending/`);
      setPendingAnswers(data);
    } catch (error: any) {
      console.error('Error fetching pending answers:', error);
      setError(error.message || 'Failed to load pending answers');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (answerId: number, isCorrect: boolean) => {
    setEvaluating(answerId);
    try {
      await authFetch(`${BACKEND_URL}/answers/${answerId}/evaluate/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_correct: isCorrect })
      });
      
      setPendingAnswers(pendingAnswers.filter(answer => answer.id !== answerId));
      
      alert(`Answer marked as ${isCorrect ? 'correct' : 'incorrect'}`);
    } catch (error: any) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setEvaluating(null);
    }
  };

  if(isLoading)
  return (
    <div className="flex justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
    </div>
  );

  if(error)
  return (
    <div className="text-center py-8 text-red-600">
      <p>{error}</p>
      <button onClick={fetchPendingAnswers} className="mt-2 underline">
        Try again
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Evaluate Short Answers</h1>

      {pendingAnswers.length > 0 ? (
        <div className="space-y-6">
          {pendingAnswers.map((answer) => (
            <div key={answer.id} className="border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-slate-900">{answer.quiz_title}</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">
                    <strong>Student:</strong> {answer.student_name}
                  </p>
                  <p className="text-slate-600 mb-3">
                    <strong>Submitted:</strong> {new Date(answer.submitted_at).toLocaleString()}
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 mb-3">
                    <p className="font-medium text-slate-900 mb-2">Question:</p>
                    <p className="text-slate-700 mb-3">{answer.question_text}</p>
                    <p className="font-medium text-slate-900 mb-2">Student's Answer:</p>
                    <p className="text-slate-700">{answer.student_answer}</p>
                  </div>
                  <p className="text-sm text-slate-500">Marks: {answer.marks}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEvaluate(answer.id, true)}
                    disabled={evaluating === answer.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {evaluating === answer.id ? 'Evaluating...' : 'Mark Correct'}
                  </button>
                  <button
                    onClick={() => handleEvaluate(answer.id, false)}
                    disabled={evaluating === answer.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {evaluating === answer.id ? 'Evaluating...' : 'Mark Incorrect'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No pending answers</h3>
          <p className="text-slate-500">All short answer questions have been evaluated.</p>
        </div>
      )}
    </div>
  );
}