const { Answer } = require('../models');

// Three-level scoring system: each employee answer is worth a fixed number
// of points regardless of the question. There is no "correct answer" to
// compare against — HR judges Yes/Partial/No when reviewing separately.
const ANSWER_POINTS = Answer.ANSWER_POINTS;

// The final score shown/stored is always normalized to this scale,
// regardless of how many questions the exam has.
const NORMALIZED_MAX_SCORE = 5;

// Rounds to 1 decimal place (e.g. 3.333... -> 3.3, 3.75 -> 3.8).
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

// questions: array of Question instances/plain objects with { id, questionText }
// answers: array of { questionId, answer } where answer is 'Yes' | 'Partial' | 'No'
function calculateScore(questions, answers) {
  const answerByQuestionId = new Map(
    answers.map((a) => [Number(a.questionId), a.answer])
  );

  let rawScore = 0;
  const details = questions.map((question) => {
    const submittedAnswer = answerByQuestionId.get(question.id);
    const points = ANSWER_POINTS[submittedAnswer] ?? 0;
    rawScore += points;

    return {
      questionId: question.id,
      questionText: question.questionText,
      employeeAnswer: submittedAnswer,
      points
    };
  });

  const total = questions.length;
  // Each question is worth up to 2 raw points (Yes/Partial/No), so the raw
  // maximum scales with the number of questions. The final score is always
  // normalized onto a fixed 0–5 scale so it's comparable across exams of
  // different lengths: normalizedScore = (rawScore / maxRawScore) * 5.
  const maxRawScore = total * 2;
  const score = maxRawScore > 0
    ? roundToOneDecimal((rawScore / maxRawScore) * NORMALIZED_MAX_SCORE)
    : 0;

  return {
    score, // normalized, out of NORMALIZED_MAX_SCORE
    maximumScore: NORMALIZED_MAX_SCORE,
    total,
    rawScore,
    maxRawScore,
    details
  };
}

module.exports = { calculateScore, ANSWER_POINTS, NORMALIZED_MAX_SCORE };
