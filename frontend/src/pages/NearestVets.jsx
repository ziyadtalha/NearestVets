import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import axios from 'axios';

import NearMeIcon from '@mui/icons-material/NearMe';
import LocationCityIcon from '@mui/icons-material/LocationCity';

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
  Container,
  FormGroup,
  Checkbox,
  Rating
} from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const NearestVets = () => {

  const theme = useTheme();

  /*Media query used to make page responsive*/
  const isHugeScreen = useMediaQuery('(max-width:1850px)');
  const isLargeScreen = useMediaQuery('(max-width:1530px)');
  const isMediumScreen = useMediaQuery('(max-width:1245px)');
  const isSmallMediumScreen = useMediaQuery('(max-width:1055px)');
  const isSmallScreen = useMediaQuery('(max-width:950px)');
  const isSmallerScreen = useMediaQuery("(max-width:925px)");
  const isMoreSmallerScreen2 = useMediaQuery("(max-width:750px)");
  const isMoreSmallerScreen3 = useMediaQuery("(max-width:685px)");
  var muiVariant = (!isSmallScreen ? 'outlined' : 'standard');


  const notify = (errorMsg) => {
    toast.error(errorMsg, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };


  const API_KEY = import.meta.env.VITE_REACT_API_KEY;


  const [loading, setLoading] = useState(true);


  //User's location attributes:
  const [location, setLocation] = useState({ lat: 24.860, lng: 66.990, live: false, errorRange: 1000, radiusMs: 10000});

  const getLiveLocation = async () => {

    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

    if (permissionStatus.state === 'denied') {
      notify('Geolocation not accessible!');
      return;
    }

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

    }
    else
    {
      console.log('Geolocation is not available in your browser.');
      notify('Geolocation not accessible!');
    }
  };


  //This state is used on the button group to show the clicked option form:
  const [activeButton, setActive] = useState("MANUAL");


  //Input parameters for location:
  const [formData, setFormData] = useState({
    city: '', //this is used by manual location form
    radiusKMs: 1, //this is used by live location option
    service: 'All',
    open: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const services = ['All', 'Veterinary', 'Pet Store', 'Pet Grooming'];

  //Key value pairs of cities and their coordinates
  const cities = [
    { name: "Karachi", lat: 24.860, lng: 66.990 },
    { name: "Lahore", lat: 31.520, lng: 74.358 },
    { name: "Islamabad", lat: 33.6844, lng: 73.0479 },
    { name: "Rawalpindi", lat: 33.5651, lng: 73.0169 },
    { name: "Faisalabad", lat: 31.5497, lng: 73.0132 },
    { name: "Multan", lat: 30.1798, lng: 71.4246 },
    { name: "Peshawar", lat: 34.0151, lng: 71.5249 },
    { name: "Quetta", lat: 30.1798, lng: 66.9750 },
    { name: "Sialkot", lat: 32.4945, lng: 74.5222 },
    { name: "Gujranwala", lat: 32.1636, lng: 74.1884 },
    { name: "Sargodha", lat: 32.0836, lng: 72.6741 },
  ];

  const onFormSubmit = async (e) => {
    e.preventDefault();

    if (formData.city === "") {
      notify('City must be selected!');
      return false;
    }

    if (formData.service === "") {
      notify('Service must be selected!');
      return false;
    }

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

  function removeDuplicates(arr)
  {
    //removing duplicate places:
    const ids = arr.map(({ place_id }) => place_id);
    return arr.filter(({ place_id }, index) => !ids.includes(place_id, index + 1));
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/nearest_vets?lat=${location.lat}&lng=${location.lng}&service=${formData.service}&radius=${location.radiusMs}`
        );

        const data = response.data;

        if (data.length === 0) {
          notify('No nearby vets found within the specified radius. Try increasing the distance.');
          setLoading(false);
          return;
        }

        console.log(data.length);

        //adding GoogleMaps link to each Vet object along with place photo, since this does not come from the API
        const updatedPlaces = data.map((vet) => {
          const link = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=' + vet.place_id;

          console.log(vet.name);

          //only add Photo if exists
          if (vet.photos && vet.photos.length > 0) {
            const photo = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${vet.photos[0].photo_reference}&key=${API_KEY}`;
            return {...vet, link, photo};
          }

          return {...vet, link};
        })

        setVeterinary(updatedPlaces);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nearby Vets:', error);
        notify('Could not fetch Vets!');
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
  if (loadError) return <h1>Error loading maps</h1>;
  if (!isLoaded) return <h1>Loading maps</h1>;

  return (
    <div>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <Box sx={{
              backgroundSize: 'cover',
              position: 'relative', backgroundRepeat: 'no-repeat', backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),url( "src/assets/CatAtVet.jpeg")',
              backgroundAttachment: 'fixed'
            }}>
            <Grid container pt={10} pb={30} >
              <Grid item xs={12} sx={{textAlign: 'center'}}>
                <Typography variant='h1' sx={{fontSize:'3rem', color: 'white'}}>Find Professionals Near You</Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={4}></Grid>

              <Grid item xs={4} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <Paper elevation={12} sx={{ height: "auto", borderRadius: '20px', padding: 2, mb: 2, pt: 0,  maxWidth: 'auto', minWidth: '200px'}}>
                  <Container style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <ButtonGroup>
                    <Button
                      onClick={() => setActive("MANUAL")}
                      sx={{ backgroundColor: activeButton === 'MANUAL' ? 'primary.light' : 'primary.main', color: 'white', fontSize: isMoreSmallerScreen2 ? 10 : isSmallScreen ? 15 : isSmallerScreen ? 4 : 20, width: isMoreSmallerScreen3 ? 100 : isMoreSmallerScreen2 ? 110 : isSmallerScreen ? 120 : isSmallScreen ? 150 : isSmallMediumScreen ? 155 : isMediumScreen ? 170 : isLargeScreen ? 200 : 250, borderRadius: '9px',
                      '&:hover': {backgroundColor: 'primary.dark'} }}>
                        CITY
                      </Button>

                      <Button onClick={() => setActive("LIVE")}
                        sx={{ backgroundColor: activeButton === 'LIVE' ? 'primary.light' : 'primary.main', color: 'white', fontSize: isMoreSmallerScreen2 ? 10 : isSmallScreen ? 15 : isSmallerScreen ? 4 : 20, width: isMoreSmallerScreen3 ? 100 : isMoreSmallerScreen2 ? 110 : isSmallerScreen ? 120 : isSmallScreen ? 150 : isSmallMediumScreen ? 155 : isMediumScreen ? 170 : isLargeScreen ? 200 : 250, borderRadius: '9px',
                        '&:hover': {backgroundColor: 'primary.dark'} }}>
                        LIVE
                      </Button>
                    </ButtonGroup>
                  </Container>

                  <Container style={{ display: 'flex', flexDirection: (!isHugeScreen ? 'row' : 'column'), alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>
                    <Box sx={{minWidth: (!isSmallScreen ? '300px' : '150px'), maxWidth: (!isSmallScreen ? 'auto' : '700px')}}>
                      <FormControl
                        variant={muiVariant}
                        fullWidth={true}
                        margin='dense'
                      >
                        <InputLabel id='service-label'>Service:</InputLabel>
                        <Select
                          id='service'
                          name='service'
                          onChange={handleInputChange}
                          value={formData.service}
                          options={services}
                        >
                          {
                            services.map((service) => {
                              return (
                                <MenuItem key={service} value={service}>{service}</MenuItem>
                              )
                            })
                          }
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <FormGroup>
                        <FormControlLabel control={
                          <Checkbox
                            checked={formData.open}
                            onChange={handleCheckboxChange}
                            name='open'
                          />
                        }
                          label="Currently Open"
                        />
                      </FormGroup>
                    </Box>
                  </Container>

                  <Container style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5}}>
                      {activeButton === 'MANUAL' ? (
                        <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: (!isHugeScreen ? 'row' : 'column'), alignItems: 'center', justifyContent: 'space-between'}}>
                          <Box sx={{minWidth: (!isSmallScreen ? '300px' : '150px'), maxWidth: (!isSmallScreen ? 'auto' : '700px')}}>
                            <FormControl
                              variant={muiVariant}
                              fullWidth={true}
                              margin='dense'
                            >
                              <InputLabel id='city-label'>City:</InputLabel>
                              <Select
                                id='city'
                                name='city'
                                onChange={handleInputChange}
                                value={formData.city}
                                options={cities}
                              >
                                {
                                  cities.map((city) => {
                                    return (
                                      <MenuItem key={city.name} value={city.name}>{city.name}</MenuItem>
                                    )
                                  })
                                }
                              </Select>
                            </FormControl>
                          </Box>

                          {!isHugeScreen ? <>&nbsp; &nbsp;</> : null}

                          <Button variant='contained' color='primary' style={{maxWidth: (isSmallScreen ? '150px' : '200px'), minWidth: (isLargeScreen ? '200px' : '150px'), marginTop: 5}} type='submit'
                              startIcon={<LocationCityIcon style={{fontSize: '2rem', color: 'white' }} />} >
                              <Typography variant='h1' sx={{fontSize:'1.5rem', color:'white'}}>Submit</Typography>
                            </Button>
                        </form>
                      ) : (

                        <Container style={{ display: 'flex', flexDirection: (!isHugeScreen ? 'row' : 'column'), alignItems: 'center', justifyContent: 'space-between', margin: 'auto'}}>

                          <Box sx={{ minWidth: isSmallScreen ? 200 : 250}}>
                            <FormControl sx={{display: 'flex', flexDirection: 'row' }}>
                              <FormControlLabel
                                value='Slider'
                                sx={{ flexGrow: 1 }}
                                control={
                                  <Slider
                                    valueLabelDisplay='auto'
                                    sx={{ mx: 2 }}
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 12 }}>
                              <Typography variant="body2">
                                0 km
                              </Typography>
                              <Typography variant="body2">
                                10 km
                              </Typography>
                            </Box>
                          </Box>

                          {!isHugeScreen ? <>&nbsp; &nbsp;</> : null}

                          <Button variant='contained' color='primary' style={{maxWidth: (isSmallScreen ? '150px' : '200px'), minWidth: (isLargeScreen ? '200px' : '150px')}}
                            startIcon={<NearMeIcon style={{fontSize: '2rem', color: 'white' }} />}
                            onClick={getLiveLocation}
                          >
                            <Typography variant='h1' sx={{fontSize:'1.5rem', color:'white'}}>SUBMIT</Typography>
                          </Button>
                        </Container>
                      )}

                  </Container>

                </Paper>
              </Grid>

              <Grid itemxs={4}></Grid>
            </Grid>
          </Box>

          <Grid container pt={2} >
            <Grid item xs={(!isLargeScreen ? 2 : 1)}></Grid>
            <Grid item xs={(!isLargeScreen ? 8 : 10)} sx={{textAlign: 'center'}}>
              <GoogleMap
                zoom={12}
                center={location}
                mapContainerStyle={{ height: '80vh', maxHeight: !isMoreSmallerScreen2 ? '600px' : '300px' }} // Adjust maxHeight to your preference
              >

                {veterinary.map((vet) => (
                  //don't render marker if the Open Only option is true and the Vet is closed
                  (formData.open == true && (vet.opening_hours ? !vet.opening_hours.open_now : null)) ? console.log('did not render') :
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
                          <div style={{maxWidth: '300px'}}>
                            <h2>{vet.name}</h2>

                            {vet.photo && (
                              <img src={vet.photo} alt={`Vet ${selectedMarker.index + 1}`} style={{ maxWidth: '300px', height: '100px' }} />
                            )}

                            <p>
                              <Rating name='vetRating' value={vet.rating} readOnly precision={0.1} />
                              <Box>{vet.user_ratings_total} Reviews</Box>
                            </p>

                            <p>{vet.vicinity}</p>
                            <p>{vet.contact}</p>

                            {vet.opening_hours ? (vet.opening_hours.open_now ? <p style={{color: 'green'}}><b>OPEN</b></p> : <p style={{color: 'red'}}><b>CLOSED</b></p>) : null}

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

          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default NearestVets;
