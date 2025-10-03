import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import blobLeft from '../assets/blobLeft.svg';
import blobRight from '../assets/blobRight.svg';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Add authentication logic here
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <img src={blobLeft} alt="Blob Left" className="blob-left" />
      <img src={blobRight} alt="Blob Right" className="blob-right" />

      <div className="login-content">
        <h1 className="logo">umma na</h1>

        <form className="login-form" onSubmit={handleLogin}>
          <input type="text" placeholder="USERNAME OR EMAIL" />
          <input type="password" placeholder="PASSWORD" />

          <p className="forgot">forgot your password?</p>
          <button type="submit">Log in</button>

          <p className="register">
            Don’t have an account? <span>Register now</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
