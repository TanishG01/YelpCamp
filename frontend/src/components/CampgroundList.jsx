import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

const CampgroundList = () => {
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/campgrounds`);
        setCampgrounds(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch campgrounds');
        setLoading(false);
      }
    };
    fetchCampgrounds();
  }, []);

  useEffect(() => {
    const initializeMap = async () => {
      if (campgrounds.length > 0 && mapContainer.current) {
        if (map.current) return;
        
        try {
          const configRes = await axios.get(`${import.meta.env.VITE_API_URL}/config`, { withCredentials: true });
          maptilersdk.config.apiKey = configRes.data.mapTilerApiKey;
          
          map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: maptilersdk.MapStyle.OUTDOOR,
            center: [-103.59179687498357, 40.66995747013945],
            zoom: 3
          });

          const campgroundsGeoJson = {
            type: 'FeatureCollection',
            features: campgrounds.map(c => ({
              type: 'Feature',
              geometry: c.geometry,
              properties: {
                id: c._id,
                popUpMarkup: `<strong><a href="/campgrounds/${c._id}">${c.title}</a></strong><p>${c.location}</p>`
              }
            }))
          };

          map.current.on('load', function () {
            map.current.addSource('campgrounds', {
                type: 'geojson',
                data: campgroundsGeoJson,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50
            });

            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'campgrounds',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': ['step', ['get', 'point_count'], '#00BCD4', 10, '#2196F3', 30, '#3F51B5'],
                    'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25]
                }
            });

            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'campgrounds',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });

            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'campgrounds',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#11b4da',
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            map.current.on('click', 'clusters', async (e) => {
                const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                const clusterId = features[0].properties.cluster_id;
                const zoom = await map.current.getSource('campgrounds').getClusterExpansionZoom(clusterId);
                map.current.easeTo({ center: features[0].geometry.coordinates, zoom });
            });

            map.current.on('click', 'unclustered-point', function (e) {
                const { popUpMarkup } = e.features[0].properties;
                const coordinates = e.features[0].geometry.coordinates.slice();
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                new maptilersdk.Popup()
                    .setLngLat(coordinates)
                    .setHTML(popUpMarkup)
                    .addTo(map.current);
            });

            map.current.on('mouseenter', 'clusters', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'clusters', () => {
                map.current.getCanvas().style.cursor = '';
            });
            
            map.current.on('mouseenter', 'unclustered-point', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'unclustered-point', () => {
                map.current.getCanvas().style.cursor = '';
            });
          });
        } catch (err) {
          console.error('Failed to load map configuration', err);
        }
      }
    };
    initializeMap();
  }, [campgrounds]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Campgrounds...</div>;
  if (error) return <div style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</div>;

  return (
    <div className="animate-fade-in">
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '400px', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} 
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--accent-color)' }}>All Campgrounds</h1>
        <Link to="/campgrounds/new" className="btn btn-primary">Add New</Link>
      </div>

      <div className="grid-container">
        {campgrounds.map(campground => (
          <div key={campground._id} className="card">
            <img 
              src={campground.images?.length > 0 ? campground.images[0].url : 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80'} 
              alt={campground.title} 
              className="card-img" 
            />
            <div className="card-body">
              <h3 className="card-title">{campground.title}</h3>
              <p className="card-text" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--primary-color)' }}>Location:</strong> {campground.location}
              </p>
              <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {campground.description}
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <Link to={`/campgrounds/${campground._id}`} className="btn btn-outline" style={{ width: '100%' }}>
                  View {campground.title}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampgroundList;
