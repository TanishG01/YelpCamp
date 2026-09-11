import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CampgroundNew = () => {
  const [formData, setFormData] = useState({ title: '', location: '', price: '', description: '' });
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('campground[title]', formData.title);
    data.append('campground[location]', formData.location);
    data.append('campground[price]', formData.price);
    data.append('campground[description]', formData.description);
    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('image', images[i]);
      }
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/campgrounds`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      navigate(`/campgrounds/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campground');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent-color)' }}>New Campground</h1>
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input type="text" id="title" name="title" className="form-control" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="location">Location</label>
            <input type="text" id="location" name="location" className="form-control" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="price">Campground Price</label>
            <div style={{ display: 'flex' }}>
              <span style={{ padding: '0.75rem 1rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '8px 0 0 8px' }}>$</span>
              <input type="number" id="price" name="price" className="form-control" style={{ borderRadius: '0 8px 8px 0' }} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-control" rows="4" onChange={handleChange} required></textarea>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="image">Images</label>
            <input type="file" id="image" name="image" className="form-control" multiple onChange={handleImageChange} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Campground</button>
        </form>
      </div>
    </div>
  );
};

export default CampgroundNew;
