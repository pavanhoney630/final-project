import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock, faArrowRightFromBracket,faUser } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom'; // Use for programmatic navigation
import styles from '../../../src/styles/auth/ForgotPassword.module.css';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare data based on user inputs
    const updateData = {};
  
    // Username validation
    if (username && username.length < 3) {
      alert('Username must be at least 3 characters long.');
      return;
    } else if (username) {
      updateData.username = username;
    }
  
    // Email validation
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    } else if (email) {
      updateData.email = email;
    }
  
    // Password validation
    if (newPassword) {
      if (!oldPassword) {
        alert('Please enter the old password to update the new password.');
        return;
      }
      if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long.');
        return;
      }
  
      updateData.oldPassword = oldPassword;
      updateData.newPassword = newPassword;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User not authenticated. Please log in.');
        return;
      }
  
      const response = await fetch('http://localhost:5000/auth/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Details updated successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the details.');
    }
  };
  

  const handleLogout = () => {
    // Clear user session from localStorage
    localStorage.removeItem('token');
    // Redirect to the landing page
    navigate('/');
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <h2 className={styles.forgotPasswordHeading}>Update Account Details</h2>
      <form className={styles.forgotPasswordForm} onSubmit={handleSubmit}>
        {/* Username Field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your name"
              className={styles.inputField}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={styles.inputField}
            />
          </div>
        </div>

        {/* Old Password Field (for password change) */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faLock} className={styles.icon} />
            <input
              type={oldPasswordVisible ? 'text' : 'password'}
              id="oldPassword"
              value={oldPassword}
              onChange={handleOldPasswordChange}
              placeholder="Enter your old password"
              className={styles.inputField}
            />
            <FontAwesomeIcon
              icon={oldPasswordVisible ? faEyeSlash : faEye}
              className={styles.eyeIcon}
              onClick={() => setOldPasswordVisible(!oldPasswordVisible)}
            />
          </div>
        </div>

        {/* New Password Field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faLock} className={styles.icon} />
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder="Enter your new password(oldPassword Required)"
              className={styles.inputField}
            />
            <FontAwesomeIcon
              icon={passwordVisible ? faEyeSlash : faEye}
              className={styles.eyeIcon}
              onClick={() => setPasswordVisible(!passwordVisible)}
            />
          </div>
        </div>

        <button type="submit" className={styles.updateButton}>Update Details</button>
      </form>

      {/* Logout Button with FontAwesome Icon */}
      <button className={styles.logoutButton} onClick={handleLogout}>
        <FontAwesomeIcon icon={faArrowRightFromBracket} className={styles.logoutIcon} />
        Log Out
      </button>
    </div>
  );
};

export default ForgotPassword;
