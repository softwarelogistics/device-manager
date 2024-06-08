import { NuviotClientService } from './nuviot-client.service';

export class DeploymentService {
  constructor(private nuviotClient: NuviotClientService) {
  }

  public GetHosts(): Promise<Core.ListResponse<Deployment.DeploymentHostSummary>> {
    return this.nuviotClient.getListResponse<Deployment.DeploymentHostSummary>('/api/deployment/hosts');
  }

  public CreateHost(): Promise<Core.FormResult<Deployment.DeploymentHost, Deployment.DeploymentHostView>> {
    return this.nuviotClient.getFormResponse('/api/deployment/host/factory');
  }

  public GetHost(id: string): Promise<Core.FormResult<Deployment.DeploymentHost, Deployment.DeploymentHostView>> {
    return this.nuviotClient.getFormResponse(`/api/deployment/host/${id}`);
  }

  public GetHostWithKeys(id: string): Promise<Core.FormResult<Deployment.DeploymentHost, Deployment.DeploymentHostView>> {
    return this.nuviotClient.getFormResponse(`/api/deployment/host/${id}/secure`);
  }

  public AddHost(host: Deployment.DeploymentHost): Promise<Core.InvokeResult> {
    return this.nuviotClient.post(`/api/deployment/host`, host);
  }

  public RegenHostKey(hostId: string, key: string): Promise<Core.InvokeResultEx<string>> {
    return this.nuviotClient.request(`/api/deployment/host/${hostId}/generate/${key}`)
  }

  public UpdateHost(host: Deployment.DeploymentHost): Promise<Core.InvokeResult> {
    return this.nuviotClient.update(`/api/deployment/host`, host);
  }

  public DeleteHost(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/deployment/host/${id}`);
  }

  public GetSubscriptions(): Promise<Core.ListResponse<Orgs.Subscription>> {
    return this.nuviotClient.getListResponse('/api/subscriptions');
  }

  public GetInstances(): Promise<Core.ListResponse<Deployment.DeploymentInstanceSummary>> {
    return this.nuviotClient.getListResponse<Deployment.DeploymentInstanceSummary>('/api/deployment/instances');
  }

  public GetInstance(id: string) : Promise<Core.FormResult<Deployment.DeploymentInstance,Deployment.DeploymentInstanceSummary>> {
    return this.nuviotClient.getFormResponse<Deployment.DeploymentInstance,Deployment.DeploymentInstanceSummary>(`/api/deployment/instance/${id}`);
  }

  public GetWebSocketUrl(channel: string, id: string): Promise<Core.InvokeResultEx<string>> {
    return this.nuviotClient.request(`/api/wsuri/${channel}/${id}/normal`);
  }

  public GetUsageMetrics(channel: string, id: string): Promise<Core.ListResponse<Deployment.UsageMetrics>> {
    return this.nuviotClient.getListResponse(`/api/usagemetrics/${channel}/${id}`);
  }

  public ValidateSolution(id: string): Promise<Core.InvokeResult> {
     return this.nuviotClient.request(`/api/deployment/solution/${id}/validate`);
  }

  public SendAction(type: string, id: string, action: string) {
    return this.nuviotClient.request(`/api/deployment/${type}/${id}/${action}`)
  }

  public DeployInstance(id: string) {
    return this.nuviotClient.request(`/api/deployment/instance/${id}/deploy`)
  }

  public RemoveSharedInstance(id: string, instanceid: string) : Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/deployment/host/${id}/remove/${instanceid}`)
  }

  public LoadStatusHistory(recordType: string, recordId: string, pagination: Core.ListFilter) : Promise<Core.ListResponse<Deployment.Telemetry>> {
    return this.nuviotClient.getListResponse(`/api/deployment/${recordType}/${recordId}/statushistory`, pagination)
  }

  public LoadTelemetry(recordType: string, viewType: string, id: string, pagination?: Core.ListFilter) : Promise<Core.ListResponse<Deployment.Telemetry>> {
    return this.nuviotClient.getListResponse(`/api/telemetry/${recordType}/${viewType}/${id}`, pagination)
  }

  public LoadWiFiConnectionProfiles(repositoryId: string) : Promise<Deployment.WiFiConnectionProfile[]> {
    return this.nuviotClient.request(`/api/device/repo/${repositoryId}/wifiprofiles`);
  }

  public LoadDefaultListenerForRepo(repositoryId: string): Promise<Core.InvokeResultEx<PipelineModules.ListenerConfiguration>> {
    return this.nuviotClient.request(`/api/device/repo/${repositoryId}/defaultlistener`);    
  }
}
