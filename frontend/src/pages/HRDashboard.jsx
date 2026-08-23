import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Card from "../components/Card";
import ErrorMessage from "../components/ErrorMessage";
import Button from "../components/Button";
import Submission from "../components/Submission";
import {
  getAllSubmissions,
  getEmployees,
  getExams,
  getAssignments,
  assignExam,
  unassignExam,
} from "../services/examService";

export default function HRDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Exam assignment state
  const [employees, setEmployees] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(true);
  const [assignError, setAssignError] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    getAllSubmissions()
      .then(setSubmissions)
      .catch(() => setError("Failed to load submissions."))
      .finally(() => setLoading(false));
  }, []);

  function loadAssignmentData() {
    setAssignLoading(true);
    Promise.all([getEmployees(), getExams(), getAssignments()])
      .then(([employeeList, examList, assignmentList]) => {
        setEmployees(employeeList);
        setExams(examList);
        setAssignments(assignmentList);
      })
      .catch(() => setAssignError("Failed to load assignment data."))
      .finally(() => setAssignLoading(false));
  }

  useEffect(() => {
    loadAssignmentData();
  }, []);

  async function handleAssign(e) {
    e.preventDefault();
    setAssignError("");

    if (!selectedEmployeeId || !selectedExamId) {
      setAssignError("Please select both an employee and an exam.");
      return;
    }

    setAssigning(true);
    try {
      await assignExam(Number(selectedEmployeeId), Number(selectedExamId));
      setSelectedEmployeeId("");
      setSelectedExamId("");
      loadAssignmentData();
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to assign exam.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign(assignmentId) {
    setAssignError("");
    try {
      await unassignExam(assignmentId);
      loadAssignmentData();
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to remove assignment.");
    }
  }

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

      <h2>Assign Exam to Employee</h2>
      <Card>
        {assignLoading && <p>Loading...</p>}
        <ErrorMessage message={assignError} />
        {!assignLoading && (
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label>Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">Select an employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Exam</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <option value="">Select an exam...</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={assigning}>
              {assigning ? "Assigning..." : "Assign Exam"}
            </Button>
          </form>
        )}
      </Card>

      <h2>Current Assignments</h2>
      <Card>
        {!assignLoading && assignments.length === 0 && (
          <p>No exams have been assigned yet.</p>
        )}
        {!assignLoading && assignments.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Exam</th>
                <th>Assigned At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.employee?.name}</td>
                  <td>{a.exam?.title}</td>
                  <td>{new Date(a.assignedAt || a.assigned_at).toLocaleString()}</td>
                  <td>
                    <Button variant="secondary" onClick={() => handleUnassign(a.id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageLayout>
  );
}
