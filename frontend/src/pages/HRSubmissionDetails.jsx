import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Card from "../components/Card";
import ErrorMessage from "../components/ErrorMessage";
import BackLink from "../components/BackLink";
import ScoreValue from "../components/ScoreValue";
import { getSubmissionDetails } from "../services/examService";
import { MAXIMUM_SCORE, ANSWER_POINTS } from "../utils/scoreConstants";

export default function HRSubmissionDetails() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubmissionDetails(id)
      .then(setSubmission)
      .catch(() => setError("Failed to load submission details."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <PageLayout>
      <BackLink to="/hr/dashboard" />
      {loading && <p>Loading...</p>}
      <ErrorMessage message={error} />
      {submission && (
        <>
          <Card>
            <h2>{submission.exam?.title}</h2>
            <p>
              <strong>Employee:</strong> {submission.employee?.name}
            </p>
            <p>
              <strong>Submitted At:</strong>{" "}
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </Card>

          <Card>
            {submission.answers.map((a, idx) => (
              <div className="question-block" key={a.id}>
                <p>
                  <strong>Question {idx + 1}:</strong>{" "}
                  {a.question?.questionText}
                </p>
                <p>Employee Answer: {a.answer}</p>
                <p
                  className={
                    a.answer === "Yes"
                      ? "badge-correct"
                      : a.answer === "Partial"
                        ? undefined
                        : "badge-incorrect"
                  }
                >
                  Points: {ANSWER_POINTS[a.answer] ?? 0} / 2
                </p>
              </div>
            ))}
          </Card>

          <Card className="score-summary">
            <p>Total Score</p>
            <ScoreValue score={submission.score} max={MAXIMUM_SCORE} />
          </Card>
        </>
      )}
    </PageLayout>
  );
}
