import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import Login from "./components/auth/LoginPage.jsx";
import Signup from "./components/auth/SignupPage.jsx";
 import DashBoard from "./components/Workspace/DashBoard.jsx";
import Settings from './components/auth/SettingsPage.jsx';
import LandingPage from '../src/components/Landing/LandingPage.js';
import FormPage from '../src/components/Workspace/FormPage.jsx';
// import FormResponse from '../src/components/auth/FormResponse.js';
// import FormResponseStats from '../src/components/auth/FormResponseStats.js';
// import FormPage from '../src/components/auth/FormPage.js'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/dashboard" element={<DashBoard/>}/>
          <Route path='/form/:workspaceId/:folderId/:formId' element={<FormPage/>}/>
         

        </Routes>
      </div>
    </Router>
  );
};

export default App;
