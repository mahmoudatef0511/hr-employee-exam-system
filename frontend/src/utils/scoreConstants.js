// The backend always normalizes final scores onto this fixed scale,
// regardless of how many questions an exam has. Keep this in one place so
// the frontend never has to duplicate the backend's normalization formula.
export const MAXIMUM_SCORE = 5;

// Per-answer point values, purely for display (e.g. HR submission details).
// Actual scoring is always calculated by the backend.
export const ANSWER_POINTS = { Yes: 2, Partial: 1, No: 0 };
