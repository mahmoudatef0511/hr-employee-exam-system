import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Card from "../components/Card";
import ErrorMessage from "../components/ErrorMessage";
import Exam from "../components/Exam";
import Submission from "../components/Submission";
import { getMySubmissions, getExams } from "../services/examService";

export default function EmployeeDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getMySubmissions(), getExams()])
      .then(([subs, examList]) => {
        setSubmissions(subs);
        setExams(examList);
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <h2>Available Exams</h2>
      <Card>
        {loading && <p>Loading...</p>}
        {!loading && exams.length === 0 && <p>No exams available yet.</p>}
        {!loading && exams.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <Exam
                  key={exam.id}
                  exam={exam}
                  onTake={() => navigate(`/employee/exams/${exam.id}`)}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <h2>My Submissions</h2>
      <Card>
        <ErrorMessage message={error} />
        {!loading && submissions.length === 0 && (
          <p>You haven't submitted any exams yet.</p>
        )}
        {!loading && submissions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Submitted At</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <Submission
                  key={s.id}
                  submission={s}
                  showScore
                  actionLabel="View Submission"
                  onAction={() => navigate(`/employee/submissions/${s.id}`)}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageLayout>
  );
}
