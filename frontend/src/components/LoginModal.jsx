import { useState } from 'react';
import { loginDefs } from '../data/data';

const roleIcons = {
  student: '🎓',
  trainer: '📝',
  admin: '🛡️',
};

export default function LoginModal({ onLogin, onClose }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!role) {
      newErrors.role = 'Please select a role';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ auth: data.message || 'Invalid credentials' });
        return;
      }

      // Store token and pass user data up
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (error) {
      setErrors({ auth: 'Server connection error' });
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal"
        style={{ width: '420px', maxWidth: '95%', padding: '24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--sa-text)' }}>Sign In</h2>
          <p style={{ fontSize: '13px', color: 'var(--sa-muted)', marginTop: '6px' }}>
            Login to Swivel Academy
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Role */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--sa-border)',
                background: '#fff',
              }}
            >
              {Object.entries(loginDefs).map(([key, def]) => (
                <option key={key} value={key}>
                  {roleIcons[key]} {def.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                {errors.role}
              </div>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
              User ID
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--sa-border)',
                boxSizing: 'border-box',
              }}
            />
            {errors.email && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--sa-border)',
                boxSizing: 'border-box',
              }}
            />
            {errors.password && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                {errors.password}
              </div>
            )}
          </div>

          {/* Authentication Error */}
          {errors.auth && (
            <div
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              {errors.auth}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Login as {loginDefs[role]?.label}
          </button>
        </form>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '14px',
            background: 'transparent',
            border: 'none',
            color: 'var(--sa-muted)',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
