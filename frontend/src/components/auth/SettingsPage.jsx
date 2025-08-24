import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft } from "react-icons/fa";
import {
  HiOutlineLogout,
  HiUser,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";

const Settings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState({
    email: false,
    oldPassword: false,
    newPassword: false,
  });

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL
      : process.env.REACT_APP_API_URL_DEV;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShow = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/api/auth/updateUser`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      if (response.data.user.username)
        localStorage.setItem("username", response.data.user.username);
      if (response.data.user.email)
        localStorage.setItem("email", response.data.user.email);
      setFormData({ ...formData, oldPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const inputStyle = {
    paddingLeft: "2.5rem",
    paddingRight: "2.5rem",
    backgroundColor: "#1a1a1a", // Dark input background
    border: "1px solid #444", // Subtle border
    color: "#fff", // White text
    borderRadius: "5px", // Slight rounding
  };

  const iconLeftStyle = {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#aaa",
  };

  const iconRightStyle = {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#aaa",
    cursor: "pointer",
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#000" }} // Black background
    >
      <div
        className="card p-5 shadow"
        style={{ maxWidth: "400px", width: "90%", backgroundColor: "pink", borderRadius: "10px" }} // Dark card
      >
        {/* Back arrow */}
        <div className="mb-3" style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
          <FaArrowLeft color="#fff" />
        </div>

        <h2 className="text-center mb-4" style={{ color: "#fff" }}>Settings</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleUpdate}>
          {/* Username */}
          <div className="mb-3 position-relative">
            <HiUser style={iconLeftStyle} size={20} />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-control"
              placeholder="Name"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div className="mb-3 position-relative">
            <HiOutlineLockClosed style={iconLeftStyle} size={20} />
            <input
              type={showPassword.email ? "text" : "email"}
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Update Email"
              style={inputStyle}
            />
            {showPassword.email ? (
              <HiOutlineEyeOff style={iconRightStyle} size={20} onClick={() => toggleShow("email")} />
            ) : (
              <HiOutlineEye style={iconRightStyle} size={20} onClick={() => toggleShow("email")} />
            )}
          </div>

          {/* Old Password */}
          <div className="mb-3 position-relative">
            <HiOutlineLockClosed style={iconLeftStyle} size={20} />
            <input
              type={showPassword.oldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="form-control"
              placeholder="Old Password"
              style={inputStyle}
            />
            {showPassword.oldPassword ? (
              <HiOutlineEyeOff style={iconRightStyle} size={20} onClick={() => toggleShow("oldPassword")} />
            ) : (
              <HiOutlineEye style={iconRightStyle} size={20} onClick={() => toggleShow("oldPassword")} />
            )}
          </div>

          {/* New Password */}
          <div className="mb-3 position-relative">
            <HiOutlineLockClosed style={iconLeftStyle} size={20} />
            <input
              type={showPassword.newPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="form-control"
              placeholder="New Password"
              style={inputStyle}
            />
            {showPassword.newPassword ? (
              <HiOutlineEyeOff style={iconRightStyle} size={20} onClick={() => toggleShow("newPassword")} />
            ) : (
              <HiOutlineEye style={iconRightStyle} size={20} onClick={() => toggleShow("newPassword")} />
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Update
          </button>
        </form>

        {/* Logout */}
        <button
          type="button"
          className="btn btn-link text-danger d-flex align-items-center p-0 mt-3"
          onClick={handleLogout}
        >
          <HiOutlineLogout className="me-1" />
          Log out
        </button>
      </div>
    </div>
  );
};

export default Settings;
