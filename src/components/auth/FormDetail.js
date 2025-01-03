// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../../utils/api";
// import FormResponseStats from '../auth/FormResponseStats'; 

// const FormDetail = () => {
//   const { formId } = useParams();
//   const [formData, setFormData] = useState(null);
//   const [error, setError] = useState("");
//   const [formValues, setFormValues] = useState({});
//   const [formStarted, setFormStarted] = useState(false);
//   const userId = "user_id_here"; // Replace with the actual user ID logic

//   useEffect(() => {
//     const fetchFormData = async () => {
//       try {
//         const response = await api.get(`/auth/form/${formId}`);
//         setFormData(response.data);

//         // Track form access
//         trackFormAccess(formId, userId); // Track form access when data is fetched
//       } catch (error) {
//         const message =
//           error.response?.status === 404 ? "Form not found." : "Failed to load form data.";
//         setError(message);
//         console.error("Error fetching form data:", error.response?.data || error.message);
//       }
//     };

//     fetchFormData();
//   }, [formId]);

//   // Track form access
//   const trackFormAccess = async (formId, userId) => {
//     try {
//       await api.post(`/auth/form/${formId}/interact`, {
//         userId,
//         status: "access",
//       });
//     } catch (error) {
//       console.error("Error tracking form access", error);
//     }
//   };

//   // Handle form start (user begins interacting with the form)
//   const handleFormStart = () => {
//     if (!formStarted) {
//       const progress = 10; // Adjust this value based on progress or logic
//       trackFormStart(formId, userId, progress);
//       setFormStarted(true);
//     }
//   };

//   const trackFormStart = async (formId, userId, progress) => {
//     try {
//       await api.post(`/auth/form/${formId}/interact`, {
//         userId,
//         status: "start",
//         progress,
//       });
//     } catch (error) {
//       console.error("Error tracking form start", error);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post(`/auth/form/${formId}/submit`, formValues);
//       alert("Form submitted successfully!");
//       console.log(response.data);
//       // Track form submission
//       trackFormSubmit(formId, userId, formValues);
//     } catch (error) {
//       console.error("Error submitting form:", error.response?.data || error.message);
//       alert("Failed to submit form.");
//     }
//   };

//   // Track form submission
//   const trackFormSubmit = async (formId, userId, responses) => {
//     try {
//       await api.post(`/auth/form/${formId}/interact`, {
//         userId,
//         status: "submit",
//         responses,
//       });
//     } catch (error) {
//       console.error("Error tracking form submission", error);
//     }
//   };

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormValues({
//       ...formValues,
//       [name]: value,
//     });
//   };

//   if (error) {
//     return <div>{error}</div>;
//   }

//   if (!formData) {
//     return <div>Loading form data...</div>;
//   }

//   return (
//     <div>
//       <h1>{formData.name}</h1>
//        <FormResponseStats formId={formId} />
//       <form onSubmit={handleSubmit}>
//         <ul>
//           {formData.fields.map((field, index) => (
//             <li key={index}>
//               <label>
//                 <strong>{field.label}</strong>:
//                 <input
//                   type={field.type}
//                   placeholder={field.placeholder}
//                   name={field.name}
//                   value={formValues[field.name] || ""}
//                   onChange={handleInputChange}
//                   onFocus={handleFormStart} // Track form start on focus
//                 />
//               </label>
//             </li>
//           ))}
//         </ul>
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// };

// export default FormDetail;
