import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddTask from './components/AddTask';
import ViewTasks from './components/ViewTasks';
import ManageTasks from './components/ManageTasks';
import EditTask from './components/EditTask';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta de login */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks/add" 
            element={
              <ProtectedRoute>
                <AddTask />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <ViewTasks />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks/manage" 
            element={
              <ProtectedRoute>
                <ManageTasks />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks/edit/:id" 
            element={
              <ProtectedRoute>
                <EditTask />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta por defecto */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
          
          {/* Ruta 404 */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;