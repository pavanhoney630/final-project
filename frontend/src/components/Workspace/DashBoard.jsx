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
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderContent, setFolderContent] = useState(null);

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL
      : process.env.REACT_APP_API_URL_DEV;

  const token = localStorage.getItem("token");
  console.log("token",token)

  // Fetch workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/workspace/getAllWorkSpaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("res",res)
        console.log("token",token)

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

  // Fetch folders
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

  // Create folder
  const handleCreateFolder = async () => {
    try {
      await axios.post(
        `${apiUrl}/api/folder/create/${currentWorkspace._id}`,
        { folderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setFolderName("");
      fetchFolders(currentWorkspace._id); // refresh immediately
    } catch (error) {
      console.error("Error creating folder", error);
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId) => {
    if (!currentWorkspace) return;
    try {
      await axios.delete(
        `${apiUrl}/api/folder/${currentWorkspace._id}/${folderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFolders(currentWorkspace._id); // refresh immediately
    } catch (error) {
      console.error("Error deleting folder", error);
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
  <Dropdown.Item onClick={() => navigate("/settings")}>
    Settings
  </Dropdown.Item>
  <Dropdown.Item onClick={handleLogout} className="text-warning">
  Log Out
</Dropdown.Item>
</Dropdown.Menu>

        </Dropdown>
      </div>

      {/* Folders + Create Button + Typebot Image in Row */}
<div 
  className="d-flex flex-column gap-4" 
  style={{ minHeight: "70vh", justifyContent: "center" ,alignItems:"center" }}
>
  {/* Create Folder + Folders Row */}
  <div className="d-flex align-items-center gap-3 mb-4">
    <Button variant="secondary" onClick={() => setShowModal(true)}>
      <HiOutlineFolderAdd className="me-2" /> Create Folder
    </Button>

    {folders.map((folder) => (
      <Button
        key={folder._id}
        variant="outline-light"
        className="d-flex align-items-center gap-2"
        onClick={() => localStorage.setItem("folderId", folder._id)}
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

  {/* TypeBot Image BELOW Create Folder button (aligned left) */}
  <div className="card bg-dark border-0 text-center" style={{ width: "12rem" , marginRight:"120px", marginLeft:"-230px"}}>
    <img src={TypeBotImage} alt="TypeBot" className="card-img-top" />
    <div className="card-body">
      
    </div>
  </div>
</div>


      {/* Folder Content */}
      {folderContent && (
        <div className="mt-4">
          <h5>Folder Content</h5>
          <pre className="bg-secondary p-3 rounded">
            {JSON.stringify(folderContent, null, 2)}
          </pre>
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
