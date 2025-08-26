import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Nav, Form, Row, Col } from "react-bootstrap";

const FormPage = () => {
  const { workspaceId, folderId, formId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const apiUrl =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL
      : process.env.REACT_APP_API_URL_DEV;

  const [activeTab, setActiveTab] = useState("flow"); // "flow" | "theme" | "response"

  const [formName, setFormName] = useState("");
  const [bubbles, setBubbles] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Options
  const bubbleOptions = [
    { type: "text", label: "Text" },
    { type: "image", label: "Image" },
    { type: "video", label: "Video" },
    { type: "gif", label: "GIF" },
  ];
  const inputOptions = [
    { type: "text", label: "Text" },
    { type: "number", label: "Number" },
    { type: "email", label: "Email" },
    { type: "phone", label: "Phone" },
    { type: "date", label: "Date" },
    { type: "rating", label: "Rating" },
    { type: "button", label: "Button" },
  ];

  // Fetch existing form (edit mode)
  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${apiUrl}/api/form/${workspaceId}/${folderId}/${formId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          const f = res.data.form;
          setFormName(f.formName || "");
          setBubbles(f.bubbles || []);
          setInputs(f.inputs || []);
        }
      } catch (error) {
        console.error("Error fetching form:", error?.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId, workspaceId, folderId, apiUrl, token]);

  // Adders
  const addBubble = (type) => setBubbles((prev) => [...prev, { type }]);
  const addInput = (type) => setInputs((prev) => [...prev, { type }]);

  // Save (create/update)
  const handleSaveForm = async () => {
    try {
      let res;
      if (formId) {
        res = await axios.put(
          `${apiUrl}/api/form/${workspaceId}/${folderId}/${formId}`,
          { formName, bubbles, inputs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `${apiUrl}/api/form/createForm/${workspaceId}/${folderId}`,
          { formName, bubbles, inputs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      if (res.data.success) {
        alert(formId ? "Form updated!" : "Form created!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error saving form:", error.response?.data || error.message);
    }
  };

  if (loading) return <div className="p-3 text-light">Loading form...</div>;

  return (
    <div className="d-flex flex-column bg-dark text-light" style={{ minHeight: "100vh" }}>
      {/* Top bar with centered tabs */}
      <div className="pt-3">
        <h6 className="text-center mb-2">Form Builder</h6>

        <div className="d-flex justify-content-center">
          <Nav
            variant="pills"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "flow")}
            className="mb-3"
          >
            <Nav.Item>
              <Nav.Link eventKey="flow" className="px-3 py-1">Flow</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="theme" className="px-3 py-1">Theme</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="response" className="px-3 py-1">Response</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
      </div>

      {/* Content */}
      <div className="d-flex flex-grow-1">
        {/* Left panel (compact) */}
        <div className="p-2 border-end border-secondary" style={{ width: 200 }}>
          <small className="text-secondary">Bubbles</small>
          <div className="mt-2">
            {bubbleOptions.map((opt) => (
              <Button
                key={opt.type}
                size="sm"
                variant="secondary"
                className="d-block w-100 mb-2"
                onClick={() => addBubble(opt.type)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <small className="text-secondary">Inputs</small>
          <div className="mt-2">
            {inputOptions.map((opt) => (
              <Button
                key={opt.type}
                size="sm"
                variant="outline-light"
                className="d-block w-100 mb-2"
                onClick={() => addInput(opt.type)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Right panel switches by tab */}
        <div className="flex-grow-1 p-3">
          {/* Header: form name (compact) */}
          <Row className="align-items-center g-2 mb-3">
            <Col xs="auto">
              <small className="text-secondary">Form name</small>
            </Col>
            <Col xs={12} sm={6} md={5} lg={4}>
              <Form.Control
                size="sm"
                type="text"
                value={formName}
                placeholder="Enter form name"
                onChange={(e) => setFormName(e.target.value)}
              />
            </Col>
            <Col className="text-end">
              <Button size="sm" onClick={handleSaveForm}>
                {formId ? "Update Form" : "Save Form"}
              </Button>
            </Col>
          </Row>

          {/* Tabs content */}
          {activeTab === "flow" && (
            <div className="flow-container">
              <div className="flow-item bg-secondary p-2 rounded mb-2">
                <small>Start</small>
              </div>

              {/* Bubbles */}
              {bubbles.map((b, idx) => (
                <div key={`b-${idx}`} className="flow-item bg-dark border rounded p-2 mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="small">
                      {b.label || `${b.type.toUpperCase()} ${idx + 1}`}
                    </strong>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() =>
                        setBubbles((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      remove
                    </Button>
                  </div>
                  <Form.Control
                    size="sm"
                    type="text"
                    className="mt-2"
                    placeholder="Enter content / link"
                    value={b.content || ""}
                    onChange={(e) => {
                      const copy = [...bubbles];
                      copy[idx].content = e.target.value;
                      setBubbles(copy);
                    }}
                  />
                </div>
              ))}

              {/* Inputs */}
              {inputs.map((inp, idx) => (
                <div key={`i-${idx}`} className="flow-item bg-dark border rounded p-2 mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="small">
                      {inp.label || `${inp.type.toUpperCase()} ${idx + 1}`}
                    </strong>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() =>
                        setInputs((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      remove
                    </Button>
                  </div>
                  <Form.Control
                    size="sm"
                    type="text"
                    className="mt-2"
                    placeholder={`Placeholder for ${inp.type}`}
                    value={inp.placeholder || ""}
                    onChange={(e) => {
                      const copy = [...inputs];
                      copy[idx].placeholder = e.target.value;
                      setInputs(copy);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "theme" && (
            <div>
              <small className="text-secondary d-block mb-2">Theme</small>
              {/* Minimal theme controls (compact). Extend as needed */}
              <Row className="g-2">
                <Col xs={12} sm={6} md={4}>
                  <Form.Label className="small mb-1">Primary color</Form.Label>
                  <Form.Control size="sm" type="color" defaultValue="#6c757d" />
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Label className="small mb-1">Background</Form.Label>
                  <Form.Select size="sm" defaultValue="dark">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </Form.Select>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Label className="small mb-1">Corner radius</Form.Label>
                  <Form.Select size="sm" defaultValue="md">
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </Form.Select>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === "response" && (
            <div>
              <small className="text-secondary d-block mb-2">Response</small>
              {/* Placeholder section for response behavior */}
              <Row className="g-2">
                <Col xs={12} sm={6} md={4}>
                  <Form.Label className="small mb-1">Success message</Form.Label>
                  <Form.Control size="sm" placeholder="Thanks! We got your submission." />
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Label className="small mb-1">Redirect URL</Form.Label>
                  <Form.Control size="sm" placeholder="https://example.com/thank-you" />
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Check
                    type="switch"
                    id="email-notify"
                    label={<span className="small">Send email notification</span>}
                    defaultChecked
                  />
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPage;
