import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NearestVets()
{
  //list of nearby vets; can be moved into redux if needed (unlikely)
  const [veterinary, setVeterinary] = useState([]);

  //location needs to be taken from user instead of hardcoded
  const location = { lat: 31.582, lng: 74.329 };

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
      }
      catch (error)
      {
        console.error('Error fetching nearby Vets:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Nearest Vets:</h1>
        <ul>
          {
            veterinary.map((vet) => {
              return (
                <li key={vet.place_id}>
                  {vet.name}
                </li>
              );
            })
          }
        </ul>
    </div>
  );

}
