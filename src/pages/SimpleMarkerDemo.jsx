import { useState } from "react";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

export default function SimpleMarkerDemo()
{
  const position = { lat: 31.5204, lng: 74.3587 };

  const API_KEY = import.meta.env.VITE_REACT_API_KEY;
  const MAP_KEY = import.meta.env.VITE_REACT_MAP_ID;

  const [open, setOpen] = useState(false);

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{height:"100vh"}}>
        <Map zoom={9} center={position} mapId={MAP_KEY}>
          <AdvancedMarker position={position} onClick={() => setOpen(true)}>
            <Pin
                background={"red"}
                borderColor={"scarlet"}
                glyphColor={"white"}
              />
          </AdvancedMarker>

          {open && (
            <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
              <p>Welcome To Lahore!</p>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
