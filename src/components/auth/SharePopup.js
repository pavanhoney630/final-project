import React, { useState } from 'react';
import api from '../../utils/api'; // Assuming api utility is set up correctly
import styles from '../../../src/styles/auth/SharePopup.module.css';

const SharePopup = ({ closePopup, workspaceId, userEmail,  }) => {
  const [accessType, setAccessType] = useState('View'); // Default access type is 'View'
  const [email, setEmail] = useState(''); // State to hold email input
  const [accessLink, setAccessLink] = useState(''); // State to hold the generated access link

  // Handle dropdown selection change
  const handleAccessChange = (event) => {
    setAccessType(event.target.value);
  };

  // Handle email input change
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  // Generate Access Link
  const generateAccessLink = async () => {
    const token = localStorage.getItem('token'); // Get the token from localStorage
  
    if (!token) {
      alert('No valid token found. Please log in first.');
      return;
    }
  
    try {
      const response = await api.post(
        '/generate-link',
        {
          workspaceId,
          accessType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to headers
          },
        }
      );
  
      // Log the response to check the link
      console.log('Response:', response.data);
      
      setAccessLink(response.data.accessLink); // Set the generated link
      navigator.clipboard.writeText(response.data.accessLink); // Copy the link to clipboard
      alert('Access link copied to clipboard!');
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Failed to generate access link. Please try again.');
    }
  };
  
  

  // Send Email Invite
  const sendInvite = async () => {
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }
    try {
      const response = await api.post('/send-invite', {
        email,        // Email to send the invite
        accessType,   // Access type (View/Edit)
        workspaceId,  // Workspace ID for the invite
      });
      if (response.status === 200) {
        alert(`Invite sent to ${email} with ${accessType} access.`);

      } else {
        alert('Failed to send invite. Please try again.');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invite. Please try again.');
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={closePopup}>
          ×
        </button>

        {/* Access Dropdown */}
        <div className={styles.dropdownWrapper}>
          <select
            value={accessType}
            onChange={handleAccessChange}
            className={styles.accessDropdown}
          >
            <option value="Edit">Edit</option>
            <option value="View">View</option>
          </select>
        </div>

        {/* Invite by Email */}
        <h3 className={styles.sectionTitle}>Invite by Email</h3>
        <input
          type="email"
          placeholder="Enter email id"
          value={email}
          onChange={handleEmailChange}
          className={styles.emailInput}
        />
        <button className={styles.sendInviteButton} onClick={sendInvite}>
          Send Invite
        </button>

        {/* Invite by Link */}
        <h3 className={styles.sectionTitle}>Invite by Link</h3>
        <button className={styles.copyLinkButton} onClick={generateAccessLink}>
          Copy link
        </button>

        {/* Display Generated Link */}
        {accessLink && (
          <div className={styles.generatedLink}>
            <p>Generated Link:</p>
            <a href={accessLink} target="_blank" rel="noopener noreferrer">
              {accessLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePopup;
