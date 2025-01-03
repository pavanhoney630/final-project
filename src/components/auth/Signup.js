import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../src/styles/auth/Signup.module.css';
import { signUpUser } from '../../utils/api'; // Import the signup API function

const Signup = () => {
  const navigate = useNavigate();
  
  // State for form data, error, success, and loading
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleBackClick = () => {
    navigate('/'); // Redirect to the LandingPage
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setError(''); // Clear error when user types
    setSuccess('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true); // Set loading to true when request is made
    
    const { username, email, password, confirmPassword } = formData;

    // Frontend Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setIsLoading(false); // Set loading to false if validation fails
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false); // Set loading to false if validation fails
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false); // Set loading to false if validation fails
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false); // Set loading to false if validation fails
      return;
    }

    try {
      // Log form data to check if all fields are being sent correctly
      console.log('Form Data:', formData);

      // Make the API call
      const response = await signUpUser({
        username,
        email,
        password,
        confirmPassword,
      });

      // Log the API response
      console.log('Signup response:', response);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after success
    } catch (err) {
      console.error('Signup error:', err); // Log error details for debugging

      if (err.response) {
        console.error('Response error:', err.response); // Log the full response
        const errorMessage = err.response.data?.message || 'Something went wrong. Please try again.';
        setError(errorMessage);
      } else {
        setError('Network error or backend issue.');
      }
    } finally {
      setIsLoading(false); // Set loading to false when the request is complete
    }
  };
  
  return (
    <div className={styles.signupPage}>
      <div className={styles.backgroundShapes}>
        <div className={styles.orangeTriangle}></div>
        <div className={styles.pinkCircle}></div>
        <div className={styles.yellowCircle}></div>
      </div>
      <button className={styles.backButton} onClick={handleBackClick}>
        ←
      </button>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            className={styles.inputField}
            placeholder="Enter a username"
            value={formData.username}
            onChange={handleInputChange}
          />

          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className={styles.inputField}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
          />

          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className={styles.inputField}
            placeholder="Enter your password (min. 8 characters)"
            value={formData.password}
            onChange={handleInputChange}
          />

          <label className={styles.label} htmlFor="confirmPassword">
            ConfirmPassword
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={styles.inputField}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />

          <button type="submit" className={styles.signupButton}>
            Sign Up
          </button>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
        </form>

        <div className={styles.orText}>OR</div>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <a href="/login" className={styles.loginLink}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
