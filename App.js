import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import WarrantiesPage from './pages/WarrantiesPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="app">
      {user && <Header user={user} logout={logout} />}
      <div className="main-container">
        {user && <Sidebar user={user} />}
        <main className="content">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/clients" element={
              <ProtectedRoute user={user}>
                <ClientsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute user={user}>
                <ProductsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/warranties" element={
              <ProtectedRoute user={user}>
                <WarrantiesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute user={user} requiredRole="admin">
                <ReportsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute user={user}>
                <ProfilePage user={user} setUser={setUser} />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
