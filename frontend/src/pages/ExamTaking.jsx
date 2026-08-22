import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { getExam, getExamQuestions, submitExam } from '../services/examService';

const ANSWER_OPTIONS = ['Yes', 'Partial', 'No'];

export default function ExamTaking() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getExam(id), getExamQuestions(id)])
      .then(([examData, questionData]) => {
        setExam(examData);
        setQuestions(questionData);
      })
      .catch(() => setError('Failed to load exam.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAnswerChange(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError('Please answer every question (Yes, Partial, or No) before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id]
      }));
      const result = await submitExam(id, payload);
      navigate(`/employee/submissions/${result.submissionId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit exam.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout>
      {loading && <p>Loading exam...</p>}
      <ErrorMessage message={error} />
      {exam && (
        <>
          <h2>{exam.title}</h2>
          <p>{exam.description}</p>
          <form onSubmit={handleSubmit}>
            <Card>
              {questions.map((q, idx) => (
                <div className="question-block" key={q.id}>
                  <label>
                    <strong>Question {idx + 1}:</strong> {q.questionText}
                  </label>
                  <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                    {ANSWER_OPTIONS.map((option) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={() => handleAnswerChange(q.id, option)}
                          style={{ width: 'auto' }}
                          required
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </form>
        </>
      )}
    </PageLayout>
  );
}
