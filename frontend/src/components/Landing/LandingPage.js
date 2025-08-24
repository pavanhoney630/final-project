import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import LandingImage from "../Images/Landing Page.png"; // adjust filename if needed

const LandingPage = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand">
            MyApp
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/features" className="nav-link">
                  Features
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mt-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="display-4">Welcome to MyApp</h1>
            <p className="lead">
              Build amazing applications with React and Bootstrap. Get started today!
            </p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          </div>
          <div className="col-md-6">
            <img
              src={LandingImage}
              className="img-fluid rounded"
              alt="Landing"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <p className="mb-0">&copy; 2025 MyApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
