import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useMemo } from "react";

export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const center = useMemo(() => ({ lat: 44, lng: -80 }), []);

  if (!isLoaded) return <div>Loading...</div>;
  return (
    <GoogleMap zoom={10} center={center} mapContainerClassName="map-container">
      <Marker position={center} />
    </GoogleMap>
  );
}
