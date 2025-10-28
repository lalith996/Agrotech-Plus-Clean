import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useMemo } from "react";

export type MapRouteStop = { lat: number; lng: number; label?: string };
export type MapRoute = { vehicleId?: string; color?: string; stops: MapRouteStop[] };

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  routes?: MapRoute[];
  showTraffic?: boolean;
}

export default function Map({ center, zoom = 11, routes = [], showTraffic = true }: MapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const defaultCenter = useMemo(() => center || { lat: 44, lng: -80 }, [center]);

  const GoogleMapAny = GoogleMap as unknown as any;

  if (!isLoaded) return <div>Loading...</div>;
  return (
    <GoogleMapAny
      zoom={zoom}
      center={defaultCenter}
      mapContainerStyle={{ width: '100%', height: '600px' }}
      onLoad={(map: any) => {
        // Traffic overlay
        if (showTraffic && typeof window !== 'undefined' && (window as any).google?.maps) {
          const trafficLayer = new (window as any).google.maps.TrafficLayer();
          trafficLayer.setMap(map);
        }
        // Draw polylines for routes
        if (routes.length && typeof window !== 'undefined' && (window as any).google?.maps) {
          routes.forEach((route, idx) => {
            const path = route.stops.map(s => ({ lat: s.lat, lng: s.lng }));
            const color = route.color || ["#1a73e8", "#34a853", "#fbbc05", "#ea4335"][idx % 4];
            const polyline = new (window as any).google.maps.Polyline({
              path,
              strokeColor: color,
              strokeOpacity: 0.9,
              strokeWeight: 4,
            });
            polyline.setMap(map);
          });
        }
      }}
    >
      {routes.flatMap((route, idx) =>
        route.stops.map((s, i) => (
          <Marker key={`mk-${idx}-${i}`} position={{ lat: s.lat, lng: s.lng }} />
        ))
      )}
    </GoogleMapAny>
  );
}
