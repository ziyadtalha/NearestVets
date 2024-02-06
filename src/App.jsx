import { useState } from "react";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

export default function App()
{
  const position = { lat: 31.5204, lng: 74.3587 };

  const API_KEY = import.meta.env.VITE_REACT_API_KEY;
  const MAP_KEY = import.meta.env.VITE_REACT_MAP_ID;

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{height:"100vh"}}>
        <Map zoom={9} center={position} mapId={MAP_KEY}>
          <AdvancedMarker position={position}>
            <Pin background={"red"} />
          </AdvancedMarker>
        </Map>
      </div>
    </APIProvider>
  );
}
