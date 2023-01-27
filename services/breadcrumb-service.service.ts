
import { ReplaySubject } from 'rxjs';


export class BreadcrumbServiceService {
  private _breadCrumbs: UI.BreadCrumb[] = []

  protected _breadCrumbsUpdated$ = new ReplaySubject<UI.BreadCrumb[]>();

  constructor() {

  }

  push(title: string, route: string[], icon: string = undefined){
    let breadCrumb: UI.BreadCrumb = {
      title: title,
      icon: icon,
      route: route
    }

    this._breadCrumbs.push(breadCrumb);
    this._breadCrumbsUpdated$.next(this._breadCrumbs);
  }

  pop() {
    this._breadCrumbsUpdated$.next(this._breadCrumbs);
  }

  reset() {
    while(this._breadCrumbs.length > 0)
      this._breadCrumbs.pop();

    this._breadCrumbsUpdated$.next(this._breadCrumbs);
  }

  get  breadcrumbs() : UI.BreadCrumb[]  {
    return this._breadCrumbs;
  }
}
