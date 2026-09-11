import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`, formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      login(response.data.user);
      navigate('/campgrounds');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '400px', margin: '0 auto', marginTop: '2rem' }}>
      <div className="card">
        <div className="card-body">
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Create an Account</h2>
          
          {error && <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', border: '1px solid var(--danger-color)' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input type="text" id="username" name="username" className="form-control" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input type="email" id="email" name="email" className="form-control" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input type="password" id="password" name="password" className="form-control" onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
