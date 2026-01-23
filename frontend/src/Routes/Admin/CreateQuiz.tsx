import { useState } from 'react';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Question {
  id: number;
  text: string;
  mark: number;
  type: 'mcq' | 'tf' | 'short_answer';
  options?: string[];
  correctAnswer: string;
}

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [grade, setGrade] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [nextId, setNextId] = useState(1);
  const [timer, setTimer] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const localToUTC = (local: string) => new Date(local).toISOString();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: nextId,
      text: '',
      mark: 1,
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
    };
    setQuestions([...questions, newQuestion]);
    setNextId(nextId + 1);
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };


  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (!startDateTime) {
      setError('Please select a quiz start date and time');
      return;
    }

    if (!endDateTime) {
      setError('Please select a quiz end date and time');
      return;
    }

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setError('End time must be after start time');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    if(timer<=0) {
      setError('Timer must be greater than 0 minutes');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
    const quiz = await authFetch(`${BACKEND_URL}/quizzes/create/`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        quiz_for: grade,
        total_marks: questions.reduce((sum,q)=>sum+q.mark, 0),
        start_date_time: localToUTC(startDateTime),
        end_date_time: localToUTC(endDateTime),
        time_limit: timer,
      })
    });

    for (const q of questions) {
      if (!q.text.trim()) 
        throw new Error('All questions must have text');

      const question = await authFetch(`${BACKEND_URL}/quizzes/${quiz.id}/questions/create/`, {
        method: 'POST',
        body: JSON.stringify({
          text: q.text,
          marks: q.mark,
          question_type: q.type,
        })
      });

      let choices: { text:string; is_correct:boolean }[] = [];

      if (q.type === 'mcq' && q.options) {
        choices = q.options.filter(opt => opt.trim()).map(opt => ({
            text: opt,
            is_correct: opt === q.correctAnswer,
          }));
      }

      if (q.type === 'tf') {
        choices = [
          { text: 'True', is_correct: q.correctAnswer === 'True' },
          { text: 'False', is_correct: q.correctAnswer === 'False' },
        ];
      }

      if (q.type === 'short_answer') {
        
      }

      await Promise.all(
        choices.map(choice => authFetch(`${BACKEND_URL}/questions/${question.id}/choices/create/`, {
          method: 'POST',
          body: JSON.stringify(choice)
        }))
      );
    }

    alert('Quiz created successfully!');
      setTitle('');
      setDescription('');
      setStartDateTime('');
      setEndDateTime('');
      setQuestions([]);
      setTimer(0);
      setNextId(1);

    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Create Quiz</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter quiz title"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter quiz description" rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Select Grade</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="college">College</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date & Time</label>
              <input type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date & Time</label>
              <input type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timer (minutes)</label>
              <input type="number" value={timer} onChange={(e) => setTimer(Number(e.target.value))} placeholder="Enter timer in minutes"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Questions</h2>
              
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="space-y-4">

                      <label className="block text-sm font-medium text-slate-700 mb-2">Question {q.id}</label>
                      <input type="text" value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} placeholder="Question text"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>

                      <label className="block text-sm font-medium text-slate-700 mb-2">Marks</label>
                      <input type="number" value={q.mark} onChange={(e) => updateQuestion(q.id, 'mark', Number(e.target.value))} placeholder="Marks for this question"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>

                      <label className="block text-sm font-medium text-slate-700 mb-2">Question Type</label>
                      <select value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value as 'mcq' | 'tf' | 'short_answer')}
                        className="border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="mcq">Multiple Choice</option>
                        <option value="tf">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                      
                      
                      {q.type === 'mcq' && q.options && (
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => (
                            <input key={idx} type="text" value={opt}
                              onChange={(e) => {
                                const newOptions = [...q.options!];
                                newOptions[idx] = e.target.value;
                                updateQuestion(q.id, 'options', newOptions);
                              }}
                              placeholder={`Option ${idx + 1}`}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          ))}
                        </div>
                      )}

                      {q.type === 'tf' && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input type="radio" name={`correct-${q.id}`} value="True"
                                checked={q.correctAnswer === 'True'}
                                onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                                className="mr-2"/>
                              True
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name={`correct-${q.id}`} value="False"
                                checked={q.correctAnswer === 'False'}
                                onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                                className="mr-2"/>
                              False
                            </label>
                          </div>
                        </div>
                      )}

                      {q.type === 'mcq' && q.options && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Correct Answer</label>
                          <select value={q.correctAnswer} onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="">Select correct answer</option>
                            {q.options.map((opt, idx) => (
                              <option key={idx} value={opt}>{opt || `Option ${idx + 1}`}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button onClick={() => removeQuestion(q.id)} className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                        Remove Question
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={addQuestion} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                  Add Question
                </button>
                <button onClick={handleSubmit} disabled={isLoading}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                  {isLoading ? 'Creating Quiz...' : 'Save Quiz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};