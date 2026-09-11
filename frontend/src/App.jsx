import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CampgroundList from './components/CampgroundList';
import CampgroundShow from './components/CampgroundShow';
import CampgroundNew from './components/CampgroundNew';
import CampgroundEdit from './components/CampgroundEdit';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campgrounds" element={<CampgroundList />} />
          <Route path="/campgrounds/new" element={
            <ProtectedRoute>
              <CampgroundNew />
            </ProtectedRoute>
          } />
          <Route path="/campgrounds/:id" element={<CampgroundShow />} />
          <Route path="/campgrounds/:id/edit" element={
            <ProtectedRoute>
              <CampgroundEdit />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer className="footer">
        &copy; 2026 YelpCamp
      </footer>
    </div>
  );
}

export default App;
