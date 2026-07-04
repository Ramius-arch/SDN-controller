import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, guestLogin } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Registration failed.');
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await guestLogin();
      localStorage.setItem('token', response.token);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Guest login error:', error);
    }
  };

  return (
    <div className="login-container"> {/* Reusing login-container for styling */}
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="login-form"> {/* Reusing login-form for styling */}
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" style={{ width: '100%' }}>Register</button>
        
        <div className="login-divider">
          <hr />
          <span>OR</span>
          <hr />
        </div>
        
        <button
          type="button"
          onClick={handleGuestLogin}
          className="guest-button btn-secondary"
          style={{ width: '100%' }}
        >
          Explore as Guest (Demo)
        </button>
      </form>
    </div>
  );
}

export default Register;
