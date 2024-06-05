import { NuviotClientService } from './nuviot-client.service';


export class OrgService {
  constructor(private clientService: NuviotClientService
  ) {

  }

  public async getCreateOrgForm(): Promise<Core.FormResult<Orgs.CreateOrgViewModel, Orgs.CreateOrgViewModelView>> {
    return await this.clientService.getFormResponse('/api/org/factory');
  }

  public async createOrganization(org: Orgs.CreateOrgViewModel): Promise<Core.InvokeResult> {
    return await this.clientService.post(`/api/org`, org);
  }

  public async getSubscriptions(): Promise<Core.ListResponse<Orgs.SubscriptionSummary>> {
    return await this.clientService.getListResponse<Orgs.SubscriptionSummary>('/api/subscriptions');
  }

  public async getSubscription(id: string): Promise<Core.FormResult<Orgs.Subscription, Orgs.SubscriptionView>> {
    return await this.clientService.getFormResponse<Orgs.Subscription, Orgs.SubscriptionView>(`/api/subscription/${id}`);
  }

  public async createSubscription(): Promise<Core.FormResult<Orgs.Subscription, Orgs.SubscriptionView>> {
    return await this.clientService.getFormResponse<Orgs.Subscription, Orgs.SubscriptionView>(`/api/subscription/factory`);
  }

  public async updateSubscription(distro: Orgs.Subscription): Promise<Core.InvokeResult> {
    return await this.clientService.update(`/api/subscription`, distro);
  }

  public async addSubscription(distro: Orgs.Subscription): Promise<Core.InvokeResult> {
    return await this.clientService.post(`/api/subscription`, distro);
  }

  public async deleteSubscription(id: string): Promise<Core.InvokeResult> {
    return await this.clientService.delete(`/api/subscription/${id}`);
  }

  public async saveSubscription(form: Core.FormResult<Orgs.Subscription, Orgs.SubscriptionView>): Promise<Core.InvokeResult> {
    if (form.isEditing)
      return await this.updateSubscription(form.model);
    else
      return await this.addSubscription(form.model);
  }

  public async getDistributionLists(): Promise<Core.ListResponse<Orgs.DistroListSummary>> {
    return await this.clientService.getListResponse<Orgs.DistroListSummary>('/api/distros');
  }

  public async getDistributionList(id: string): Promise<Core.FormResult<Orgs.DistroList, Orgs.DistroListView>> {
    return await this.clientService.getFormResponse<Orgs.DistroList, Orgs.DistroListView>(`/api/distro/${id}`);
  }

  public async createDistributionList(): Promise<Core.FormResult<Orgs.DistroList, Orgs.DistroListView>> {
    return await this.clientService.getFormResponse<Orgs.DistroList, Orgs.DistroListView>(`/api/distro/factory`);
  }

  public async updateDistributionList(distro: Orgs.DistroList): Promise<Core.InvokeResult> {
    return await this.clientService.update(`/api/distro`, distro);
  }

  public async addDistributionList(distro: Orgs.DistroList): Promise<Core.InvokeResult> {
    return await this.clientService.post(`/api/distro`, distro);
  }

  public async deleteDistributionList(id: string): Promise<Core.InvokeResult> {
    return await this.clientService.delete(`/api/distro/${id}`);
  }

  public async saveDistributionList(form: Core.FormResult<Orgs.DistroList, Orgs.DistroListView>): Promise<Core.InvokeResult> {
    if (form.isEditing)
      return await this.updateDistributionList(form.model);
    else
      return await this.addDistributionList(form.model);
  }

  public async getHolidaySets(): Promise<Core.ListResponse<Orgs.HolidaySetSummary>> {
    return await this.clientService.getListResponse<Orgs.HolidaySetSummary>('/api/holidaysets');
  }

  public async getHolidaySet(id: string): Promise<Core.FormResult<Orgs.HolidaySet, Orgs.HolidaySetView>> {
    return await this.clientService.getFormResponse<Orgs.HolidaySet, Orgs.HolidaySetView>(`/api/holidayset/${id}`);
  }

  public async createHolidaySet(): Promise<Core.FormResult<Orgs.HolidaySet, Orgs.HolidaySetView>> {
    return await this.clientService.getFormResponse<Orgs.HolidaySet, Orgs.HolidaySetView>('/api/holidayset/factory');
  }

  public async updateHolidaySet(holidaySet: Orgs.HolidaySet): Promise<Core.InvokeResult> {
    return await this.clientService.update(`/api/holidayset`, holidaySet);
  }

  public async addHolidaySet(holidaySet: Orgs.HolidaySet): Promise<Core.InvokeResult> {
    return await this.clientService.post(`/api/holidayset`, holidaySet);
  }

  public async deleteHolidaySet(id: string): Promise<Core.InvokeResult> {
    return await this.clientService.delete(`/api/holidayset/${id}`);
  }

  public async saveHolidaySet(form: Core.FormResult<Orgs.HolidaySet, Orgs.HolidaySetView>): Promise<Core.InvokeResult> {
    if (form.isEditing)
      return await this.updateHolidaySet(form.model);
    else
      return await this.addHolidaySet(form.model);
  }

  public async getAllOrgs(): Promise<Core.ListResponse<Users.OrganizationSummary>> {
    return await this.clientService.getListResponse<Users.OrganizationSummary>('/sys/api/orgs/all');
  }

  public async deleteOrg(id: string): Promise<Core.InvokeResult> {
    return await this.clientService.delete(`/sys/api/org/${id}`);
  }

  public async getScheduledDowntimes(): Promise<Core.ListResponse<Orgs.ScheduledDowntimeSummary>> {
    return await this.clientService.getListResponse<Orgs.ScheduledDowntimeSummary>('/api/scheduleddowntimes');
  }

  public async getScheduledDowntime(id: string): Promise<Core.FormResult<Orgs.ScheduledDowntime, Orgs.ScheduledDowntimeView>> {
    return await this.clientService.getFormResponse<Orgs.ScheduledDowntime, Orgs.ScheduledDowntimeView>(`/api/scheduleddowntime/${id}`);
  }

  public async createScheduledDowntime(): Promise<Core.FormResult<Orgs.ScheduledDowntime, Orgs.ScheduledDowntimeView>> {
    return await this.clientService.getFormResponse<Orgs.ScheduledDowntime, Orgs.ScheduledDowntimeView>('/api/scheduleddowntime/factory');
  }

  public async updateScheduledDowntime(downtime: Orgs.ScheduledDowntime): Promise<Core.InvokeResult> {
    return await this.clientService.update(`/api/scheduleddowntime`, downtime);
  }

  public async addScheduledDowntime(downtime: Orgs.ScheduledDowntime): Promise<Core.InvokeResult> {
    return await this.clientService.post(`/api/scheduleddowntime`, downtime);
  }

  public async deleteScheduledDowntime(id: string): Promise<Core.InvokeResult> {
    return await this.clientService.delete(`/api/scheduleddowntime/${id}`);
  }

  public async saveScheduledDowntime(form: Core.FormResult<Orgs.ScheduledDowntime, Orgs.ScheduledDowntimeView>): Promise<Core.InvokeResult> {
    if (form.isEditing)
      return await this.updateScheduledDowntime(form.model);
    else
      return await this.addScheduledDowntime(form.model);
  }

  public getLocations(): Promise<Core.ListResponse<Orgs.OrgLocationSummary>> {
    return  this.clientService.getListResponse<Orgs.OrgLocationSummary>('/api/org/locations');
  }

  public createLocation(): Promise<Core.FormResult<Orgs.OrgLocation, Orgs.OrgLocationView>> {
    return  this.clientService.getFormResponse<Orgs.OrgLocation, Orgs.OrgLocationView>(`/api/org/location/factory`);
  }

  public getLocation(id: string): Promise<Core.FormResult<Orgs.OrgLocation, Orgs.OrgLocationView>> {
    return  this.clientService.getFormResponse<Orgs.OrgLocation, Orgs.OrgLocationView>(`/api/org/location/${id}`);
  }

  public addLocation(location: Orgs.OrgLocation): Promise<Core.InvokeResult> {
    return  this.clientService.post(`/api/org/location`, location);
  }

  public deleteLocation(id: string): Promise<Core.InvokeResult> {
    return  this.clientService.delete(`/api/org/location/${id}`);
  }

  public updateLocation(location: Orgs.OrgLocation): Promise<Core.InvokeResult> {
    return  this.clientService.update(`/api/org/location`, location);
  }

  public async saveLocation(form: Core.FormResult<Orgs.OrgLocation, Orgs.OrgLocationView>): Promise<Core.InvokeResult> {
    if (form.isEditing)
      return await this.updateLocation(form.model);
    else
      return await this.addLocation(form.model);
  }

  public getLocationDiagrams(): Promise<Core.ListResponse<Orgs.LocationDiagramSummary>> {
    return this.clientService.getListResponse<Orgs.LocationDiagramSummary>('/api/org/location/diagrams');
  }

  public getLocationDiagram(id: string) : Promise<Core.FormResult<Orgs.LocationDiagram, Orgs.LocationDiagramView>> {
    return this.clientService.getFormResponse<Orgs.LocationDiagram, Orgs.LocationDiagramView>(`/api/org/location/diagram/${id}`);
  }

  public createLocationDiagram() : Promise<Core.FormResult<Orgs.LocationDiagram, Orgs.LocationDiagramView>> {
    return this.clientService.getFormResponse<Orgs.LocationDiagram, Orgs.LocationDiagramView>(`/api/org/location/diagram/factory`);
  }

  public createLocationDiagramShape() : Promise<Core.FormResult<Orgs.LocationDiagramShape, Orgs.LocationDiagramShapeView>> {
    return this.clientService.getFormResponse<Orgs.LocationDiagramShape, Orgs.LocationDiagramShapeView>(`/api/org/location/diagram/shape/factory`);
  }

  public async editLocationDiagramShape(shape: Orgs.LocationDiagramShape) : Promise<Core.FormResult<Orgs.LocationDiagramShape, Orgs.LocationDiagramShapeView>> {
    let form = await this.clientService.getFormResponse<Orgs.LocationDiagramShape, Orgs.LocationDiagramShapeView>(`/api/org/location/diagram/shape/factory`, false);
    form.isEditing = true;
    form.model = shape;
    return form;
  }

  public async updateLocationDiagram(location: Orgs.LocationDiagram): Promise<Core.InvokeResult> {
    return await this.clientService.update(`/api/org/location/diagram`, location);
  }

  public async addLocationDiagram(location: Orgs.LocationDiagram): Promise<Core.InvokeResult> {
    return await this.clientService.post(`/api/org/location/diagram`, location);
  }

  public async saveLocationDiagram(form: Core.FormResult<Orgs.LocationDiagram, Orgs.LocationDiagramView>): Promise<Core.InvokeResult> {
    if(form.isEditing)
      return await this.updateLocationDiagram(form.model);
    else
      return await this.addLocationDiagram(form.model);
  }

  public async createLocationDiagramGroup() : Promise<Core.FormResult<Orgs.LocationDiagramShapeGroup, Orgs.LocationDiagramShapeGroupView>> {
    return this.clientService.getFormResponse<Orgs.LocationDiagramShapeGroup, Orgs.LocationDiagramShapeGroupView>(`/api/org/location/diagram/group/factory`);
  }

  public async createLocationDiagramLayer() : Promise<Core.FormResult<Orgs.LocationDiagramLayer, Orgs.LocationDiagramLayerView>> {
    return this.clientService.getFormResponse<Orgs.LocationDiagramLayer, Orgs.LocationDiagramLayerView>(`/api/org/location/diagram/layer/factory`);
  }

  public async editLocationDiagramGroup(shape: Orgs.LocationDiagramShapeGroup) : Promise<Core.FormResult<Orgs.LocationDiagramShapeGroup, Orgs.LocationDiagramShapeGroupView>> {
    let form = await this.clientService.getFormResponse<Orgs.LocationDiagramShapeGroup, Orgs.LocationDiagramShapeGroupView>(`/api/org/location/diagram/shape/factory`, false);
    form.isEditing = true;
    form.model = shape;
    return form;
  }

  public async editLocationDiagramLayer(shape: Orgs.LocationDiagramLayer) : Promise<Core.FormResult<Orgs.LocationDiagramLayer, Orgs.LocationDiagramLayerView>> {
    let form = await this.clientService.getFormResponse<Orgs.LocationDiagramLayer, Orgs.LocationDiagramLayerView>(`/api/org/location/diagram/shape/factory`, false);
    form.isEditing = true;
    form.model = shape;
    return form;
  }


}
