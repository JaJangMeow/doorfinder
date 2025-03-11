
declare global {
  namespace google.maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      setCenter(latLng: LatLng): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(latLng: LatLng | null): void;
      setMap(map: Map | null): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
    }

    interface MapOptions {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
    }

    interface MarkerOptions {
      position: { lat: number; lng: number };
      map: Map;
      title?: string;
      animation?: Animation;
    }

    enum Animation {
      DROP = 1,
      BOUNCE = 2
    }
  }
}

export {};
