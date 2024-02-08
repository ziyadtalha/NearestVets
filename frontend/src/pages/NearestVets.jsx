import { useState, useEffect } from 'react';
import axios from 'axios';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

export default function NearestVets()
{
  const API_KEY = import.meta.env.VITE_REACT_API_KEY;
  const MAP_KEY = import.meta.env.VITE_REACT_MAP_ID;

  //location needs to be taken from user instead of hardcoded
  const location = { lat: 31.582, lng: 74.329 };

  //list of nearby vets; can be moved into redux if needed (unlikely)
  const [veterinary, setVeterinary] = useState([]);

  const [loading, setLoading] = useState(true);

  //keeps track of the marker that is currently selected
  const [selectedMarker, setSelectedMarker] = useState(null);

  //when a marker is clicked, select it, opening it's InfoWindow
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoBoxClose = () => {
    setSelectedMarker(null);
  };

  useEffect(() => {
    async function fetchData()
    {
      try {

        //We must send our request to the backend server
        //This is because it has CORS which is needed to process Google API requests
        const response = await axios.get(
          `http://localhost:3001/api/nearest_vets?lat=${location.lat}&lng=${location.lng}`
        );

        //A benefit of Axios is that it performs automatic transforms of JSON data
        //If we used simple fetch, then we would have to use response.JSON() first

        const data = response.data;

        console.log(data);

        setVeterinary(data);
        setLoading(false);
      }
      catch (error)
      {
        console.error('Error fetching nearby Vets:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);


  return (
    <div>
      { loading ? ( <p>Loading...</p>) : (
        <div>
          <h1>Nearest Vets:</h1>

          <APIProvider apiKey={API_KEY}>
            <div style={{height:"80vh"}}>
              <Map zoom={11} center={location} mapId={MAP_KEY}>
              {
                veterinary.map((vet) => {
                  return (
                      <AdvancedMarker key={vet.place_id} position={vet.geometry.location} onClick={() => handleMarkerClick(vet)}>
                        <Pin
                          background={"red"}
                          borderColor={"scarlet"}
                          glyphColor={"white"}
                        />

                        {/* Display the InfoBox whose marker is currently selected */}
                        {selectedMarker === vet && (
                          <InfoWindow position={vet.geometry.location} onCloseClick={() => handleInfoBoxClose(null)}>
                            <h4>{vet.name}</h4>
                            {vet.open_now ? <p>Open</p> : <p>Closed</p>}

                          </InfoWindow>
                        )}
                      </AdvancedMarker>
                  );
                })
              }

              </Map>
            </div>
          </APIProvider>
          </div>
        )}
    </div>
  );

}
