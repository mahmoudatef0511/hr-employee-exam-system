import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Card from "../components/Card";
import ErrorMessage from "../components/ErrorMessage";
import Submission from "../components/Submission";
import { getAllSubmissions } from "../services/examService";

export default function HRDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllSubmissions()
      .then(setSubmissions)
      .catch(() => setError("Failed to load submissions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <h2>HR Dashboard</h2>
      <Card>
        {loading && <p>Loading submissions...</p>}
        <ErrorMessage message={error} />
        {!loading && !error && submissions.length === 0 && (
          <p>No submissions yet.</p>
        )}
        {!loading && submissions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Exam</th>
                <th>Submitted At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <Submission
                  key={s.id}
                  submission={s}
                  showEmployee
                  actionLabel="View"
                  onAction={() => navigate(`/hr/submissions/${s.id}`)}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageLayout>
  );
}
