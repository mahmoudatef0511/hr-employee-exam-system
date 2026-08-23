import api from './api';

export async function getExams() {
  const { data } = await api.get('/exams');
  return data.data;
}

export async function getExam(examId) {
  const { data } = await api.get(`/exams/${examId}`);
  return data.data;
}

export async function getExamQuestions(examId) {
  const { data } = await api.get(`/exams/${examId}/questions`);
  return data.data;
}

export async function submitExam(examId, answers) {
  const { data } = await api.post(`/employee/exams/${examId}/submit`, { answers });
  return data.data;
}

export async function getMySubmissions() {
  const { data } = await api.get('/employee/submissions');
  return data.data;
}

export async function getMySubmission(submissionId) {
  const { data } = await api.get(`/employee/submissions/${submissionId}`);
  return data.data;
}

export async function getAllSubmissions() {
  const { data } = await api.get('/hr/submissions');
  return data.data;
}

export async function getSubmissionDetails(submissionId) {
  const { data } = await api.get(`/hr/submissions/${submissionId}`);
  return data.data;
}

export async function getEmployees() {
  const { data } = await api.get('/hr/employees');
  return data.data;
}

export async function getAssignments() {
  const { data } = await api.get('/hr/assignments');
  return data.data;
}

export async function assignExam(employeeId, examId) {
  const { data } = await api.post('/hr/assignments', { employeeId, examId });
  return data.data;
}

export async function unassignExam(assignmentId) {
  const { data } = await api.delete(`/hr/assignments/${assignmentId}`);
  return data.data;
}
