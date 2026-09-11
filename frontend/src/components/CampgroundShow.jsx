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
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="card">
        {campground.images?.length > 0 && (
          <img 
            src={campground.images[0].url} 
            alt={campground.title} 
            style={{ width: '100%', height: '400px', objectFit: 'cover' }} 
          />
        )}
        <div className="card-body">
          <h1 style={{ color: 'var(--accent-color)' }}>{campground.title}</h1>
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
          
          <div style={{ marginTop: '2rem', height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {currentUser && campground.author && currentUser._id === campground.author._id && (
              <>
                <Link to={`/campgrounds/${id}/edit`} className="btn btn-outline" style={{ flex: 1 }}>Edit</Link>
                <button onClick={handleDelete} className="btn btn-danger" style={{ flex: 1 }}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3>Reviews</h3>
          {campground.reviews?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to leave one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {campground.reviews?.map(review => (
                <div key={review._id} style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Rating: {review.rating}/5</p>
                  <p>{review.body}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    By {review.author?.username || 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/campgrounds" className="btn btn-outline">Back to All Campgrounds</Link>
      </div>
      
    </div>
  );
};

export default CampgroundShow;
