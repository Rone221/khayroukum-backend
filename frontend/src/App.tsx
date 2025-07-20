
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';

// Prestataire Pages
import PrestataireDashboard from './pages/prestataire/PrestataireDashboard';
import PrestataireVillages from './pages/prestataire/PrestataireVillages';
import PrestataireProjects from './pages/prestataire/PrestataireProjects';
import PrestataireDocuments from './pages/prestataire/PrestataireDocuments';

// Donateur Pages
import DonateurDashboard from './pages/donateur/DonateurDashboard';
import DonateurProjects from './pages/donateur/DonateurProjects';
import DonateurContributions from './pages/donateur/DonateurContributions';
import ProjectDetail from './pages/donateur/ProjectDetail';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProjectDocuments from './pages/prestataire/ProjectDocuments';
import ProfilePage from './pages/ProfilePage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Index />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['administrateur']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/projects" element={
            <ProtectedRoute allowedRoles={['administrateur']}>
              <Layout>
                <AdminProjects />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Prestataire Routes */}
          <Route path="/prestataire/dashboard" element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <Layout>
                <PrestataireDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/prestataire/villages" element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <Layout>
                <PrestataireVillages />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/prestataire/projects" element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <Layout>
                <PrestataireProjects />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/prestataire/projects/:id/documents" element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <Layout>
                <ProjectDocuments />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/prestataire/documents" element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <Layout>
                <PrestataireDocuments />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Donateur Routes */}
          <Route path="/donateur/dashboard" element={
            <ProtectedRoute allowedRoles={['donateur']}>
              <Layout>
                <DonateurDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/donateur/projects" element={
            <ProtectedRoute allowedRoles={['donateur']}>
              <Layout>
                <DonateurProjects />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/donateur/projects/:id" element={
            <ProtectedRoute allowedRoles={['donateur']}>
              <Layout>
                <ProjectDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/donateur/contributions" element={
            <ProtectedRoute allowedRoles={['donateur']}>
              <Layout>
                <DonateurContributions />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout>
                <NotificationsPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
