import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen/LoginScreen'
import Dashboard from './components/Dashboard/Dashboard';
import Events from './components/Events/Events'; // Importe o componente Events
import DeviceRegistration from './components/DeviceRegistration/DeviceRegistration'; // Importe o componente Events

import './App.css';

function App() {
  return (
    <Router>
      <div className="d-lg-flex half" style={{ overflow: 'hidden' }}>
        <div className="contents order-2 order-md-1" style={{ width: '100%' }}>
          <div className="container">
            <div
              className="row align-items-center justify-content-center h-auto mb-4"
              style={{ overflowY: 'auto', height: '100vh' }}
            >
              <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/events" element={<Events />} /> {/* Nova Rota */}
                <Route path="/forms" element={<DeviceRegistration />} /> {/* Nova Rota */}
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
