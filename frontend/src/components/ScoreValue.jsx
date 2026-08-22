export default function ScoreValue({ score, max }) {
  return (
    <p className="score-number">
      {score} / {max}
    </p>
  );
}
