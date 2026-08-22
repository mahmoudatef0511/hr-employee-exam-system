import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.type === 'hr' ? '/hr/dashboard' : '/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Login">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <ErrorMessage message={error} />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p style={{ marginTop: 14, fontSize: 14 }}>
        New employee? <Link to="/register">Create an account</Link>
      </p>
      <p style={{ marginTop: 8, fontSize: 12, color: '#616e7c' }}>
        Seed HR login: hr@example.com / password123
        <br />
        Seed employee login: john@example.com / password123
      </p>
    </AuthCard>
  );
}
