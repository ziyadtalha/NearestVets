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
  ButtonGroup,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Container
} from '@mui/material';

const NearestVets = () => {

  const theme = useTheme();

  /*Media query used to make page responsive*/
  const isLargeScreen = useMediaQuery('(max-width:1555px)');
  const isMediumScreen = useMediaQuery('(max-width:1245px)');
  const isSmallMediumScreen = useMediaQuery('(max-width:1055px)');
  const isSmallScreen = useMediaQuery('(max-width:950px)');
  const isSmallerScreen = useMediaQuery("(max-width:925px)");
  const isMoreSmallerScreen2 = useMediaQuery("(max-width:750px)");
  const isMoreSmallerScreen3 = useMediaQuery("(max-width:685px)");
  var muiVariant = (!isSmallScreen ? 'outlined' : 'standard');



  const API_KEY = import.meta.env.VITE_REACT_API_KEY;

  const [loading, setLoading] = useState(true);



  //User's location attributes:
  const [location, setLocation] = useState({ lat: 24.860, lng: 66.990, live: false, errorRange: 1000, radiusMs: 10000});

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


  //This state is used on the button group to show the clicked option form:
  const [activeButton, setActive] = useState("MANUAL");


  //Input parameters for location:
  const [formData, setFormData] = useState({
    city: '', //this is used by manual location form
    radiusKMs: 1, //this is used by live location option
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

          //for the manual option, this is hardcoded
          radiusMs: 20000
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

        console.log(data);

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

    console.log('rendered');

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
              <Typography variant='h1' sx={{fontSize:'3rem'}}><b>NEAREST VETS</b></Typography>
            </Grid>
          </Grid>

          <p></p>

          <Grid container spacing={2}>
            <Grid item xs={4}></Grid>

            <Grid item xs={4} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Paper elevation={12} sx={{ height: "auto", borderRadius: '20px', padding: 2, mb: 2, pt: 0, minWidth: '200px', maxWidth: '500px'}}>
                <Container style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 2}}>
                  <ButtonGroup>
                    <Button
                    onClick={() => setActive("MANUAL")}
                    sx={{ backgroundColor: activeButton === 'MANUAL' ? 'primary.light' : 'primary.main', color: 'white', fontSize: isMoreSmallerScreen2 ? 10 : isSmallScreen ? 15 : isSmallerScreen ? 4 : 20, width: isMoreSmallerScreen3 ? 100 : isMoreSmallerScreen2 ? 110 : isSmallerScreen ? 120 : isSmallScreen ? 150 : isSmallMediumScreen ? 155 : isMediumScreen ? 170 : 200, borderRadius: '9px',
                    '&:hover': {backgroundColor: 'primary.dark' } }}>
                      MANUAL
                    </Button>

                    <Button onClick={() => setActive("LIVE")}
                      sx={{ backgroundColor: activeButton === 'LIVE' ? 'primary.light' : 'primary.main', color: 'white',  fontSize: isMoreSmallerScreen2 ? 10 : isSmallScreen ? 15 : isSmallerScreen ? 4 : 20, width: isMoreSmallerScreen3 ? 100 : isMoreSmallerScreen2 ? 110 : isSmallerScreen ? 120 : isSmallScreen ? 150 : isSmallMediumScreen ? 155 : isMediumScreen ? 170 : 200, borderRadius: '9px',
                      '&:hover': {backgroundColor: 'primary.dark' } }}>
                      LIVE
                    </Button>
                  </ButtonGroup>
                </Container>

                <p></p>

                <Container>
                    {activeButton === 'MANUAL' ? (
                      <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: (!isLargeScreen ? 'row' : 'column'), alignItems: 'center', justifyContent: 'center',  margin: 'auto' }}>
                        <Box sx={{minWidth: (!isSmallScreen ? '300px' : '150px'), maxWidth: (!isSmallScreen ? 'auto' : '700px')}}>
                          <FormControl
                            variant={muiVariant}
                            fullWidth={true}
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
                        </Box>

                        &nbsp;
                        &nbsp;

                        <Button variant='contained' color='primary' style={{maxWidth: (isSmallScreen ? '150px' : '300px'), minWidth: (isLargeScreen ? 'auto' : '150px')}} type='submit'>
                          <Typography variant='h1' sx={{fontSize:'1.5rem', color:'white'}}>Search</Typography>
                        </Button>
                      </form>
                    ) : (

                      <Container style={{ display: 'flex', flexDirection: (!isLargeScreen ? 'row' : 'column'), alignItems: 'center', justifyContent: 'center',  margin: 'auto' }}>
                        <Box sx={{minWidth: isSmallScreen ? 200 : 300}}>
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

                        &nbsp;
                        &nbsp;

                        <Button variant='contained' color='primary' style={{maxWidth: (isSmallScreen ? '150px' : '300px'), minWidth: (isLargeScreen ? 'auto' : '150px')}}
                          startIcon={<NearMeIcon style={{fontSize: '2rem', color: 'white' }} />}
                          onClick={getLiveLocation}
                        >
                          <Typography variant='h1' sx={{fontSize:'1.5rem', color:'white'}}>Live</Typography>
                        </Button>
                      </Container>
                    )}
                </Container>
              </Paper>
            </Grid>

            <Grid itemxs={4}></Grid>
          </Grid>

          <Grid container pt={2} >
            <Grid item xs={(!isLargeScreen ? 2 : 1)}></Grid>
            <Grid item xs={(!isLargeScreen ? 8 : 10)} sx={{textAlign: 'center'}}>
              <GoogleMap
                zoom={12}
                center={location}
                mapContainerStyle={{ height: '80vh', maxHeight: '600px' }} // Adjust maxHeight to your preference
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
                            <img src={vet.photo} alt={`Vet ${selectedMarker.index + 1}`} style={{ maxWidth: '250px', maxHeight: '150px' }} />
                          )}

                          <p>{vet.vicinity}</p>
                          <p>{vet.contact}</p>

                          {vet.open_now ? <p style={{color: 'green'}}><b>Open</b></p> : <p style={{color: 'red'}}><b>Closed</b></p>}

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
            </Grid>
            <Grid item xs={(!isLargeScreen ? 2 : 1)}></Grid>
          </Grid>

        </div>
      )}
    </div>
  );
};

export default NearestVets;
