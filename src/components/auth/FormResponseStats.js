import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../../utils/api';
import styles from '../../../src/styles/auth/FormResponseStats.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const FormResponseStats = () => {
  const [forms, setForms] = useState([]); // List of forms
  const [selectedFormId, setSelectedFormId] = useState(null); // Currently selected form
  const [stats, setStats] = useState({ accessed: 0, started: 0, submitted: 0 });
  const [submittedData, setSubmittedData] = useState([]); // Submitted responses data
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state
  const [theme, setTheme] = useState('dark'); // Theme management

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to 'dark' if not set
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme); // Apply the saved theme to the body element
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme); // Apply theme to body element
    localStorage.setItem('theme', newTheme); // Save the new theme in localStorage
  };

  // Fetch the list of forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No valid token provided.');
          return;
        }

        const response = await api.get('/auth/forms', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setForms(response.data);
      } catch (error) {
        setError('Failed to fetch forms.');
        console.error('Error fetching forms:', error);
      }
    };

    fetchForms();
  }, []);

  // Fetch stats for selected form
  const fetchStats = async () => {
    if (!selectedFormId) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No valid token provided.');
        return;
      }

      const response = await api.get(`/auth/form/formId/responses/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data);
    } catch (error) {
      setError('Failed to load form response stats.');
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No valid token provided.');
        return;
      }

      const response = await api.post(`/auth/form/formId/responses`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // After submission, fetch stats again
      await fetchStats(); // Now we can call fetchStats after submission

      // Update submitted data
      setSubmittedData(prevData => [...prevData, response.data]);

    } catch (error) {
      setError('Failed to submit data.');
      console.error('Error submitting data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClick = (formId) => {
    setSelectedFormId(formId);
  };

  const chartData = {
    labels: ['Accessed', 'Started', 'Submitted'],
    datasets: [
      {
        data: [stats.accessed, stats.started, stats.submitted],
        backgroundColor: ['#FF5733', '#FFBD33', '#33FF57'],
        hoverBackgroundColor: ['#FF5733', '#FFBD33', '#33FF57'],
      },
    ],
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.navButtons}>
          <button className={styles.navButtonText}>Flow</button>
          <button className={styles.navButtonText2}>Response</button>
        </div>
        <div className={styles.rightButtons}>
          <div className={styles.themeToggle}>
            <span
              className={theme === 'dark' ? styles.activeTheme : styles.inactiveTheme}
              onClick={() => setTheme('dark')}
            >
              Dark
            </span>
            {/* Glide Button */}
            <button
              className={styles.glideButton}
              onClick={toggleTheme}
            >
              <span className={theme === 'dark' ? styles.glideActive : styles.glideInactive}></span>
            </button>
            <span
              className={theme === 'light' ? styles.activeTheme : styles.inactiveTheme}
              onClick={() => setTheme('light')}
            >
              Light
            </span>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              className={styles.toggleInput}
              style={{ display: 'none' }}
            />
          </div>
          <button className={styles.shareButton}>Share</button>
          <button className={styles.saveButton}>Save</button>
          <button className={styles.closeButton}>X</button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <h2>Response Dashboard</h2>
        {error && <div className={styles.error}>{error}</div>}

        {/* Render Pie Chart */}
        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            <div className={styles.chartContainer}>
              <h3>Stats for Form: {selectedFormId}</h3>
              <Pie data={chartData} />
            </div>

            {/* Render Submitted Data Table */}
            {submittedData.length > 0 && (
              <div className={styles.tableContainer}>
                <h3>Submitted Responses</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedData.map((data, index) => (
                      <tr key={index}>
                        <td>{data.id}</td>
                        <td>{data.status}</td>
                        <td>{new Date(data.submittedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Render Forms List */}
        {!selectedFormId && (
          <div className={styles.formsList}>
            {forms.map((form) => (
              <button
                key={form.id}
                onClick={() => handleFormClick(form.id)}
                className={styles.formButton}
              >
                {form.name}
              </button>
            ))}
          </div>
        )}

        {/* Form Submission */}
        {selectedFormId && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ formId: selectedFormId }); }}>
            {/* Add your form fields here */}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}

        {/* Back Button */}
        {selectedFormId && (
          <button onClick={() => setSelectedFormId(null)} className={styles.backButton}>
            Back to Forms
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Scroll bar if the columns are more</p>
      </footer>
    </div>
  );
};

export default FormResponseStats;
