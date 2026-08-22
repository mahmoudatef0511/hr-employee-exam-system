import Button from "./Button";

export default function Exam({ exam, onTake }) {
  return (
    <tr>
      <td>{exam.title}</td>
      <td>{exam.description}</td>
      <td>
        <Button onClick={onTake}>Take Exam</Button>
      </td>
    </tr>
  );
}
