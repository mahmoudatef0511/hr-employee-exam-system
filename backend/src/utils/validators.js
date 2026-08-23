// Lightweight, dependency-free validation helpers.

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value) {
  if (!isNonEmptyString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPassword(value) {
  // Keep it simple: at least 6 characters.
  return isNonEmptyString(value) && value.length >= 6;
}

function validateRegistration({ name, email, password }) {
  const errors = [];
  if (!isNonEmptyString(name)) errors.push('Name is required.');
  if (!isValidEmail(email)) errors.push('A valid email is required.');
  if (!isValidPassword(password)) errors.push('Password must be at least 6 characters.');
  return errors;
}

function validateLogin({ email, password }) {
  const errors = [];
  if (!isValidEmail(email)) errors.push('A valid email is required.');
  if (!isNonEmptyString(password)) errors.push('Password is required.');
  return errors;
}

function validateExam({ title }) {
  const errors = [];
  if (!isNonEmptyString(title)) errors.push('Exam title is required.');
  return errors;
}

function validateQuestion({ questionText }) {
  const errors = [];
  if (!isNonEmptyString(questionText)) errors.push('Question text is required.');
  return errors;
}

const VALID_ANSWER_VALUES = ['Yes', 'Partial', 'No'];

function validateSubmission({ answers }) {
  const errors = [];
  if (!Array.isArray(answers) || answers.length === 0) {
    errors.push('At least one answer is required.');
    return errors;
  }
  answers.forEach((a, idx) => {
    if (!a || typeof a.questionId === 'undefined') {
      errors.push(`Answer at index ${idx} is missing a questionId.`);
      return;
    }
    if (!VALID_ANSWER_VALUES.includes(a.answer)) {
      errors.push(`Answer at index ${idx} must be one of: Yes, Partial, No.`);
    }
  });
  return errors;
}

function validateAssignment({ employeeId, examId }) {
  const errors = [];
  if (!Number.isInteger(Number(employeeId))) errors.push('A valid employeeId is required.');
  if (!Number.isInteger(Number(examId))) errors.push('A valid examId is required.');
  return errors;
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  validateRegistration,
  validateLogin,
  validateExam,
  validateQuestion,
  validateSubmission,
  validateAssignment
};
