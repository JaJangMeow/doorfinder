
declare global {
  namespace google.maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      setCenter(latLng: LatLng | { lat: number; lng: number }): void;
      setStyle(style: string): void;
      fitBounds(bounds: LatLngBounds): void;
      getCenter(): LatLng | null;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(latLng: LatLng | { lat: number; lng: number } | null): void;
      setMap(map: Map | null): void;
      getPosition(): LatLng | null;
      getElement(): HTMLElement;
      addListener(event: string, callback: Function): MapsEventListener;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(options: { anchor: Marker; map: Map }): void;
    }

    interface InfoWindowOptions {
      content: string;
      position?: LatLng | { lat: number; lng: number };
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(latLng: LatLng | { lat: number; lng: number }): void;
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MapOptions {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
      mapTypeId?: string;
      styles?: Array<{
        featureType: string;
        elementType: string;
        stylers: Array<{ visibility: string }>;
      }>;
    }

    interface MarkerOptions {
      position: { lat: number; lng: number };
      map: Map;
      title?: string;
      animation?: Animation;
      icon?: {
        path?: any;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeWeight?: number;
        strokeColor?: string;
        url?: string;
        scaledSize?: Size;
      };
    }

    enum Animation {
      DROP = 1,
      BOUNCE = 2
    }

    namespace places {
      class PlacesService {
        constructor(map: Map);
        nearbySearch(
          request: {
            location: LatLng | { lat: number; lng: number };
            radius: number;
            type: string;
          },
          callback: (
            results: Array<{
              geometry?: { location: LatLng };
              name?: string;
              icon?: string;
            }> | null,
            status: PlacesServiceStatus,
            pagination?: any
          ) => void
        ): void;
      }

      enum PlacesServiceStatus {
        OK = "OK",
        ZERO_RESULTS = "ZERO_RESULTS",
        INVALID_REQUEST = "INVALID_REQUEST",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        UNKNOWN_ERROR = "UNKNOWN_ERROR"
      }
    }

    namespace SymbolPath {
      const CIRCLE: number;
      const BACKWARD_CLOSED_ARROW: number;
      const FORWARD_CLOSED_ARROW: number;
    }

    namespace MapTypeId {
      const ROADMAP: string;
      const SATELLITE: string;
      const HYBRID: string;
      const TERRAIN: string;
    }
  }
}

export {};
