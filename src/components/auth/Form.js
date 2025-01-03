import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import styles from "../../../src/styles/auth/Form.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFlag,
  faCalendar,
  faHashtag,
  faPhone,
  faStar,
  faImage,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

import ShareFormPopup from '../../components/auth/ShareFormPopup';

const Form = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [formFields, setFormFields] = useState(() => {
    const savedFields = localStorage.getItem("formFields");
    return savedFields ? JSON.parse(savedFields) : [];
  });
  const [fieldCounts, setFieldCounts] = useState({
    text: 0,
    email: 0, // Track email fields
    number: 0,
    phone: 0,
    date: 0,
    rating: 0,
    button: 0,
    image: 0,
  });
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate(); 
  useEffect(() => {
    document.body.className = darkMode ? styles.dark : styles.light;
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("formFields", JSON.stringify(formFields));
  }, [formFields]);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleAddField = (fieldType) => {
    const newCount = fieldCounts[fieldType] + 1;

    const placeholders = {
      text: "Click here to edit",
      email: "Enter email", // Placeholder for email field
      date: "Select date",
      number: "Enter number",
      phone: "Enter phone number",
      rating: "Enter rating",
      button: "Button label",
      image: "Click to add link",
    };

    const fieldNames = {
      text: `InputField${newCount}`,
      email: `Email${newCount}`,
      number: `Number${newCount}`,
      phone: `Phone${newCount}`,
      date: `Date${newCount}`,
      rating: `Rating${newCount}`,
      button: `Button${newCount}`,
      image: `Image${newCount}`,
    };

    setFieldCounts((prevCounts) => ({
      ...prevCounts,
      [fieldType]: newCount,
    }));

    setFormFields((prevFields) => [
      ...prevFields,
      {
        type: fieldType,
        placeholder: placeholders[fieldType] || "",
        name: fieldNames[fieldType] || "",
      },
    ]);
  };

  const removeField = (index, e) => {
    e.preventDefault();
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const [formName, setFormName] = useState("");

  const saveForm = async () => {
    try {
      const formData = {
        name: formName, // Form name
        fields: formFields.map((field) => ({
          type: field.type,
          name: field.name, // Ensure name is included
          placeholder: field.placeholder,
        })),
      };

      console.log("Form data to be sent:", formData); // Log form data to check fields

      const response = await api.post("/auth/form/submit", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Form saved successfully:", response.data);
      setIsFormSaved(true);
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };
  const [email, setEmail] = useState("");
  const handleShare = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated. Please log in.");
        return; // Exit if no token
      }
  
      const response = await api.post(
        "/auth/send-form-email",
        { email }, // Request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        }
      );
  
      alert(response.data.message); // Show success message
    } catch (error) {
      alert("Failed to send form link.");
      console.error(error.response?.data || error.message); // Log error for debugging
    }
  };
  const togglePopup = () => {
    setIsPopupVisible((prevState) => !prevState);
  };

  // Reset form fields and field counts
  // const resetForm = () => {
  //   setFormFields([]);
  //   setFieldCounts({
  //     text: 0,
  //     email: 0,
  //     number: 0,
  //     phone: 0,
  //     date: 0,
  //     rating: 0,
  //     button: 0,
  //     image: 0,
  //   });
  //   setFormName('');
  //   setIsFormSaved(false);
  // };
  const handleResponseClick = () => {
    navigate(`/response`);  // Navigate to the response page
  };

  const resetToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className={styles.formContainer}>
      <header className={styles.header}>
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Enter form name"
          className={styles.formNameInput}
        />
        <div className={styles.navButtons}>
          <span className={styles.navButtonText}>Flow</span>
          <span className={styles.navButtonText2} onClick={handleResponseClick}>Response</span>
        </div>
        <div className={styles.themeToggle}>
          <span className={styles.toggleText}>Light</span>
          <div className={styles.toggleContainer} onClick={toggleTheme}>
            <div
              className={`${styles.toggle} ${darkMode ? styles.active : ""}`}
            ></div>
          </div>
          <span className={styles.toggleText}>Dark</span>
        </div>
        <div className={styles.actionButtons}>
        <button
            className={`${styles.actionButton} ${styles.shareButton} ${
              !isFormSaved ? styles.disabled : ""
            }`}
            onClick={togglePopup}
            disabled={!isFormSaved}
          >
            Share
          </button>
          <button
            className={`${styles.actionButton} ${styles.saveButton}`}
            onClick={saveForm}
          >
            Save
          </button>
          

          <button className={styles.closeButton} onClick={resetToHome}>
            X
          </button>
          {/* <button className={styles.actionButton} onClick={resetForm}> 
            Reset
          </button> */}
        </div>
      </header>
       {/* Conditionally render ShareFormPopup */}
    {isPopupVisible && (
      <ShareFormPopup
        email={email}
        setEmail={setEmail}
        handleShare={handleShare}
        togglePopup={togglePopup}
      />
    )}
    
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.section}>
            <h3 style={{ color: darkMode ? "#fff" : "#000" }}>Bubbles</h3>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("text")}
            >
              <FontAwesomeIcon icon={faEdit} className={styles.buttonIcon} />{" "}
              Text
            </button>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("image")}
            >
              <FontAwesomeIcon icon={faImage} className={styles.buttonIcon} />{" "}
              Image
            </button>
          </div>
          <div className={styles.section}>
            <h3 style={{ color: darkMode ? "#fff" : "#000" }}>Inputs</h3>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("text")}
            >
              <FontAwesomeIcon icon={faEdit} className={styles.buttonIcon} />{" "}
              Text
            </button>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("date")}
            >
              <FontAwesomeIcon
                icon={faCalendar}
                className={styles.buttonIcon}
              />{" "}
              Date
            </button>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("number")}
            >
              <FontAwesomeIcon icon={faHashtag} className={styles.buttonIcon} />{" "}
              Email
            </button>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("phone")}
            >
              <FontAwesomeIcon icon={faPhone} className={styles.buttonIcon} />{" "}
              Phone
            </button>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("rating")}
            >
              <FontAwesomeIcon icon={faStar} className={styles.buttonIcon} />{" "}
              Rating
            </button>
            <button
              className={styles.sidebarButton}
              onClick={() => handleAddField("button")}
            >
              <FontAwesomeIcon icon={faEdit} className={styles.buttonIcon} />{" "}
              Button
            </button>
          </div>
        </aside>
        <main className={styles.mainContent}>
          <div className={styles.startFlag}>
            <FontAwesomeIcon
              icon={faFlag}
              className={styles.flagIcon}
              style={{ color: darkMode ? "#fff" : "#000" }}
            />
            <span
              style={{ color: darkMode ? "#fff" : "#000", marginLeft: "10px" }}
            >
              Start
            </span>
          </div>
          <div className={styles.formPreview}>
            {formFields.map((field, index) => (
              <div key={index} className={styles.previewFieldWrapper}>
                <div
                  style={{
                    color: darkMode ? "#fff" : "#000",
                    marginBottom: "5px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {field.name}
                </div>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`${styles.previewField} ${
                    darkMode ? styles.darkField : styles.lightField
                  }`}
                  style={{
                    backgroundColor: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#fff" : "#000",
                    border: darkMode ? "1px solid #fff" : "1px solid #000",
                  }}
                />
                <FontAwesomeIcon
                  icon={faTrash}
                  className={styles.removeIcon}
                  onClick={(e) => removeField(index, e)}
                  style={{ position: "absolute", top: "-3px", right: "-2px" }}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Form;
