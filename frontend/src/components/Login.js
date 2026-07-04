import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, guestLogin } from '../services/api';

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.token);
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Login failed.');
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await guestLogin();
      localStorage.setItem('token', response.token);
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Guest login error:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit" style={{ width: '100%' }}>Login</button>
        
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

export default Login;
