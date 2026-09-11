import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container" style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      textShadow: '0 0.05rem 0.1rem rgba(0, 0, 0, 0.5)',
      position: 'absolute',
      top: 0,
      left: 0
    }}>
      <div style={{ textAlign: 'center', padding: '0 1rem', maxWidth: '800px', zIndex: 1, position: 'relative' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>YelpCamp</h1>
        <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: '300', marginBottom: '2rem' }}>
          Welcome to YelpCamp! <br/> Jump right in and explore our many campgrounds. <br/>
          Feel free to share some of your own and comment on others!
        </p>
        <Link to="/campgrounds" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '0.75rem 2rem', backgroundColor: 'white', color: '#212529', border: 'none', fontWeight: 'bold' }}>
          View Campgrounds
        </Link>
      </div>
    </div>
  );
};

export default Home;
