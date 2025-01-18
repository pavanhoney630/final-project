import { useState } from 'react';
import styles from '../../../src/styles/auth/ShareFormPopup.module.css';

const ShareFormPopup = ({ formUrl, email, setEmail, handleShare, togglePopup }) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const copyLinkToClipboard = () => {
    if (!formUrl) {
      alert("Form URL is not defined.");
      return;
    }
    navigator.clipboard.writeText(formUrl);
    setIsLinkCopied(true);
    alert('Form link copied to clipboard!');
  };

  return (
    <div className={styles.popupContainer}>
      <div className={styles.popupContent}>
        <h3>Share Form</h3>
        <div className={styles.inputGroup}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className={styles.emailInput}
          />
          <button onClick={handleShare} className={styles.shareButton}>
            Send Link
          </button>
        </div>
        <div className={styles.linkGroup}>
          <button onClick={copyLinkToClipboard} className={styles.copyButton}>
            Copy Form Link
          </button>
          {isLinkCopied && <span className={styles.copiedText}>Link copied!</span>}
        </div>
        <button onClick={togglePopup} className={styles.closeButton}>
        ×
        </button>
      </div>
    </div>
  );
};

export default ShareFormPopup;
