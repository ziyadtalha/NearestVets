import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import axios from 'axios';

import NearMeIcon from '@mui/icons-material/NearMe';

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box,
  FormControlLabel,
  Button,
  Grid,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

const NearestVets = () => {

  const theme = useTheme();

  /*Media query used to make page responsive*/
  const isSmallScreen = useMediaQuery('(max-width:915px)');
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xs2'));
  var muiVariant = (isLargeScreen ? 'outlined' : 'standard');



  const API_KEY = import.meta.env.VITE_REACT_API_KEY;

  const [loading, setLoading] = useState(true);


  //User's location attributes:
  const [location, setLocation] = useState({ lat: 24.860, lng: 66.990, live: false, errorRange: 1000, radiusMs: 10});

  const getLiveLocation = async () => {
    if ('geolocation' in navigator) {
      await navigator.geolocation.getCurrentPosition(function (position) {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          live: true,
          errorRange: position.coords.accuracy,
          radiusMs: (formData.radiusKMs * 1000)
        });
      });

    } else {
      console.log('Geolocation is not available in your browser.');
    }
  };


  //Manual Location by City form:
  const [formData, setFormData] = useState({
    city: '',
    radiusKMs: 1,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //Key value pairs of cities and their coordinated
  const cities = [{name: "Karachi", lat: 24.860, lng: 66.990}, {name: "Lahore", lat: 31.520, lng: 74.358}];

  const onFormSubmit = async (e) => {
    e.preventDefault();

    cities.forEach((city) => {
      if (city.name == formData.city) {
        //as soon as the Location state is updated, useEffect will be triggered, thus updating list of vets
        setLocation({
          lat: city.lat,
          lng: city.lng,

          //resetting these to defaults:
          live: false,
          errorRange: 1000,

          //converting radius from kilometres to metres:
          radiusMs: (formData.radiusKMs * 1000)
        });
      }
    })
  };



  //Opening and Closing of InfoBoxes on Markers:
  const [selectedMarker, setSelectedMarker] = useState(null);
  const handleMarkerClick = (vet) => {
    setSelectedMarker(vet);
  };
  const handleInfoBoxClose = () => {
    setSelectedMarker(null);
  };



  //List of nearest vets:
  const [veterinary, setVeterinary] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/nearest_vets?lat=${location.lat}&lng=${location.lng}&radius=${location.radiusMs}`
        );

        const data = response.data;

        //adding GoogleMaps link to each Vet object along with place photo, since this does not come from the API
        const updatedData = data.map((vet) => {
          const link = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=' + vet.place_id;

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
          <Grid container pt={5} >
            <Grid item xs={12} sx={{textAlign: 'center'}}>
              <Typography variant='h1' sx={{fontSize:'3rem'}}>NEAREST VETS</Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} >
            <Grid item xs={8} >
                <form  onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <FormControl
                      variant={muiVariant}
                      fullWidth={isSmallScreen}
                      margin='dense'
                    >
                      <InputLabel id='city-label'>City:</InputLabel>
                      <Select
                        labelId='city-label'
                        id='city'
                        name='city'
                        label='Cities:'
                        onChange={handleInputChange}
                        value={formData.city}
                      >
                        <MenuItem value={'Karachi'}>Karachi</MenuItem>
                        <MenuItem value={'Lahore'}>Lahore</MenuItem>
                      </Select>
                    </FormControl>

                    <Box sx={{width: 300}}>
                    <FormControl sx={{display: 'flex', flexDirection: 'row' }}>
                      <FormControlLabel
                        value='Slider'
                        sx={{ flexGrow: 1 }}
                        control={
                          <Slider
                            valueLabelDisplay='auto'
                            sx={{ mx: 3 }}
                            value={formData.radiusKMs}
                            onChange={handleInputChange}
                            max={10}
                            min={1}
                            name='radiusKMs'
                          />
                        }
                        label='Distance:'
                        labelPlacement='start'
                      />
                    </FormControl>
                    </Box>

                    <Button variant='contained' color='primary' style={{width:'200px'}} type='submit'>
                      <Typography variant='h1' sx={{fontSize:'1.5rem', color:'white'}}>Search</Typography>
                    </Button>
                </form>
            </Grid>
            <Grid item xs={4}>
              <Button variant='contained' color='primary' style={{width:'200px'}}
                  startIcon={<NearMeIcon style={{fontSize: '2rem', color: 'white' }} />}
                  onClick={getLiveLocation}
                >
                  <Typography variant='h1' sx={{fontSize:'1.5rem', color:'white'}}>Live</Typography>
                </Button>
            </Grid>
          </Grid>

          <GoogleMap
            zoom={12}
            center={location}
            mapContainerStyle={{ height: '80vh' }}
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
