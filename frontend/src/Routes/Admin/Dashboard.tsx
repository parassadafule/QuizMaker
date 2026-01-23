import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type QuizCard = {
  id: string;
  title: string;
  description: string;
  current_status: string;
  questions: number;
  minutes?: number;
  total_attempts: number;
};

function QuizCard({ quiz }: { quiz: QuizCard }) {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate(`/admin/quiz-results?quizId=${quiz.id}`);
  };  

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-800">
        Completed
      </span>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{quiz.title}</h3>
      <p className="mt-2 text-sm text-gray-500">{quiz.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">{quiz.questions} Questions</span>
        <button onClick={handleAction} className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          View Results
        </button>
      </div>      
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizCard[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    totalAttempts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const quizzesData = await authFetch(`${BACKEND_URL}/quizzes/`);

        const quizzes: QuizCard[] = quizzesData.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          current_status: q.current_status,
          questions: q.total_questions || 0,
          minutes: q.time_limit || undefined,
          total_attempts: q.total_attempts || 0,
        }));

        setQuizzes(quizzes);
        setStats({
          totalQuizzes: quizzes.length,
          completedQuizzes: quizzes.filter(q => q.current_status === 'completed').length,
          totalAttempts: quizzes.reduce((sum, q) => sum + (q.total_attempts || 0), 0),
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          navigate('/auth/login?role=teacher');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if(isLoading)
  return (
    <div className="flex justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total Quizzes" value={stats.totalQuizzes.toString()}/>
        <StatCard title="Completed Quizzes" value={stats.completedQuizzes.toString()}/>
        <StatCard title="Total Attempts" value={stats.totalAttempts.toString()}/>
      </section>
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Quizzes</h2>
          <button onClick={() => navigate('/admin/create-quiz')} className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 self-start">
            Create New Quiz
          </button>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {quizzes.filter(q => q.current_status === 'completed').length > 0 ? (
            <>
              {quizzes.filter(q => q.current_status === 'completed').slice(0, 3).map((q)=><QuizCard key={q.id} quiz={q} />)}
              {quizzes.filter(q => q.current_status === 'completed').length > 3 && (
                <div className="col-span-full flex justify-center mt-6">
                  <button onClick={() => navigate('/admin/my-quizzes')} className="rounded-xl bg-slate-600 px-6 py-3 text-white hover:bg-slate-700">
                    View All Quizzes...
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-slate-900 mb-2">No completed quizzes yet</h3>
              <p className="text-slate-500 mb-4">Completed quizzes will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}