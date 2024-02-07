import GoogleMapReact from 'google-map-react';

export default function Map({ restaurants }){
  const defaultCenter = {
    lat: 31.5204, lng: 74.3587
  };

  const apiKey = import.meta.env.VITE_REACT_API_KEY;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: apiKey }}
        defaultCenter={defaultCenter}
        defaultZoom={10}
      >
        {restaurants.map((restaurant, index) => (
          <Marker
            key={index}
            lat={restaurant.location.lat}
            lng={restaurant.location.lng}
            text={restaurant.name}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
};

const Marker = ({ text }) => (
  <div style={{ color: 'red', fontWeight: 'bold' }}>{text}</div>
);
