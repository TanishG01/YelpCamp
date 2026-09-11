import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CampgroundEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', location: '', price: '', description: '' });
  const [images, setImages] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampground = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/campgrounds/${id}`);
        const campground = response.data;
        setFormData({
          title: campground.title,
          location: campground.location,
          price: campground.price,
          description: campground.description
        });
        setExistingImages(campground.images || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load campground data for editing.');
        setLoading(false);
      }
    };
    fetchCampground();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      setDeleteImages([...deleteImages, e.target.value]);
    } else {
      setDeleteImages(deleteImages.filter(img => img !== e.target.value));
    }
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

    if (deleteImages.length > 0) {
      for (let filename of deleteImages) {
        data.append('deleteImages[]', filename);
      }
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/campgrounds/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      navigate(`/campgrounds/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update campground');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent-color)' }}>Edit Campground</h1>
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input type="text" id="title" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="location">Location</label>
            <input type="text" id="location" name="location" className="form-control" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="price">Campground Price</label>
            <div style={{ display: 'flex' }}>
              <span style={{ padding: '0.75rem 1rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '8px 0 0 8px' }}>$</span>
              <input type="number" id="price" name="price" className="form-control" style={{ borderRadius: '0 8px 8px 0' }} value={formData.price} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-control" rows="4" value={formData.description} onChange={handleChange} required></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="image">Add More Images</label>
            <input type="file" id="image" name="image" className="form-control" multiple onChange={handleImageChange} />
          </div>

          {existingImages.length > 0 && (
            <div className="form-group">
              <label className="form-label">Delete Images</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {existingImages.map((img, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={img.url} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        id={`image-${i}`} 
                        name="deleteImages[]" 
                        value={img.filename} 
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor={`image-${i}`} style={{ fontSize: '0.85rem' }}>Delete</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(`/campgrounds/${id}`)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update Campground</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampgroundEdit;
