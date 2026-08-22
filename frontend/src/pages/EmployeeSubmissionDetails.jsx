import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Card from "../components/Card";
import ErrorMessage from "../components/ErrorMessage";
import BackLink from "../components/BackLink";
import ScoreValue from "../components/ScoreValue";
import { getMySubmission } from "../services/examService";
import { MAXIMUM_SCORE } from "../utils/scoreConstants";

export default function EmployeeSubmissionDetails() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMySubmission(id)
      .then(setSubmission)
      .catch(() => setError("Failed to load submission."))
      .finally(() => setLoading(false));
  }, [id]);

  const percentage = submission
    ? Math.round((submission.score / MAXIMUM_SCORE) * 100)
    : 0;

  return (
    <PageLayout>
      <BackLink to="/employee/dashboard" />
      {loading && <p>Loading...</p>}
      <ErrorMessage message={error} />
      {submission && (
        <>
          <Card className="score-summary">
            <h2>{submission.exam?.title}</h2>
            <p>
              Submitted At: {new Date(submission.submitted_at).toLocaleString()}
            </p>
            <ScoreValue score={submission.score} max={MAXIMUM_SCORE} />
            <p>Percentage: {percentage}%</p>
          </Card>

          <Card>
            <h3>Your Answers</h3>
            {submission.answers.map((a, idx) => (
              <div className="question-block" key={a.id}>
                <p>
                  <strong>Question {idx + 1}:</strong>{" "}
                  {a.question?.questionText}
                </p>
                <p>Your Answer: {a.answer}</p>
              </div>
            ))}
          </Card>
        </>
      )}
    </PageLayout>
  );
}
