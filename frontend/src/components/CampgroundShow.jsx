import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { useAuth } from '../context/AuthContext';

const CampgroundShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [campground, setCampground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewRating, setReviewRating] = useState('1');

  useEffect(() => {
    const fetchCampground = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/campgrounds/${id}`);
        setCampground(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load campground details.');
        setLoading(false);
      }
    };
    fetchCampground();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/campgrounds/${id}`, { withCredentials: true });
      navigate('/campgrounds');
    } catch (err) {
      alert('Failed to delete campground');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/campgrounds/${id}/reviews`, {
        review: { body: reviewBody, rating: reviewRating }
      }, { withCredentials: true });
      setCampground(res.data);
      setReviewBody('');
      setReviewRating('1');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/campgrounds/${id}/reviews/${reviewId}`, { withCredentials: true });
      setCampground(res.data);
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (campground && campground.geometry && mapContainer.current) {
        if (map.current) return;
        
        try {
          const configRes = await axios.get(`${import.meta.env.VITE_API_URL}/config`, { withCredentials: true });
          maptilersdk.config.apiKey = configRes.data.mapTilerApiKey;
          
          map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: maptilersdk.MapStyle.OUTDOOR,
            center: campground.geometry.coordinates,
            zoom: 10
          });

          new maptilersdk.Marker()
            .setLngLat(campground.geometry.coordinates)
            .setPopup(
              new maptilersdk.Popup({ offset: 25 })
                .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
            )
            .addTo(map.current);
        } catch (err) {
          console.error('Failed to load map configuration', err);
        }
      }
    };
    initializeMap();
  }, [campground]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  if (error) return <div style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</div>;
  if (!campground) return null;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Left Column: Campground Details */}
      <div>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          {campground.images?.length > 0 && (
            <img 
              src={campground.images[0].url} 
              alt={campground.title} 
              style={{ width: '100%', height: '400px', objectFit: 'cover' }} 
            />
          )}
          <div className="card-body">
            <h1 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>{campground.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: '500' }}>
              {campground.location} &bull; Submitted by {campground.author?.username || 'Unknown'}
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              {campground.description}
            </p>
            <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                ${campground.price}/night
              </span>
            </div>

            {currentUser && campground.author && currentUser._id === campground.author._id && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Link to={`/campgrounds/${id}/edit`} className="btn btn-outline" style={{ flex: 1 }}>Edit</Link>
                <button onClick={handleDelete} className="btn btn-danger" style={{ flex: 1 }}>Delete</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <Link to="/campgrounds" className="btn btn-outline" style={{ width: '100%' }}>Back to All Campgrounds</Link>
        </div>
      </div>

      {/* Right Column: Map & Reviews */}
      <div>
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>

        {currentUser && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Leave a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="rating">Rating</label>
                  <input 
                    type="range" 
                    id="rating" 
                    name="rating" 
                    min="1" max="5" 
                    className="form-control" 
                    style={{ padding: '0' }}
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                  />
                  <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--success-color)' }}>{reviewRating} / 5</div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="body">Review</label>
                  <textarea 
                    id="body" 
                    name="body" 
                    rows="3" 
                    className="form-control" 
                    required 
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Submit Review</button>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem' }}>Reviews</h3>
            {campground.reviews?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No reviews yet. {currentUser ? 'Be the first to leave one!' : 'Log in to leave a review!'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {campground.reviews?.map(review => (
                  <div key={review._id} style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <h5 style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {review.author?.username || 'Unknown'}
                    </h5>
                    <p style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Rating: {review.rating}/5</p>
                    <p>{review.body}</p>
                    {currentUser && review.author && currentUser._id === review.author._id && (
                      <button 
                        onClick={() => handleDeleteReview(review._id)} 
                        className="btn btn-danger" 
                        style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CampgroundShow;
