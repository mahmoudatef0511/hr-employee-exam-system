export default function AuthCard({ title, children }) {
  return (
    <div className="container auth-box">
      <div className="card">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
