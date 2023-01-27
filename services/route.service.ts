
import { NuviotClientService } from './nuviot-client.service';
import { ReplaySubject, Observable } from 'rxjs';


export class RouteService {

  constructor(private client: NuviotClientService) {
    this.routes = [];
  }

  private currentRoute$ = new ReplaySubject<Routing.GeoRoute>();
  currentRoute: Routing.GeoRoute;

  private routes$ = new ReplaySubject<Routing.GeoRouteSummary[]>();
  routes: Routing.GeoRouteSummary[];

  insertRoute(route: Routing.GeoRoute): Promise<Core.InvokeResult> {
    return this.client.insert(`/api/geo/route`, route);
  }

  getNewRoute(): Promise<Routing.GeoRoute> {
    const promise = new Promise<Routing.GeoRoute>((resolve, reject) => {
      this.client.getFormResponse<Routing.GeoRoute, Routing.GeoRouteView>('/api/geo/route/factory')
      .then(res => resolve(res.model))
      .catch(err => reject(err));

    });

    return promise;
  }

  getNewWaypoint():  Promise<Routing.GeoWaypoint> {
    const promise = new Promise<Routing.GeoWaypoint>((resolve, reject) => {
      this.client.getFormResponse<Routing.GeoWaypoint, Routing.GeoWaypointView>('/api/geo/route/waypoint/factory')
      .then(res => resolve(res.model))
      .catch(err => reject(err));
    });

    return promise;
  }

  updateRoute(route: Routing.GeoRoute): Promise<Core.InvokeResult> {
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.client.update(`/api/geo/route`, route)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });

    return promise;
  }

  roundGeolocation(location: number) {
    return (Math.round(location * 1000000)) / 1000000.0;
  }

  getRoute(id: string): Promise<Routing.GeoRoute> {
    const promise = new Promise<Routing.GeoRoute>((resolve, reject) => {
      this.client.getFormResponse<Routing.GeoRoute, Routing.GeoRouteView>(`/api/geo/route/${id}`)
      .then(res => resolve(res.model))
      .catch(err => reject(err));
    });

    return promise;
  }

  deleteRoute(id: string): Promise<Core.InvokeResult> {
      return this.client.delete(`/api/geo/route/${id}`);
  }

  getRoutes(): Promise<Core.ListResponse<Routing.GeoRouteSummary>> {
    const promise = new Promise<Core.ListResponse<Routing.GeoRouteSummary>>((resolve, reject) => {
      this.client.getListResponse<Routing.GeoRouteSummary>('/api/geo/routes')
      .then(res => {
        this.routes = res.model;
        this.routes$.next(res.model);
        resolve(res);
      })
      .catch(err => reject(err));
    });

    return promise;
  }

  onCurrentRoute(): Observable<Routing.GeoRoute> {
    return this.currentRoute$.asObservable();
  }

  onRoutes(): Observable<Routing.GeoRouteSummary[]> {
    return this.routes$.asObservable();
  }
}
