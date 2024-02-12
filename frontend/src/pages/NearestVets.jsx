import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import axios from 'axios';

const NearestVets = () => {
  const API_KEY = import.meta.env.VITE_REACT_API_KEY;

  const [loading, setLoading] = useState(true);

  //List of nearest vets:
  const [veterinary, setVeterinary] = useState([]);

  //User's location attributes:
  const [location, setLocation] = useState({ lat: 24.860, lng: 66.990, live: false, errorRange: 1000});

  //Opening and Closing of InfoBoxes on Markers:
  const [selectedMarker, setSelectedMarker] = useState(null);
  const handleMarkerClick = (vet) => {
    setSelectedMarker(vet);
  };
  const handleInfoBoxClose = () => {
    setSelectedMarker(null);
  };

  const getLiveLocation = async () => {
    if ('geolocation' in navigator) {
      await navigator.geolocation.getCurrentPosition(function (position) {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          live: true,
          errorRange: position.coords.accuracy,
        });
      });

    } else {
      console.log("Geolocation is not available in your browser.");
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/nearest_vets?lat=${location.lat}&lng=${location.lng}`
        );

        const data = response.data;

        //adding GoogleMaps link to each Vet object along with place photo, since this does not come from the API
        const updatedData = data.map((vet) => {
          const link = "https://www.google.com/maps/search/?api=1&query=Google&query_place_id=" + vet.place_id;

          //only add Photo if exists
          if (vet.photos && vet.photos.length > 0) {
            const photo = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${vet.photos[0].photo_reference}&key=${API_KEY}`;
            return {...vet, link, photo};
          }

          return {...vet, link};
        })

        setVeterinary(updatedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nearby Vets:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);


  //Loading script from Google
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
  });

  //Page only rendered if Map is actually loaded:
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;


  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1>Nearest Vets:</h1>

          <button onClick={getLiveLocation}>Use Live Location</button>

          <GoogleMap
            zoom={12}
            center={location}
            mapContainerStyle={{ height: "80vh" }}
          >
            {veterinary.map((vet) => (
              <Marker
                key={vet.place_id}
                position={vet.geometry.location}
                onClick={() => handleMarkerClick(vet)}
              >
                {selectedMarker === vet && (
                  <InfoWindow
                    position={vet.geometry.location}
                    onCloseClick={handleInfoBoxClose}
                  >
                    <div>
                      <h3>{vet.name}</h3>

                      {vet.photo && (
                        <img src={vet.photo} alt={`Vet ${selectedMarker.index + 1}`} style={{ maxWidth: '50%' }} />
                      )}

                      <p>{vet.vicinity}</p>
                      <p>{vet.contact}</p>

                      {vet.open_now ? <p>Open</p> : <p>Closed</p>}

                      <a href={vet.link}>View on GoogleMaps</a>
                    </div>

                  </InfoWindow>
                )}
              </Marker>
            ))}

            {/* Display user location blue circle marker and translucent error range circle around it */}
            {location.live && (
              <>
              <Marker
                position={location}
                icon={{
                  path: 'M-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0',
                  fillColor: 'blue',
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 2,
                  scale: 1,
                }}
              />

              <Circle
                center={location}
                radius={location.errorRange}
                options={{
                  strokeColor: 'blue',
                  strokeOpacity: 0.3,
                  strokeWeight: 2,
                  fillColor: 'blue',
                  fillOpacity: 0.1,
                }}
              />

            </>
            )}

          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default NearestVets;
