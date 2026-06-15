// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
/*import Landing from './components/Landing';
import Landing2 from './components/Landing2';
import Landing3 from './components/Landing3';*/
import LandingCombined from './components/LandingCombined';
import Login from './components/Login';
import CreateProfile from './components/CreateProfile';
import StudentDashboard from './components/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Callback from './components/Callback';
import EditProfile from './components/EditProfile';
import ProfessorLogin from './components/professor-login';
import ProfessorCallback from './components/ProfessorCallback';
import TeacherDashboard from './components/TeacherDashboard';
import CreateProfessorProfile from './components/createProfessorProfile';
import MyAssignments from "./components/MyAssignments";   // ✅ fixed import

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingCombined />} />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/professor-login" element={<ProfessorLogin />} />
        <Route path="/ProfessorCallback" element={<ProfessorCallback/>} />
        <Route path="/createProfessorProfile" element={<CreateProfessorProfile />} />
        <Route
          path="/createProfile"
          element={
            <ProtectedRoute>
              <CreateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TeacherDashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-assignments"                 // ✅ route path
          element={
            <ProtectedRoute>
              <MyAssignments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

