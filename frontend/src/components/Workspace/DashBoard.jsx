import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";
import { HiOutlineFolderAdd } from "react-icons/hi";
import { FaRegTrashAlt } from "react-icons/fa";
import TypeBotImage from "../Images/TypeBotImage.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [folders, setFolders] = useState([]);
  const [forms, setForms] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [formName, setFormName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL
      : process.env.REACT_APP_API_URL_DEV;

  const token = localStorage.getItem("token");

  // 🔹 Fetch workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/workspace/getAllWorkSpaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWorkspaces(res.data.workspaces || []);

        const savedWorkspaceId = localStorage.getItem("workspaceId");
        const savedWorkspace = res.data.workspaces.find(
          (ws) => ws._id === savedWorkspaceId
        );

        if (savedWorkspace) {
          setCurrentWorkspace(savedWorkspace);
        } else if (res.data.workspaces.length > 0) {
          setCurrentWorkspace(res.data.workspaces[0]);
          localStorage.setItem("workspaceId", res.data.workspaces[0]._id);
        }
      } catch (error) {
        console.error("Error fetching workspaces", error);
      }
    };
    fetchWorkspaces();
  }, [apiUrl, token]);

  const handleWorkspaceSelect = (ws) => {
    setCurrentWorkspace(ws);
    localStorage.setItem("workspaceId", ws._id);
  };

  // 🔹 Fetch folders
  const fetchFolders = async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const res = await axios.get(
        `${apiUrl}/api/folder/getAllFolders/${workspaceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFolders(res.data.folders || []);
    } catch (error) {
      console.error("Error fetching folders", error);
    }
  };

  useEffect(() => {
    if (currentWorkspace) fetchFolders(currentWorkspace._id);
  }, [currentWorkspace]);

  // 🔹 Fetch forms of a folder
  const fetchForms = async (workspaceId, folderId) => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/form/getforms/${workspaceId}/${folderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForms(res.data.forms || []);
    } catch (error) {
      console.error("Error fetching forms", error);
    }
  };

  // 🔹 Create folder
  const handleCreateFolder = async () => {
    try {
      await axios.post(
        `${apiUrl}/api/folder/create/${currentWorkspace._id}`,
        { folderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowFolderModal(false);
      setFolderName("");
      fetchFolders(currentWorkspace._id);
    } catch (error) {
      console.error("Error creating folder", error);
    }
  };

  // 🔹 Delete folder
  const handleDeleteFolder = async (folderId) => {
    if (!currentWorkspace) return;
    try {
      await axios.delete(
        `${apiUrl}/api/folder/${currentWorkspace._id}/${folderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFolders(currentWorkspace._id);
      setForms([]); // clear forms
    } catch (error) {
      console.error("Error deleting folder", error);
    }
  };

  
  // 🔹 Create form (redirect instead of API call)
// 🔹 Create form (API call then redirect)
const handleCreateForm = async () => {
  if (!formName || !selectedFolderId || !currentWorkspace) return;

  try {
    const res = await axios.post(
      `${apiUrl}/api/form/createForm/${currentWorkspace._id}/${selectedFolderId}`,
      { formName }, // only name at first
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      const newFormId = res.data.form._id; // ✅ use real MongoDB ID
      navigate(`/form/${currentWorkspace._id}/${selectedFolderId}/${newFormId}`);
      setShowFormModal(false);
      setFormName("");
    }
  } catch (error) {
    console.error("Error creating form:", error);
  }
};


  // 🔹 Delete form
  const handleDeleteForm = async (formId) => {
    try {
      await axios.delete(
        `${apiUrl}/api/form/deleteform/${formId}/${selectedFolderId}/${currentWorkspace._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchForms(currentWorkspace._id, selectedFolderId);
    } catch (error) {
      console.error("Error deleting form", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container-fluid bg-dark text-light min-vh-100 p-3">
      {/* Top Bar */}
      <div className="d-flex justify-content-center mb-4">
        <Dropdown>
          <Dropdown.Toggle variant="secondary">
            {currentWorkspace ? currentWorkspace.workspaceName : "Select Workspace"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {workspaces.map((ws) => (
              <Dropdown.Item key={ws._id} onClick={() => handleWorkspaceSelect(ws)}>
                {ws.workspaceName}
              </Dropdown.Item>
            ))}
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate("/settings")}>Settings</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout} className="text-warning">
              Log Out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Folders + Create Button */}
      <div className="d-flex align-items-center gap-3 mb-4 justify-content-center">
        <Button variant="secondary" onClick={() => setShowFolderModal(true)}>
          <HiOutlineFolderAdd className="me-2" /> Create Folder
        </Button>

        {folders.map((folder) => (
          <Button
            key={folder._id}
            variant="outline-light"
            className="d-flex align-items-center gap-2"
            onClick={() => {
              localStorage.setItem("folderId", folder._id);
              setSelectedFolderId(folder._id);
              setShowFormModal(true); // open modal to create form
              fetchForms(currentWorkspace._id, folder._id);
            }}
          >
            {folder.folderName}
            <FaRegTrashAlt
              className="text-danger"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder._id);
              }}
            />
          </Button>
        ))}
      </div>

      {/* TypeBot Image + Forms */}
      <div className="d-flex flex-wrap gap-4 justify-content-center">
        {/* TypeBot Image */}
        <div
          className="card bg-dark border-0 text-center position-relative"
          style={{ width: "12rem" }}
        >
          <img src={TypeBotImage} alt="TypeBot" className="card-img-top" />
        </div>

        {/* Forms */}
        {forms.map((form) => (
          <div
  key={form._id}
  className="card bg-dark text-light border-secondary position-relative"
  style={{ width: "12rem", cursor: "pointer" }}
 onClick={() =>
  navigate(`/form/${currentWorkspace._id}/${selectedFolderId}/${form._id}`)
}

>
  {/* Delete Icon */}
  <FaRegTrashAlt
    className="text-danger position-absolute"
    style={{ top: "8px", right: "8px", cursor: "pointer" }}
    onClick={(e) => {
      e.stopPropagation(); // prevent card click when deleting
      handleDeleteForm(form._id);
    }}
  />
  <div className="card-body text-center">
    <h6 className="card-title">{form.formName}</h6>
  </div>
</div>

        ))}
      </div>

      {/* Create Folder Modal */}
      <Modal show={showFolderModal} onHide={() => setShowFolderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateFolder}>
            Done
          </Button>
          <Button variant="secondary" onClick={() => setShowFolderModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Form Modal */}
      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter form name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateForm}>
            Done
          </Button>
          <Button variant="secondary" onClick={() => setShowFormModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
