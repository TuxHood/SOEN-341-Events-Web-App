import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mock credentials for testing
  const mockUsers = {
    'admin@test.com': { password: 'admin123', role: 'admin', route: '/admin' },
    'organizer@test.com': { password: 'org123', role: 'organizer', route: '/organizer' },
    'student@test.com': { password: 'student123', role: 'student', route: '/events' }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    // Check if user exists
    const user = mockUsers[email];
    
    if (!user) {
      setError('Invalid email or password');
      return;
    }

    // Check if password matches
    if (user.password !== password) {
      setError('Invalid email or password');
      return;
    }

    // Redirect based on role
    navigate(user.route);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--muted)' }}>
      <div style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', background: 'var(--card)', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--foreground)' }}>
            Sign in to your account
          </h2>
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            Or{' '}
            <Link to="/auth/sign-up" style={{ fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>
              create a new account
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="email-address" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.625rem 0.875rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px', 
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.625rem 0.875rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px', 
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                placeholder="Password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Sign in
          </button>
        </form>

        {/* Test Credentials Helper */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Test Credentials:</p>
          <p style={{ fontSize: '0.75rem', color: '#1e3a8a', margin: '0.25rem 0' }}>Admin: admin@test.com / admin123</p>
          <p style={{ fontSize: '0.75rem', color: '#1e3a8a', margin: '0.25rem 0' }}>Organizer: organizer@test.com / org123</p>
          <p style={{ fontSize: '0.75rem', color: '#1e3a8a', margin: '0.25rem 0' }}>Student: student@test.com / student123</p>
        </div>
      </div>
    </div>
  );
}