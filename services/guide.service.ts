
import { NuviotClientService } from './nuviot-client.service';
import { ReplaySubject, Observable } from 'rxjs';


export class GuideService {
  private _currentGuide: Guide.Guide;
  private _currentGuideStep: Guide.GuideStep;
  private _guide$ = new ReplaySubject<Guide.Guide>();
  private _guideStep$ = new ReplaySubject<Guide.GuideStep>();
  private _guideSummaries$ = new ReplaySubject<Guide.GuideSummary[]>();

  constructor(private nuviotClient: NuviotClientService) {
  }

  quickCreateGuide(guideQuickCreate: Guide.GuideQuickCreate) : Promise<Core.InvokeResultEx<Core.EntityHeader>> {
    return this.nuviotClient.post<Guide.GuideQuickCreate, Core.EntityHeader>('/api/guide/quickcreate', guideQuickCreate);
  }

  rebuildGuideTree(id: string):Promise<Guide.Guide> {
    return this.nuviotClient.request<Guide.Guide>(`/api/guide/${id}/createtree`)
  }

  getGuideCategories() : Promise<Core.PickerOption[]> {
    return this.nuviotClient.request('/api/guides/categories')
  }

  loadGuides(): Promise<Core.ListResponse<Guide.GuideSummary>> {
    return this.nuviotClient.request('/api/guides/all');
  }

  addChildGuide(node: Guide.GuideNode) : Promise<Core.InvokeResult>{
    return this.nuviotClient.post('/api/guide/child', node);
  }

  loadGuidesByCategory(category: string, topLevel: boolean): Promise<Core.ListResponse<Guide.GuideSummary>> {
    return this.nuviotClient.request(`/api/guides/${category}?toplevel=${topLevel}`);
  }

  loadGuide(guideId: string): Promise<Guide.Guide> {
    return this.nuviotClient.request(`/api/guide/${guideId}`);
  }

  deleteGuide(guideId: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/guide/${guideId}`);
  }

  createNewGuide(): Promise<Guide.Guide> {
    return this.nuviotClient.request(`/api/guide/factory`);
  }

  createGuideStep(): Promise<Core.FormResult<Guide.GuideStep, Guide.GuideStepView>> {
    return this.nuviotClient.request(`/api/guidestep/factory`);
  }

  loadGuidStep(guideId: string, guideStepId: string): Promise<Guide.GuideStep> {
    return this.nuviotClient.request(`/api/guide/${guideId}/step/${guideStepId}`);
  }

  createExampleApplication(key: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.request<Core.InvokeResult>(`/api/examples/create/${key}`);
  }

  updateGuide(guide: Guide.Guide){
    return this.nuviotClient.update('/api/guide', guide);
  }

  insertGuide(guide: Guide.Guide){
    return this.nuviotClient.post('/api/guide', guide);
  }

  setGuide(guide: Guide.Guide) {
    this._currentGuide = guide;
    this._guide$.next(guide);
  }

  setGuideStep(guideStep: Guide.GuideStep) {
    this._currentGuideStep = guideStep;
    this._guideStep$.next(guideStep);
  }

  setGuides(guides: Guide.GuideSummary[]) {
    this._guideSummaries$.next(guides);
  }

  getCurrentGuide() {
    return this._currentGuide;
  }

  getCurrentGuideStep() {
    return this._currentGuideStep;
  }

  onGuide(): Observable<Guide.Guide> {
    return this._guide$.asObservable();
  }

  onGuideStep(): Observable<Guide.GuideStep> {
    return this._guideStep$.asObservable();
  }

  onGuides(): Observable<Guide.GuideSummary[]> {
    return this._guideSummaries$.asObservable();
  }
}
