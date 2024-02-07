import { useState, useEffect } from 'react';
import Map from './Map';

const apiKey = import.meta.env.VITE_REACT_API_KEY;

export default function NearbyRestaurants() {
  const [restaurants, setRestaurants] = useState([]);

  const fetchNearbyRestaurants = () => {
    const latitude = 37.7749;
    const longitude = 31.5204;

    const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&types=restaurant&key=${apiKey}`;

    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        const nearbyRestaurants = data.results.map(result => ({
          name: result.name,
          address: result.vicinity,
          location: result.geometry.location,
        }));

        setRestaurants(nearbyRestaurants);
      })
      .catch(error => {
        console.error('Error fetching nearby restaurants:', error);
      });
  };

  useEffect(() => {
    fetchNearbyRestaurants();
  }, []);

  return (
    <div>
      <h1>Nearby Restaurants</h1>
      <ul>
        {restaurants.map((restaurant, index) => (
          <li key={index}>
            <strong>{restaurant.name}</strong> - {restaurant.address}
          </li>
        ))}
      </ul>
      <Map restaurants={restaurants} />
    </div>
  );
};

