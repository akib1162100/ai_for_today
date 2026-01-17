import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Home, Book, Image, FileText, User, LogOut, Palette } from 'lucide-react';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Album from './components/Album';
import Blog from './components/Blog';
import Profile from './components/Profile';
import Login from './components/Login';
import ThemeEditor from './components/ThemeEditor';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="sidebar">
      <h2 style={{ paddingLeft: '1rem', marginBottom: '2rem' }}>Private Space</h2>
      <Link to="/" className={`nav-item ${isActive('/')}`}>
        <Home size={20} /> Dashboard
      </Link>
      <Link to="/journal" className={`nav-item ${isActive('/journal')}`}>
        <Book size={20} /> Journal
      </Link>
      <Link to="/album" className={`nav-item ${isActive('/album')}`}>
        <Image size={20} /> Album
      </Link>
      <Link to="/blog" className={`nav-item ${isActive('/blog')}`}>
        <FileText size={20} /> Blog
      </Link>
      <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
        <User size={20} /> Profile
      </Link>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent('openThemeEditor'))}
        className="nav-item"
        style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--sidebar-text)', marginTop: '1rem' }}
      >
        <Palette size={20} /> Customize Site
      </button>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const { token } = useAuth();
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  useEffect(() => {
    const handleOpen = () => setShowThemeEditor(true);
    window.addEventListener('openThemeEditor', handleOpen);
    return () => window.removeEventListener('openThemeEditor', handleOpen);
  }, []);

  if (!token) return <Login />;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      {showThemeEditor && <ThemeEditor onClose={() => setShowThemeEditor(false)} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/album" element={<Album />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
