import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api'; // Make sure to adjust the import path

localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));


const FormPage = () => {
  const { formId } = useParams(); // Get formId from the URL
  const navigate = useNavigate();

  const [formSchema, setFormSchema] = useState(null); // Store form schema
  const [formData, setFormData] = useState({}); // Store form data dynamically
  const [message, setMessage] = useState('Hi! Please fill the details below'); // Initial message
  const [isSubmitted, setIsSubmitted] = useState(false); // Track form submission status
  const [userId, setUserId] = useState(null); // Store the generated userId

  // Function to generate or retrieve userId
  const generateUserId = () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9); // Generate random ID
      localStorage.setItem("userId", userId); // Store in localStorage for persistence
      console.log("Generated new userId:", userId); // Log the newly generated userId
    } else {
      console.log("Retrieved userId from localStorage:", userId); // Log the retrieved userId
    }
    return userId;
  };

  // Initialize userId on first load
  useEffect(() => {
    const userId = generateUserId();
    setUserId(userId); // Set the userId
  }, []);

  // Track form access
  useEffect(() => {
    if (!formId || !userId) {
      console.error('Form ID or User ID is missing.');
      return;
    }

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
          userId: userId, // Use the dynamically generated userId
          progress: 0,
        });
      } catch (error) {
        console.error('Error tracking form access:', error);
      }
    };

    // Fetch form schema and track access
    fetchFormSchema();
    trackAccess();
  }, [formId, userId]);

  // Handle input change dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      const progress = Math.min((Object.keys(updatedData).length / formSchema.fields.length) * 100, 100);

      if (!isSubmitted && progress > 0 && !updatedData.__started__) {
        api.post(`/auth/form/${formId}/interact`, {
          status: 'start',
          userId: userId, // Use dynamically generated userId
          progress,
        }).catch((error) => console.error('Error tracking start:', error));
        updatedData.__started__ = true;
      }

      return updatedData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post(`/auth/form/${formId}/interact`, {
      status: 'submit',
      userId: userId, // Use dynamically generated userId
      progress: 100,
      responses: formData,
    })
      .then(() => {
        setMessage('Thank you for your response!');
        setIsSubmitted(true);
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
      });
  };

  // Handle navigating to the Response page
  const handleResponseClick = () => {
    navigate(`/auth/form/${formId}/response`);
  };

  if (!formSchema) return <div>Loading form...</div>; // Show loading state while fetching schema

  return (
    <div>
      <h1>{formSchema.name}</h1> {/* Show form name */}
      <p>{message}</p> {/* Display initial message or thank you message */}

      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          {formSchema.fields.map((field, index) => (
            <div key={index}>
              <label htmlFor={field.name}>{field.placeholder}</label>
              {field.type === 'text' && (
                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                />
              )}
              {/* Handle other types of inputs (e.g., email, radio, select) here */}
            </div>
          ))}

          {/* Submit button */}
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div>
          <button onClick={handleResponseClick}>View Response Stats</button>
        </div>
      )}
    </div>
  );
};

export default FormPage;
