import Button from "./Button";

export default function Submission({
  submission,
  showEmployee = false,
  showScore = false,
  actionLabel,
  onAction,
}) {
  return (
    <tr>
      {showEmployee && <td>{submission.employee?.name}</td>}
      <td>{submission.exam?.title}</td>
      <td>{new Date(submission.submitted_at).toLocaleString()}</td>
      {showScore && <td>{submission.score}/5</td>}
      <td>
        <Button onClick={onAction}>{actionLabel}</Button>
      </td>
    </tr>
  );
}
