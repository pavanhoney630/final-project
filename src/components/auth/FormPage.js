import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa'; // Import the send icon
import api from '../../utils/api'; // Adjust the import path if necessary
import styles from '../../styles/auth/FormPage.module.css'; // Import the CSS module

const FormPage = () => {
  const { formId } = useParams(); // Get formId from the URL
  const navigate = useNavigate();

  const [formSchema, setFormSchema] = useState(null); // Store form schema
  const [formData, setFormData] = useState({}); // Store form data dynamically
  const [message, setMessage] = useState('Hi! Please fill the details below'); // Initial message
  const [isSubmitted, setIsSubmitted] = useState(false); // Track form submission status
  const [userId, setUserId] = useState(null); // Store the generated userId
  const [currentStep, setCurrentStep] = useState(0); // Track the current step of the form
  const [inputValue, setInputValue] = useState(''); // Store the input value for the single field

  // Function to generate or retrieve userId
  const generateUserId = () => {
    let userId = localStorage.getItem('userId');

    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9); // Generate a random ID
      localStorage.setItem('userId', userId); // Store in localStorage for persistence
    }

    return userId;
  };

  // Initialize userId on first load
  useEffect(() => {
    const userId = generateUserId();
    setUserId(userId);
  }, []);

  // Track form access and fetch form schema once userId is set
  useEffect(() => {
    if (!formId || !userId) return;

    const fetchFormSchema = async () => {
      try {
        const response = await api.get(`/auth/form/${formId}`);
        setFormSchema(response.data); // Set the form schema
      } catch (error) {
        console.error('Error fetching form schema:', error);
      }
    };

    const trackAccess = async () => {
      try {
        await api.post(`/auth/form/${formId}/interact`, {
          status: 'access',
          userId,
          progress: 0,
        });
      } catch (error) {
        console.error('Error tracking form access:', error);
      }
    };

    fetchFormSchema();
    trackAccess();
  }, [formId, userId]);

  // Handle single input submission
  const handleInputSubmit = () => {
    const currentField = formSchema.fields[currentStep];
    const updatedData = { ...formData, [currentField.name]: inputValue };

    setFormData(updatedData);
    setInputValue(''); // Clear the input field

    if (currentStep < formSchema.fields.length - 1) {
      setCurrentStep(currentStep + 1); // Move to the next step
    } else {
      handleSubmit(updatedData);
    }
  };

  // Handle form submission
  const handleSubmit = (data) => {
    api.post(`/auth/form/${formId}/interact`, {
      status: 'submit',
      userId,
      progress: 100,
      responses: data,
    })
      .then(() => {
        setMessage('Thank you for your response!');
        setIsSubmitted(true);
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
      });
  };

  if (!formSchema) return <div>Loading form...</div>; // Show loading state while fetching schema

  const currentField = formSchema.fields[currentStep]; // Get the current step's field

  return (
    <div className={styles.chatContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.formTitle}>{formSchema.name}</h1> {/* Form name dynamically rendered */}
        <p className={styles.botMessage}>{message}</p> {/* Initial or thank you message */}

        {!isSubmitted ? (
          <div className={styles.messageBubble}>
            <p>{currentField.placeholder}</p> {/* Current field question */}
            <div className={styles.inputWrapper}>
              <input
                type={currentField.type === 'date' ? 'date' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentField.placeholder}
                className={styles.inputField}
              />
              <button
                onClick={handleInputSubmit}
                className={styles.sendButton}
                disabled={!inputValue.trim()} // Disable if input is empty
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.thankYouWrapper}>
            <button
              onClick={() => navigate(`/auth/form/${formId}/response`)}
              className={styles.nextButton}
            >
              View Response Stats
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPage;
