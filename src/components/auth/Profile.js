import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SharePopup from './SharePopup'; // Importing the SharePopup component
import styles from '../../../src/styles/auth/Profile.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';

const Profile = () => {
  const location = useLocation();
  const [theme, setTheme] = useState('dark');
  const [username, setUsername] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [folders, setFolders] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [accessType,setAccessType ] = useState('')
  

  const navigate = useNavigate();

  // Fetch user details from API and store them in localStorage
  // const token = localStorage.getItem('token');
 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const text = await response.text(); // Get the response as text

        // Check if the response is valid JSON
        let data;
        try {
          data = JSON.parse(text); // Try to parse the response as JSON
        } catch (error) {
          console.error('Response is not valid JSON:', text);
          return;
        }

        const fetchedUsername = data.username;
        const fetchedUserEmail = data.email;
        const fetchedTheme = data.theme || 'dark';

        // Save to localStorage for persistence
        localStorage.setItem('username', fetchedUsername);
        localStorage.setItem('userEmail', fetchedUserEmail);
        localStorage.setItem('theme', fetchedTheme);

        // Store the account in accounts list if not already present
        const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        if (!accounts.includes(fetchedUsername)) {
          accounts.push(fetchedUsername);
          localStorage.setItem('accounts', JSON.stringify(accounts));
        }

        // Update state to reflect the new user data
        setUsername(fetchedUsername);
        setUserEmail(fetchedUserEmail);
        setTheme(fetchedTheme);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  
  useEffect(() => {
    // Extract accessType from URL query params
    const params = new URLSearchParams(location.search);
    const access = params.get('accessType');
    
    // Set accessType only if it's available in the URL
    if (access) {
      setAccessType(access);
    } else {
      setAccessType(null); // You can leave it as null if no accessType is present
    }
  }, [location.search]); // Re-run when the URL changes

  useEffect(() => {
    const username = localStorage.getItem('username');
    const theme = localStorage.getItem('theme');
    const email = localStorage.getItem('email');

    if (username) {
      setUsername(username);
    }
    if (theme) {
      setTheme(theme);
    }
    if (email) {
      setUserEmail(email);
    }

     

    // Load folders from localStorage for the active user
    const storedFolders = localStorage.getItem(`folders_${username}`);
    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    } else {
      setFolders([]);
    }
  }, [username]);

  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem('accounts')) || [];
    if (!storedAccounts.includes(username)) {
      storedAccounts.push(username);
      localStorage.setItem('accounts', JSON.stringify(storedAccounts));
    }
  }, [username]); 

  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem(`folders_${username}`, JSON.stringify(folders)); // Store folders for the active user
    }
  }, [folders, username]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    // const currentUsername = localStorage.getItem('username');
    // localStorage.removeItem('token');
    // localStorage.removeItem('username');
    // localStorage.removeItem('userEmail');
    // localStorage.removeItem('theme');
   
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);  
     
  };
  
  const toggleCreatePopup = () => {
    setShowCreatePopup(!showCreatePopup);
    setNewFolderName('');
  };

  const toggleFormPopup = () => {
    setShowFormPopup(!showFormPopup);
    setNewFormName('');
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() === '') {
      alert('Folder name cannot be empty.');
      return;
    }
    const newFolders = [...folders, { name: newFolderName, forms: [] }];
    setFolders(newFolders);
    toggleCreatePopup();
  };

  const handleCreateForm = () => {
    if (newFormName.trim() === '') {
      alert('Form name cannot be empty.');
      return;
    }
    const form = { name: newFormName, color: getRandomColor() };
    const updatedFolders = folders.map(folder =>
      folder === selectedFolder ? { ...folder, forms: [...folder.forms, form] } : folder
    );
    setFolders(updatedFolders);
    toggleFormPopup();
  };

  const getRandomColor = () => {
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const toggleDeletePopup = (folder) => {
    setFolderToDelete(folder);
    setShowDeletePopup(!showDeletePopup);
  };

  const handleDeleteFolder = () => {
    const updatedFolders = folders.filter((folder) => folder !== folderToDelete);
    setFolders(updatedFolders);
    localStorage.setItem(`folders_${username}`, JSON.stringify(updatedFolders));
    setShowDeletePopup(false);
    
  };

  const handleFormClick = (form) => {
    navigate('/Form', { state: { formName: form.name } }); 
  };

  const switchAccount = (newUsername) => {
    // Set the new username in localStorage
    localStorage.setItem('username', newUsername);
    setUsername(newUsername);
  
    // Load folders for the switched account
    const storedFolders = localStorage.getItem(`folders_${newUsername}`);
    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    } else {
      setFolders([]); // If no folders are found for the new user, set an empty array
    }
  };
  

  // const handleRemoveAccount = (accountToRemove) => {
  //   const updatedAccounts = JSON.parse(localStorage.getItem('accounts') || '[]').filter(account => account !== accountToRemove);
  //   localStorage.setItem('accounts', JSON.stringify(updatedAccounts));

  //   // If the removed account was the current one, log out
  //   if (accountToRemove === username) {
  //     handleLogout();
  //   }
  // };

  return (
    <div className={`${styles.profilePage} ${theme === 'dark' ? styles.dark : styles.light}`}>
      <div className={styles.topSection}>
        <div className={styles.workspaceDropdown}>
          <button className={styles.workspaceButton} onClick={toggleDropdown}>
            {username ? `${username}'s Workspace` : 'Loading...'} ▼ 
          </button>
          {dropdownVisible && (
            <div className={styles.dropdownMenu}>
              {JSON.parse(localStorage.getItem('accounts') || '[]').map((account, index) => (
                <div key={index} className={styles.dropdownItem}>
                  <button
                    onClick={() => switchAccount(account)}
                    className={styles.switchAccountButton}
                  >
                    {account}
                  </button>
                </div>
              ))}
              <button
                className={styles.dropdownItem}
                onClick={() => navigate('/settings')}
              >
                Settings
              </button>
              <button
                className={`${styles.dropdownItem} ${styles.logout}`}
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
  
        <div className={styles.rightControls}>
          <div className={`${styles.themeToggle} ${theme === 'dark' ? styles.darkMode : ''}`}>
            <span>Light</span>
            <div
              className={`${styles.toggleSwitch} ${theme === 'dark' ? styles.darkMode : ''}`}
              onClick={toggleTheme}
            >
              <div className={styles.toggleKnob}></div>
            </div>
            <span>Dark</span>
          </div>
          <button className={styles.shareButton} onClick={togglePopup}>
            Share
          </button>
        </div>
      </div>
  
      <div className={styles.horizontalLine}></div>
  
      <div className={styles.mainSection}>
        {/* Conditional rendering based on accessType */}
        {accessType === 'Edit' ? (
          // Render editing options
          <div className={styles.folderContainer}>
            <div className={styles.createFolderWrapper}>
              <button className={styles.createFolderButton} onClick={toggleCreatePopup}>
                <FontAwesomeIcon icon={faFolderPlus} /> Create Folder
              </button>
              <div className={styles.folderList}>
                {folders.map((folder, index) => (
                  <div
                    key={index}
                    className={styles.folderItem}
                    onClick={() => {
                      setSelectedFolder(folder);
                      setShowFormPopup(true); 
                    }}
                  >
                    <span>{folder.name}</span>
                    <FontAwesomeIcon
                      icon={faTrash}
                      className={styles.deleteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDeletePopup(folder);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
  
            <button className={styles.createTypebotButton} onClick={() => console.log('Create Typebot')}>
              <span className={styles.plusSign}>+</span> Create Typebot
            </button>
          </div>
        ) : (
          // Render view-only access
          <div className={styles.folderContainer}>
            <h2>You have View access only.</h2>
            <div className={styles.folderList}>
              {folders.map((folder, index) => (
                <div className={styles.folderItem} key={index}>
                  <span>{folder.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {selectedFolder && (
          <div className={styles.formContainer}>
            <div className={styles.formList}>
              {selectedFolder.forms.map((form, index) => (
                <div
                  key={index}
                  className={styles.formItem}
                  style={{ backgroundColor: form.color }}
                  onClick={() => handleFormClick(form)}
                >
                  {form.name}
                  <FontAwesomeIcon
                    icon={faTrash}
                    className={styles.deleteIcon}
                    onClick={() => {
                      setSelectedFolder((prevFolder) => {
                        const updatedFolder = { ...prevFolder };
                        updatedFolder.forms = updatedFolder.forms.filter((f) => f !== form);
                        return updatedFolder;
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Folder and form popups */}
        {showCreatePopup && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h3>Create New Folder</h3>
              <input
                type="text"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className={styles.popupInput}
              />
              <div className={styles.popupActions}>
                <button onClick={handleCreateFolder} className={styles.popupButton}>
                  Done
                </button>
                <button onClick={toggleCreatePopup} className={styles.popupButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
  
        {showDeletePopup && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h3>Are you sure you want to delete this folder?</h3>
              <div className={styles.popupActions}>
                <button onClick={handleDeleteFolder} className={styles.popupButton}>
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeletePopup(false)} className={styles.popupButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
  
        {showFormPopup && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h3>Create New Form in {selectedFolder.name}</h3>
              <input
                type="text"
                placeholder="Enter form name"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                className={styles.popupInput}
              />
              <div className={styles.popupActions}>
                <button onClick={handleCreateForm} className={styles.popupButton}>
                  Done
                </button>
                <button onClick={toggleFormPopup} className={styles.popupButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        
        )}
         <div>
      {/* <h1>Access Type: {accessType ? accessType : 'Access Type Not Provided'}</h1> */}
      {/* Your component UI */}
    </div>
    {showPopup && <SharePopup closePopup={() => setShowPopup(false)} />}
      </div>
    </div>
    
  );
}  

export default Profile;