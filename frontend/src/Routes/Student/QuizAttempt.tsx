import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Question {
  id: number;
  text: string;
  question_type: 'mcq' | 'tf' | 'short_answer';
  choices?: { id: number; text: string }[];
  options?: string[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  questions: Question[];
  attempt_started_at?: string;
}

export default function QuizAttempt() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        setError('Quiz ID is required');
        setLoading(false);
        return;
      }

      try {
        const attemptsData=await authFetch(`${BACKEND_URL}/quizzes/${quizId}/attempts/`);

        const userAttempts=attemptsData.filter((attempt: any) => attempt.status === 'completed');

        if(userAttempts.length>0) {
          setError('You have already attempted this quiz. You can only attempt each quiz once.');
          setLoading(false);
          return;
        }

        const quizData=await authFetch(`${BACKEND_URL}/quizzes/${quizId}/`);

        if(quizData.current_status !== 'active') {
          setError('This quiz is not started or has ended.');
          setLoading(false);
          return;
        }

        const questionData=await authFetch(`${BACKEND_URL}/quizzes/${quizId}/questions/`);

        const questionWithOptions=await Promise.all(
          questionData.map(async (question: any) => {
            if (question.question_type === 'mcq') {
              try {
                const optionData=await authFetch(`${BACKEND_URL}/questions/${question.id}/choices/`);
                return { ...question, choices: optionData };
              } catch (error) {
                console.error(`Error fetching choices for question ${question.id}:`, error);
                return { ...question, choices: [] };
              }
            }
            return question;
          })
        );

        setQuiz({
          ...quizData, questions: questionWithOptions
        });

        //for initializing quiz timer
        if (quizData.attempt_started_at) {
          const startTime = new Date(quizData.attempt_started_at).getTime();
          const totalSeconds = (quizData.time_limit) * 60;

          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(0, totalSeconds - elapsed);

          setTimeLeft(remaining);
        } else {
          setError('Please join the quiz first using the share code.');
          setLoading(false);
          return;
        }

      } catch (error: any) {
        console.error('Error fetching quiz:', error);
        setError(error.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && quiz) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, quiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {

    if (!quiz) return;

    setIsSubmitted(true);

    try {
      const formattedAnswers=Object.entries(answers).map(([questionId, answer]) => ({
        question: parseInt(questionId),
        answer: answer
      }));

      await authFetch(`${BACKEND_URL}/quizzes/${quiz.id}/submit/`, {
        method: 'POST',
        body: JSON.stringify({
          answers: formattedAnswers
        })
      });

      navigate(`/student/result/${quiz.id}`);
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      setError('Quiz submitted but there was an error saving results');
    }
  };

  if(isLoading)
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <p className="mt-2 text-slate-600">Loading quiz...</p>
      </div>
    );

  if(error && error.includes('already attempted')) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center border rounded-lg p-6 max-w-sm">
          <h2 className="text-lg font-semibold mb-2">Quiz Already Attempted</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button onClick={() => navigate(`/student/result/${quizId}`)} className="px-4 py-2 bg-blue-600 text-white rounded">
            View Result
          </button>
        </div>
      </div>
    );
  }

  if(!quiz) {
    return (
      <div className="text-center py-12 text-slate-600">
        Quiz not found
      </div>
    );
  }

  const question=quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="text-slate-600">{quiz.description}</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-2xl font-mono font-bold text-blue-600">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-slate-500">Time Remaining</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          {question.text}
        </h2>

        {question.question_type === 'mcq' && question.choices && question.choices.length > 0 && (
          <div className="space-y-3">
            {question.choices.map((choice) => (
              <label key={choice.id} className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                <input type="radio" name={`question-${question.id}`} value={choice.text} checked={answers[question.id] === choice.text}
                  onChange={() => handleAnswer(question.id, choice.text)} className="mr-3" />
                <span className="text-slate-700">{choice.text}</span>
              </label>
            ))}
          </div>
        )}

        {question.question_type === 'tf' && (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                <input type="radio" name={`question-${question.id}`} value={option} checked={answers[question.id] === option}
                  onChange={() => handleAnswer(question.id, option)} className="mr-3" />
                <span className="text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.question_type === 'short_answer' && (
          <div>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button onClick={handlePrevious} disabled={currentQuestion === 0}
          className="rounded-xl bg-slate-600 px-6 py-3 text-white font-semibold hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed order-2 sm:order-1">
          Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button onClick={handleSubmit} className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 order-1 sm:order-2">
            Submit Quiz
          </button>
        ) : (
          <button onClick={handleNext} className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 order-1 sm:order-2">
            Next
          </button>
        )}
      </div>
    </div>
  );
}