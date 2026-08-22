import { Link } from "react-router-dom";

export default function BackLink({ to }) {
  return (
    <p>
      <Link to={to}>&larr; Back to Dashboard</Link>
    </p>
  );
}
