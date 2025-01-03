import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../../utils/api";
import styles from '../../../src/styles/auth/FormResponse.module.css';

const FormResponse = () => {
  const { formId } = useParams(); // Get formId from the route
  const [formData, setFormData] = useState([]); // To store responses data
  const [formStructure, setFormStructure] = useState(null); // To store form fields info
  const [error, setError] = useState(""); // To handle errors

  // Fetch the form structure and form responses on component mount
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Fetch form structure (fields info)
        const formStructureResponse = await api.get(`/auth/form/${formId}`);
        console.log("Form Structure Response:", formStructureResponse.data); // Log form structure response
        setFormStructure(formStructureResponse.data);

        // Fetch form responses data
        const response = await api.get(`/auth/form/${formId}/responses`);
        console.log("Form Responses:", response.data); // Log form responses
        setFormData(response.data);
      } catch (error) {
        setError("Error fetching form data.");
        console.error("Error fetching form data:", error);
      }
    };

    fetchFormData();
  }, [formId]); // Re-run when formId changes

  return (
    <div className={styles.container}>
      <h2>{formStructure ? `${formStructure.name}'s Responses` : 'Loading form structure...'}</h2> {/* Dynamic Heading */}
      {error && <div className={styles.error}>{error}</div>} {/* Display error if occurs */}

      {formStructure ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Submitted at</th>
              {formStructure.fields.map((field, index) => (
                <th key={index}>{field.placeholder}</th> 
              ))}
            </tr>
          </thead>
          <tbody>
            {formData.length > 0 ? (
              formData.map((data, index) => (
                <tr key={index}>
                  <td>{data.completedAt ? new Date(data.completedAt).toLocaleString() : 'Not Submitted'}</td>
                  {formStructure.fields.map((field, fieldIndex) => (
                    <td key={fieldIndex}>
                      {data.responses && data.responses[field.placeholder] ? data.responses[field.placeholder] : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={formStructure.fields.length + 1}>No responses yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <p>Loading form structure...</p>
      )}
    </div>
  );
};

export default FormResponse;
