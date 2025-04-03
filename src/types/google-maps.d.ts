
declare global {
  namespace google.maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      setCenter(latLng: LatLng): void;
      setStyle(style: string): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(latLng: LatLng | null): void;
      setMap(map: Map | null): void;
      getPosition(): LatLng | null;
      getElement(): HTMLElement;
    }

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Size {
      constructor(width: number, height: number);
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

    class Size {
      constructor(width: number, height: number);
    }

    namespace places {
      class PlacesService {
        constructor(map: Map);
        nearbySearch(
          request: {
            location: LatLng;
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
