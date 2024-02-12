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
    //importing key from .env file
    const apiKey = process.env.API_KEY;

    const { lat, lng, radius } = req.query;

    const response = await axios.get(
      //keyword=vet|pet clinic (| = OR operator) instead of type = veterinary_care due to improper tagging IRL
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=vet|pet clinic&key=${apiKey}`
    );

    const data = response.data.results;

    res.send(data);
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
