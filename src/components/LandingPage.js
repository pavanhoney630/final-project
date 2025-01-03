import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';
import myImage from './mylanding.png'; // Landing page image
import formBotImage from './FormBot.png'; // FormBot logo

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.landingPage}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={formBotImage} alt="FormBot Logo" className={styles.logoImage} />
          <span className={styles.logoText}>FormBot</span>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.signInButton} onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button className={styles.createButton} onClick={() => navigate('/create')}>
            Create a FormBot
          </button>
        </div>
      </header>

      {/* Body Section */}
      <div className={styles.imageContainer}>
        <img src={myImage} alt="Landing Page" className={styles.landingImage} />
      </div>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          {/* Logo Section */}
          <div className={styles.footerLogo}>
            <img src={formBotImage} alt="FormBot Logo" className={styles.footerLogoImage} />
            <div className={styles.footerLogoTextContainer}>
              <span className={styles.footerLogoText}>FormBot</span>
              <div className={styles.footerMadeBy}>
                <span>Made with ❤️</span>
                <span>
                  by{' '}
                  <a
                    href="https://cuvette.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footerLink}
                  >
                    @cuvette
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className={styles.footerLinks}>
            <div>
              <h4>Product</h4>
              <span>Status</span>
              <span>Documentation</span>
              <span>Roadmap</span>
              <span>Pricing</span>
            </div>
            <div>
              <h4>Community</h4>
              <span>Discord</span>
              <span>GitHub Repository</span>
              <span>Twitter</span>
              <span>LinkedIn</span>
              <span>OSS Friends</span>
            </div>
            <div>
              <h4>Company</h4>
              <span>About</span>
              <span>Contact</span>
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
