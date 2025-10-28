declare module '@react-google-maps/api' {
  import * as React from 'react'
  
  export interface GoogleMapProps {
    zoom: number
    center: { lat: number; lng: number }
    mapContainerClassName?: string
    onLoad?: (map: google.maps.Map) => void
    onUnmount?: (map: google.maps.Map) => void
    children?: React.ReactNode
  }
  
  export const GoogleMap: React.FC<GoogleMapProps>
  
  export interface UseLoadScriptOptions {
    googleMapsApiKey: string
    libraries?: string[]
    language?: string
    region?: string
  }
  
  export function useLoadScript(options: UseLoadScriptOptions): { isLoaded: boolean }
  
  export interface MarkerProps {
    position: { lat: number; lng: number }
    onClick?: () => void
  }
  
  export const Marker: React.FC<MarkerProps>
}