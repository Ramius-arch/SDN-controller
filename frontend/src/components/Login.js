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
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
        
        <div className="login-divider" style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
          <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid #ccc' }} />
          <span style={{ padding: '0 10px', fontSize: '12px', color: '#666' }}>OR</span>
          <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid #ccc' }} />
        </div>
        
        <button
          type="button"
          onClick={handleGuestLogin}
          className="guest-button"
          style={{ width: '100%', backgroundColor: 'transparent', color: '#0070f3', border: '1px solid #0070f3', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Explore as Guest (Demo)
        </button>
      </form>
    </div>
  );
}

export default Login;
