const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

//to process API requests; they are blocked without CORS
app.use(cors());

//for using .env file
const dotenv = require('dotenv');
dotenv.config();


app.get('/api/nearest_vets', async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;
    const { lat, lng, service, radius } = req.query;

    let searchTerm = '';

    if (service == 'All') {
      searchTerm = 'pet|vet|pet clinic|pet shop|pet store|pet shop|pet store';
    }
    else if (service == 'Veterinary') {
      searchTerm = 'vet|pet clinic';
    }
    else if (service == 'Pet Store') {
      searchTerm = 'pet shop|pet store';
    }
    else if (service == 'Pet Grooming') {
      searchTerm = 'pet shop|pet store';
    }

    console.log(lat, lng, radius, service);

    const baseEndpoint = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius,
      keyword: searchTerm,
      key: apiKey,
    });

    const response = await axios.get(`${baseEndpoint}?${params}`);
    const results = response.data.results;


    // Check for next_page_token
    let nextPageToken = response.data.next_page_token;

    for (let i = 0; i < 2 && nextPageToken; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Add a delay before the next request

      const pageParams = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: radius,
        keyword: searchTerm,
        key: apiKey,
        pagetoken: nextPageToken,
      });

      const pageResponse = await axios.get(`${baseEndpoint}?${pageParams}`);
      const pageResults = pageResponse.data.results;

      results.push(...pageResults);

      // Update nextPageToken for the next iteration
      nextPageToken = pageResponse.data.next_page_token;
    }


    //adding GoogleMaps link to each place object along with place photo as an object, since this does not come from the API
    const maplink = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='

    const updatedPlaces = results.map((place) => {
      const placeLink = maplink + place.place_id;

      //only add Photo if exists
      if (place.photos && place.photos.length > 0) {
        const photo = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`;
        return {...place, placeLink, photo};
      }

      return {...place, placeLink};
    })

    console.log(updatedPlaces.length);
    res.send(updatedPlaces);
  }
  catch (error)
  {
    console.error('Error fetching nearby vets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});
