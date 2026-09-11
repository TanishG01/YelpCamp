import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: isHome ? 'transparent' : 'var(--card-bg)',
      position: isHome ? 'absolute' : 'sticky',
      top: 0,
      width: '100%',
      zIndex: 100,
      borderBottom: isHome ? 'none' : '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>YelpCamp</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: isHome ? 'white' : 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
          <Link to="/campgrounds" style={{ color: isHome ? 'white' : 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>Campgrounds</Link>
          {currentUser && <Link to="/campgrounds/new" style={{ color: isHome ? 'white' : 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>New Campground</Link>}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!currentUser ? (
          <>
            <Link to="/login" style={{ color: isHome ? 'white' : 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
            <Link to="/register" style={{ color: isHome ? 'white' : 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: isHome ? 'white' : 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', padding: 0 }}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
