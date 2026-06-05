import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Choice {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  isNew?: boolean;
  text: string;
  marks: number;
  question_type: 'mcq' | 'tf' | 'short_answer';
  choices?: Choice[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  quiz_for: string;
  start_date_time: string;
  end_date_time: string;
  questions: Question[];
}

export default function QuizEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz|null>(null);
  const [isLoading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) 
      return;

    //fetch original quiz data
    const fetchQuiz=async () => {
      try {
        const quizData = await authFetch(`${BACKEND_URL}/quizzes/${id}/`);
        const questionsData = await authFetch(`${BACKEND_URL}/quizzes/${id}/questions/`);

        const questionsWithChoices = await Promise.all(
          questionsData.map(async (q: any) => {
            if (q.question_type === 'mcq' || q.question_type === 'tf') {
              const choices = await authFetch(`${BACKEND_URL}/questions/${q.id}/choices/`);
              return { ...q, choices };
            }
            return q;
          })
        );

        setQuiz({...quizData,questions: questionsWithChoices});

      } catch {
        navigate('/admin/my-quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  //for updating quiz details
  const updateQuizDetail = (updates: Partial<Quiz>) => {
    if(quiz) {
      setQuiz({ ...quiz, ...updates });
    }
  };

  //for updating questions
  const updateQuestion = (id: number, updates: Partial<Question>) => {
    if (quiz) {
      setQuiz({
        ...quiz, questions: quiz.questions.map(q => q.id === id ? { ...q, ...updates } : q),
      });
    }
  };

  //for updating choices
  const updateChoice = (questionId: number, choiceId: number, updates: Partial<Choice>) => {
    if (quiz) {
      setQuiz({
        ...quiz,
        questions: quiz.questions.map(q => 
          q.id === questionId && q.choices 
            ? { ...q, choices: q.choices.map(c => c.id === choiceId ? { ...c, ...updates } : c)}: q),
      });
    }
  };

  //adding new question
  const addQuestion = () => {
    if(quiz) {
      const tempId = Date.now();
      const newQuestion: Question = {
        id: tempId,
        isNew: true,
        text: '',
        marks: 1,
        question_type: 'mcq',
        choices: [
          { id:tempId+1, text:'', is_correct:false },
          { id:tempId+2, text:'', is_correct:false },
          { id:tempId+3, text:'', is_correct:false },
          { id:tempId+4, text:'', is_correct:false },
        ],
      };
      setQuiz({...quiz, questions: [...quiz.questions, newQuestion]});
    }
  };

  //deleting question
  const deleteQuestion = async (questionId: number) => {
    if (quiz) {
      if (confirm('Are you sure you want to delete this question?')) {
        try {
          await authFetch(`${BACKEND_URL}/quizzes/${id}/questions/`, {
            method: 'DELETE',
            body: JSON.stringify({ question_id: questionId }),
          });
          setQuiz({...quiz, questions: quiz.questions.filter(q => q.id !== questionId)});
        } catch (error) {
          console.error('Error deleting question:', error);
        }
      }
    }
  };

  //handling quiz edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) 
      return;

    setSaving(true);

    try {
      await authFetch(`${BACKEND_URL}/quiz-detail/${id}/update/`,{
        method: 'PATCH',
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          quiz_for: quiz.quiz_for,
          start_date_time: quiz.start_date_time,
          end_date_time: quiz.end_date_time,
          time_limit: quiz.time_limit,
        }),
      });

      const updateQuestion = async (q: any) => {
        await authFetch(`${BACKEND_URL}/question/${q.id}/update/`, {
          method: 'PATCH',
          body: JSON.stringify({
            text: q.text,
            marks: q.marks,
            question_type: q.question_type,
          }),
        });

        if (q.question_type === 'mcq' && q.choices?.length) {
          await Promise.all(q.choices.map((c: any) =>authFetch(`${BACKEND_URL}/choice/${c.id}/update/`,{
                method: 'PATCH',
                body: JSON.stringify({
                  text: c.text,
                  is_correct: c.is_correct,
                }),
              })
            )
          );
        }
      };

      const createQuestion = async (q: any) => {
        const newQuestion = await authFetch(`${BACKEND_URL}/quizzes/${id}/questions/create/`,{
            method: 'POST',
            body: JSON.stringify({
              text: q.text,
              marks: q.marks,
              question_type: q.question_type,
            }),
          }
        );

        if (q.question_type === 'mcq' && q.choices?.length) {
          await Promise.all(
            q.choices.map((c: any) =>authFetch(`${BACKEND_URL}/questions/${newQuestion.id}/choices/create/`,{
                  method: 'POST',
                  body: JSON.stringify({
                    text: c.text,
                    is_correct: c.is_correct,
                  }),
                }
              )
            )
          );
        }
      };

      await Promise.all(
        quiz.questions.map((q: any) => q.isNew ? createQuestion(q) : updateQuestion(q))
      );

      alert('Quiz updated successfully');
      navigate('/admin/my-quizzes');
    } catch (err) {
      console.error('Error updating quiz:', err);
      alert('Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  if(isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if(!quiz) {
    return (
      <div className="text-center py-8 text-red-600">
        <h1 className="text-2xl font-semibold text-red-900 mb-2">Result not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Edit Quiz</h1>
          <button onClick={() => navigate('/admin/my-quizzes')}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50">
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input type="text" value={quiz.title} onChange={(e) => updateQuizDetail({ title: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required/>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea value={quiz.description || ''} onChange={(e) => updateQuizDetail({ description: e.target.value })} rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Limit (minutes)</label>
              <input type="number" value={quiz.time_limit} onChange={(e) => updateQuizDetail({ time_limit: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
              <select value={quiz.quiz_for || ''} onChange={(e) => updateQuizDetail({ quiz_for: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Select Grade</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="College">College</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date & Time</label>
              <input type="datetime-local" value={quiz.start_date_time ? new Date(quiz.start_date_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateQuizDetail({ start_date_time: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date & Time</label>
              <input type="datetime-local" value={quiz.end_date_time ? new Date(quiz.end_date_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateQuizDetail({ end_date_time: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Questions ({quiz.questions.length})</h2>
              <button type="button" onClick={addQuestion} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((q) => (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <input type="text" value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} placeholder="Question text"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>

                        <div className="flex gap-4">
                          <select value={q.question_type} onChange={(e) => updateQuestion(q.id, { question_type: e.target.value as 'mcq' | 'tf' | 'short_answer' })}
                            className="border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="mcq">Multiple Choice</option>
                            <option value="tf">True/False</option>
                            <option value="short_answer">Short Answer</option>
                          </select>

                          <input 
                            type="number" value={q.marks} onChange={(e) => updateQuestion(q.id, { marks: Number(e.target.value) })} placeholder="Marks"
                            className="w-20 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                        </div>

                        {q.question_type === 'mcq' && q.choices && (
                          <div className="space-y-2">
                            {q.choices.map((choice) => (
                              <div key={choice.id} className="flex items-center gap-2">
                                <input type="radio" name={`correct-${q.id}`} checked={choice.is_correct}
                                  onChange={() => {
                                    updateQuestion(q.id, { choices: q.choices?.map(c => ({ ...c, is_correct: c.id === choice.id })) });
                                  }}
                                />
                                <input type="text" value={choice.text} onChange={(e) => updateChoice(q.id, choice.id, { text: e.target.value })} placeholder="Choice text"
                                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.question_type === 'tf' && (
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input type="radio" name={`tf-${q.id}`} value="True" checked={q.choices?.find(c => c.text === 'True')?.is_correct || false}
                                onChange={() => {
                                  updateQuestion(q.id, { choices: q.choices?.map(c => ({ ...c, is_correct: c.text === 'True' })) });
                                }}
                              />
                              <span className="ml-2">True</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name={`tf-${q.id}`} value="False" checked={q.choices?.find(c => c.text === 'False')?.is_correct || false}
                                onChange={() => {
                                  updateQuestion(q.id, { choices: q.choices?.map(c => ({ ...c, is_correct: c.text === 'False' })) });
                                }}
                              />
                              <span className="ml-2">False</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <button type="button" onClick={() => deleteQuestion(q.id)} className="ml-4 rounded-xl bg-red-600 px-3 py-2 text-white hover:bg-red-700">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {quiz.questions.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No questions added yet. Click "Add Question" to get started.
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Quiz'}
            </button>
            <button type="button" onClick={() => navigate('/admin/my-quizzes')}
              className="rounded-xl bg-slate-600 px-6 py-3 text-white font-semibold hover:bg-slate-700">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
