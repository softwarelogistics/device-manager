/// <reference path="./core/core.ts" />

namespace Routing {
  export class Marker {
    index: number;
    lat: number;
    lng: number;
    altitude: number;
    rate: number;
    dwell: number;
    iconUri: string;
    label?: string;
    draggable: boolean;
    takePhoto: boolean;
    startVideo: boolean;
    stopVideo: boolean;
    cameraAoA: number;
    heading: number;
  }

  export class RouteSegment {
    startLat: number;
    endLat: number;
    startLng: number;
    endLng: number;
  }

  export class GeoWaypoint {
    name: string;
    index: number;
    location: Core.GeoLocation;
    dwell?: number;
    altitude?: number;
    rate?: number;
    takePhoto: boolean;
    startVideo: boolean;
    stopVideo: boolean;
    heading?: number;
    cameraAoA?: number;
  }

  export class GeoWaypointView {
    dwell: UI.Field;
    altitude: UI.Field;
    rate: UI.Field;
  }

  export class GeoRouteView {
    id: UI.Field;
    name: UI.Field;
    key: UI.Field;
    description: UI.Field;
  }

  export class GeoRoute {
    id: string;
    name: string;
    key: string;
    mapCenter?: Core.GeoLocation;
    zoom: number;
    description: string;
    wayPoints: GeoWaypoint[];
  }

  export class GeoRouteSummary {
    id: string;
    name: string;
    key: string;
    mapCenter?: Core.GeoLocation;
    zoom: number;
  }
}
