import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/auth/Login.js";
import Signup from "./components/auth/Signup.js";
import Profile from "./components/auth/Profile.js";
import ForgotPassword from './components/auth/ForgotPassword';
import LandingPage from '../src/components/LandingPage.js';
import Form from '../src/components/auth/Form.js';
import FormResponse from '../src/components/auth/FormResponse.js';
import FormResponseStats from '../src/components/auth/FormResponseStats.js';
import FormPage from '../src/components/auth/FormPage.js'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<ForgotPassword />} />
          <Route path="/Form" element={<Form />} />
          {/* <Route path="/form/:formId" element={<FormDetail />} /> */}
          <Route path="/form/:formId" element={<FormPage />} />
          <Route path="/response" element={<FormResponseStats />} />
          <Route path="/auth/form/:formId/responses" element={<FormResponse />} />
      
          
         



        </Routes>
      </div>
    </Router>
  );
};

export default App;
