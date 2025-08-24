import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate
import "bootstrap/dist/css/bootstrap.min.css";
import Triangle from "../Images/triangle.png";
import Ellipse1 from "../Images/Ellipse 1.png";
import Ellipse2 from "../Images/Ellipse 2.png";

const Signup = () => {
  const navigate = useNavigate(); // <-- initialize navigate
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL
      : process.env.REACT_APP_API_URL_DEV;
 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${apiUrl}/api/auth/register`, formData);
      setSuccess(response.data.message);
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });

      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1000); // optional delay to show success message
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center position-relative bg-dark">
      {/* Decorative Images */}
      <img
        src={Triangle}
        alt="triangle"
        style={{ position: "absolute", left: "5%", top: "30%", width: "100px" }}
      />
      <img
        src={Ellipse1}
        alt="ellipse1"
        style={{ position: "absolute", right: "5%", bottom: "10%", width: "120px" }}
      />
      <img
        src={Ellipse2}
        alt="ellipse2"
        style={{ position: "absolute", right: "0", top: "0", width: "150px" }}
      />

      {/* Signup Form */}
      <div className="card p-5 shadow" style={{ maxWidth: "400px", width: "90%",backgroundColor:"pink" }}>
        <h2 className="text-center mb-4">Sign Up</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter username"
              required
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter password"
              required
            />
          </div>
          <div className="mb-3">
            <label className={formData.password !== formData.confirmPassword ? "text-danger" : ""}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control ${formData.password !== formData.confirmPassword ? "border-danger" : ""}`}
              placeholder="Confirm password"
              required
            />
            {formData.password !== formData.confirmPassword && (
              <small className="text-danger">Passwords must match</small>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-3">
            Sign Up
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
