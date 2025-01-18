import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../../../src/styles/auth/Login.module.css";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBackClick = () => {
    navigate("/"); // Redirect to the LandingPage
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setError(''); // Clear error when user types
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { email, password } = formData;
  
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    
  
    try {
      console.log('Form Data:', formData);
      const response = await api.post('/login', { email, password });
      const { token, username, userId } = response.data;

      // Store token and username in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username); // Set the username as workspace name
      localStorage.setItem('userId', userId);
      setSuccess("Login successful!");
      setTimeout(() => navigate("/profile?accessType=Edit"), 1000);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.backgroundShapes}>
        <div className={styles.orangeTriangle}></div>
        <div className={styles.pinkCircle}></div>
        <div className={styles.yellowCircle}></div>
      </div>
      <button className={styles.backButton} onClick={handleBackClick}>
        ←
      </button>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Login</h2>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={styles.inputField}
            value={formData.email}
            onChange={handleInputChange}
            autoComplete="username"
          />
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={styles.inputField}
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="current-password"
          />
          <button type="submit" className={styles.loginButton}>Log in</button>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
          <div className={styles.orText}>or</div>
          <button type="button" className={styles.googleButton}>Sign in with Google</button>
          <div className={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/signup" className={styles.registerLink}>Register now</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
