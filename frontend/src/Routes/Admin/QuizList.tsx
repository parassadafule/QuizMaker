import { FaEdit, FaShare, FaEye, FaClock, FaCheckCircle, FaCalendarAlt, FaUsers, FaCopy, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Quiz {
  id: string;
  title: string;
  description: string;
  total_marks: number;
  start_date_time: string;
  end_date_time: string;
  current_status: 'upcoming' | 'active' | 'completed';
  time_limit: number;
  share_code?: string;
  total_questions: number;
  total_attempts: number;
  updated_at: string;
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // const utcToLocal = (utc: string) => {
  //   const d = new Date(utc);
  //   return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleString();
  // };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {

    try {
      const data = await authFetch(`${BACKEND_URL}/quizzes/`);
      setQuizzes(data);
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleEdit = (quizId: string) => {
    navigate(`/admin/quiz-edit/${quizId}/update`);
  };

  const handleShare = (quiz: Quiz) => {
    if (!quiz.share_code) {
      alert('Share code not available for this quiz.');
      return;
    }    
    navigate(`/admin/quiz-share?shareCode=${quiz.share_code}`);
  };

  const handleViewDetails = (quizId: string) => {
    navigate(`/admin/quiz-results?quizId=${quizId}`);
  };

  const handleDelete = async (quizId: string) => {
    
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await authFetch(`${BACKEND_URL}/quizzes/${quizId}/`, { method: 'DELETE' });
        fetchQuizzes();
      } catch (error: any) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz. Please try again.');
      }
    }
  };

  const QuizCard = ({ quiz }: { quiz: Quiz }) => {

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">{quiz.title}</h3>
              {/* <p>Status: {quiz.current_status}</p> */}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                quiz.current_status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                quiz.current_status === 'active' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'}`}>
                {quiz.current_status === 'upcoming' ? <FaClock className="h-3 w-3" /> :
                 quiz.current_status === 'active' ? <FaCheckCircle className="h-3 w-3" /> :
                 <FaCheckCircle className="h-3 w-3" />}
                {quiz.current_status === 'upcoming' ? 'Upcoming' :
                 quiz.current_status === 'active' ? 'Active' :
                 'Completed'}
              </span>
              <span className="ml-2 text-sm font-medium text-slate-500">Marks - {quiz.total_marks}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{quiz.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">
              {quiz.current_status === 'upcoming' ? `Starts : ${new Date(quiz.start_date_time).toLocaleString()}` :
               quiz.current_status === 'active' ? `Ends : ${new Date(quiz.end_date_time).toLocaleString()}` :
               `Ended : ${new Date(quiz.end_date_time).toLocaleString()}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">📝</span>
            <span className="text-slate-600">{quiz.total_questions} questions</span>
          </div>
          {quiz.time_limit && (
            <div className="flex items-center gap-2">
              <FaClock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{quiz.time_limit} min</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FaUsers className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">{quiz.total_attempts} attempts</span>
          </div>
        </div>

        {(quiz.current_status === 'upcoming' || quiz.current_status === 'active') && quiz.share_code && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-medium text-blue-700">Share Code</span>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-white rounded text-blue-800 font-mono text-sm">
                  {quiz.share_code}
                </code>
                <button onClick={() => copyToClipboard(quiz.share_code!)} className="p-1 text-blue-600 hover:text-blue-800" title="Copy share code">
                  <FaCopy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {(quiz.current_status === 'upcoming' || quiz.current_status === 'active') ? (
            <>
              <button onClick={() => handleEdit(quiz.id)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                <FaEdit className="h-4 w-4" />
                Edit Quiz
              </button>
              <button onClick={() => handleShare(quiz)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors">
                <FaShare className="h-4 w-4" />
                Share
              </button>
            </>
          ) : (
            <button onClick={() => handleViewDetails(quiz.id)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
              <FaEye className="h-4 w-4" />
              View Details
            </button>
          )}

          <button onClick={() => handleDelete(quiz.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
            <FaTrash className="h-4 w-4" />
          </button>
          
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Quizzes</h1>
        <p className="text-slate-600">Manage all your created quizzes</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800">{error}</p>
          <button onClick={fetchQuizzes} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Try Again
          </button>
        </div>
      )}

        <div className="grid grid-cols-2 gap-6">
          {quizzes.length > 0 ? (
            quizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-slate-400 mb-4">
                <FaClock className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No quizzes yet</h3>
              <p className="text-slate-500 mb-4">Create your first quiz to get started.</p>
              <button onClick={() => navigate('/admin/create-quiz')}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700">
                Create New Quiz
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
