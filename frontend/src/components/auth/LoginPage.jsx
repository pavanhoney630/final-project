import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Triangle from "../Images/triangle.png";
import Ellipse1 from "../Images/Ellipse 1.png";
import Ellipse2 from "../Images/Ellipse 2.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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
      const response = await axios.post(`${apiUrl}/api/auth/login`, formData);
      console.log("res", response.data);

      if (response.data.success) { // ✅ fixed typo
        // Save token, email, username to localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("username", response.data.user.username);

        setSuccess("Login successful! Redirecting to dashboard...");

        
       navigate("/dashboard", { replace: true }); 
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error try after sometime");
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

      {/* Login Form */}
      <div className="card p-5 shadow" style={{ maxWidth: "400px", width: "90%", backgroundColor:"green" }}>
        <h2 className="text-center mb-4 text-white">Log In</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-white">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="text-white">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-3">
            Log In
          </button>
        </form>

        <p className="text-center mt-3 text-white">
          Don’t have an account? <a href="/signup">Register now</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
