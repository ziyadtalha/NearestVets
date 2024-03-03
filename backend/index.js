app.get('/api/nearest_vets', async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;
    const { lat, lng, service, radius } = req.query;

    let searchTerm = '';

    if (service == 'All') {
      searchTerm = 'pet|vet|pet clinic|pet shop|pet store|pet shop|pet store';
    } else if (service == 'Veterinary') {
      searchTerm = 'vet|pet clinic';
    } else if (service == 'Pet Store') {
      searchTerm = 'pet shop|pet store';
    } else if (service == 'Pet Grooming') {
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

    // Filter out duplicates based on place_id
    const uniqueResults = Array.from(new Set(results.map(place => place.place_id)))
      .map(placeId => results.find(place => place.place_id === placeId));

    // Check for next_page_token
    let nextPageToken = response.data.next_page_token;

    // If there is a next_page_token, make a second request
    if (nextPageToken) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Add a delay before the next request

      const secondParams = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: radius,
        keyword: searchTerm,
        key: apiKey,
        pagetoken: nextPageToken,
      });

      const secondResponse = await axios.get(`${baseEndpoint}?${secondParams}`);
      const secondResults = secondResponse.data.results;

      // Filter out duplicates based on place_id
      const uniqueSecondResults = Array.from(new Set(secondResults.map(place => place.place_id)))
        .map(placeId => secondResults.find(place => place.place_id === placeId));

      uniqueResults.push(...uniqueSecondResults);
    }

    console.log(uniqueResults.length);
    res.send(uniqueResults);
  } catch (error) {
    console.error('Error fetching nearby vets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
