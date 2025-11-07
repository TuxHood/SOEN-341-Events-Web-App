import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';
import { registerStudent } from '../api/auth';


export default function SignUpPage() {
  const [step, setStep] = useState('choose'); // 'choose', 'student', 'organizer'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle role selection

  const handleRoleSelect = (role) => {
    setStep(role);
    setError('');
  };

  // Handle form input changes

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Validation
  if (!formData.name || !formData.email || !formData.password) {
    setError('All fields are required');
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters');
    return;
  }

  setLoading(true);
  try {
    // Our API expects full_name, email, password at /api/users/register/
    await registerStudent(formData.name, formData.email, formData.password);

    if (step === 'organizer') {
      alert(
        'Success! Your organizer account is pending approval. You will receive an email once approved.'
      );
    } else {
      alert(
        'Success! Your account has been created. You can now log in.'
      );
    }

    navigate('/auth/login');
  } catch (err) {
    setError(err.message || 'Registration failed. Please try again.');
    console.error('Registration error:', err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="signup-page">
      <div className="signup-container">

        {/*Choose Role */}

        {step === 'choose' && (
          <>
            <h1>Create Your Account</h1>
            <p className="subtitle">How will you be using the platform?</p>
            
            <div className="role-cards">
              <button 
                className="role-card"
                onClick={() => handleRoleSelect('student')}
              >
                <div className="role-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3>Register as Student</h3>
                <p>Browse events, claim tickets, and attend campus activities</p>
              </button>

              <button 
                className="role-card"
                onClick={() => handleRoleSelect('organizer')}
              >
                <div className="role-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Register as Organizer</h3>
                <p>Create and manage events, track attendance (requires approval)</p>
              </button>
            </div>
          </>
        )}

        {/*Registration Form */}

        {(step === 'student' || step === 'organizer') && (
          <div className="signup-form-container">
            <button 
              className="back-button"
              onClick={() => {
                setStep('choose');
                setError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
            >
              ← Back
            </button>

            <div className="form-header">
              <h2>
                {step === 'student' ? 'Student Registration' : 'Organizer Registration'}
              </h2>
              {step === 'organizer' && (
                <p className="approval-notice">
                  ⚠️ Organizer accounts require admin approval before activation
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {error && (
                <div className="error-message">{error}</div>
              )}

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="login-link">
              Already have an account? <a href="/auth/login">Log in here</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}