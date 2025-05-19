import { Observable } from 'rxjs';

import { ReplaySubject } from 'rxjs';
import { DeviceGroupService } from './device-group.service';
import { NuviotClientService } from './nuviot-client.service';
import { Device } from 'react-native-ble-plx';
import Base64 from '../utils/Base64';

export class DevicesService {
  constructor(private deviceGroupService: DeviceGroupService,
    private nuviotClient: NuviotClientService) { }


  private _deviceIdForLogs: string | undefined;
  private _deviceId: string | undefined;
  private _repoId: string | undefined;

  private _device: Devices.DeviceDetail | undefined;
  private _deviceGroup: Devices.DeviceGroup | undefined;

  private _devices: Devices.DeviceSummary[] | undefined = [];
  private _deviceRepo: Devices.DeviceRepository | undefined;
  private _deviceRepos: Devices.DeviceRepoSummary[] | undefined = [];

  private _deviceGroups: Devices.DeviceGroupSummary[] | undefined = [];
  private _deviceGroups$ = new ReplaySubject<Devices.DeviceGroupSummary[] | undefined>();

  protected _device$ = new ReplaySubject<Devices.DeviceDetail | undefined>();
  protected _deviceCleared$ = new ReplaySubject<Devices.DeviceDetail | undefined>();
  protected _deviceLoading$ = new ReplaySubject<string | undefined>();
  protected _devices$ = new ReplaySubject<Devices.DeviceSummary[] | undefined>();
  protected _devicesLoading$ = new ReplaySubject<boolean>();
  protected _deviceRepo$ = new ReplaySubject<Devices.DeviceRepository | undefined>();
  protected _deviceGroup$ = new ReplaySubject<Devices.DeviceGroup | undefined>();
  protected _deviceRepos$ = new ReplaySubject<Devices.DeviceRepoSummary[] | undefined>();

  protected _deviceLogs$ = new ReplaySubject<Devices.DeviceLog[]>();
  protected _deviceLogCleared$ = new ReplaySubject<Devices.DeviceLog[]>();
  protected _deviceLogLoading$ = new ReplaySubject<string | undefined>();

  private _deviceNotificationSubscription$ = new ReplaySubject<Core.Notification>();
  private _deviceGroupNotificationSubscription$ = new ReplaySubject<Core.Notification>();
  private _deviceRepoNotificationSubscription$ = new ReplaySubject<Core.Notification>();

  private _deviceNotificationWebSocket: WebSocket | undefined;
  private _deviceGroupWebSocket: WebSocket | undefined;
  private _deviceRepoWebSocket: WebSocket | undefined;


  private deviceSafeInit(device: Devices.DeviceDetail) {
    console.log()

    /* In some cases the data provided by the service may not be valid for use in the app, this method
     * can be used to initialize invalid properties */
    if (!device.primaryAccessKey) {
      let buff = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
      device.primaryAccessKey = Base64.btoa(buff);
    }

    if (!device.secondaryAccessKey) {
      let buff2 = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
      device.secondaryAccessKey = Base64.btoa(buff2);
    }

    if (!device.properties) {
      device.properties = [];
    }
  }

  async createDevice(deviceRepoId: string): Promise<Devices.DeviceDetail> {
    let response = await this.nuviotClient.getFormResponse<Devices.DeviceDetail, Devices.DeviceView>(`/api/device/${deviceRepoId}/factory`);
    if (response!.successful) {
      let device = response!.model;
      this.deviceSafeInit(device);
      return device;
    }
    else {
      throw 'could not create device.';
    }
  }

  
  getDeviceConfigurations(): Promise<Core.ListResponse<Devices.DeviceConfigSummary>> {
    return this.nuviotClient.request(`/api/deviceconfigs`);
  }

  getDeviceConfiguration(id: string): Promise<Core.FormResult<DeviceConfiguration.DeviceConfiguration, DeviceConfiguration.DeviceConfigurationView>> {
    return this.nuviotClient.request(`/api/deviceconfig/${id}`);
  }

  sendDeviceCommand(repoId: string, deviceId: string, cmdId: string, payload: Core.KeyValuePair<string, string>[]): Promise<Core.InvokeResult> {
    return this.nuviotClient.post(`/api/device/remoteconfig/${repoId}/${deviceId}/command/${cmdId}`, payload);
  }

  async getDeviceTypes(): Promise<Devices.DeviceTypeSummary[]> {    
    let resp =  await this.nuviotClient.getListResponse<Devices.DeviceTypeSummary>(`/api/devicetypes`);
    return resp.model!;
  }

  public async loadDeviceRepositories(): Promise<Core.ListResponse<Devices.DeviceRepoSummary>> {
    return await this.nuviotClient.getListResponse<Devices.DeviceRepoSummary>('/api/devicerepos')      
}

  async getDeviceTypesForInstance(instanceId: string): Promise<Devices.DeviceTypeSummary[]> {
      let resp = await this.nuviotClient.getListResponse<Devices.DeviceTypeSummary>(`/api/deployment/instance/${instanceId}/devicetypes`)
      return resp.model!;
  }  

  async getFirmwares(): Promise<Devices.FirmwareSummary[]> {
      let resp = await this.nuviotClient.request<Core.ListResponse<Devices.FirmwareSummary>>(`/api/firmwares`)
      return resp.model!;
  }

  async getFirmware(id: string): Promise<Devices.FirmwareDetail> {
      let resp = await this.nuviotClient.getFormResponse<Devices.FirmwareDetail, Devices.FirmwareView>(`/api/firmware/${id}`);
      return resp.model!;
  }

  getDevicesForCustomerLocation(repoid: string, customerId: string, customerLocationId: string): Promise<Core.ListResponse<Devices.DeviceSummary>> {
    return this.nuviotClient.getListResponse(`/api/devices/${repoid}/customer/${customerId}/location/${customerLocationId}`)
  }


  getDeviceProperties(deviceConfigId: string): Promise<Devices.PropertyMetaData[]> {
    return this.nuviotClient.request<Devices.PropertyMetaData[]>(`/api/deviceconfig/${deviceConfigId}/properties`);
  }

  getDeviceConnectionEvents(deviceRepoId: string, deviceId: string): Promise<Core.ListResponse<Devices.DeviceConnectionEvent>> {
    return this.nuviotClient.request<Core.ListResponse<Devices.DeviceConnectionEvent>>(`/api/device/${deviceRepoId}/${deviceId}/connectionlog`);
  }

  public LoadRepoGroupsAndDevices(id: string, forceRefresh = false) {
    if (id !== this._repoId ||
      !this._deviceRepo ||
      !this._devices ||
      !this._deviceGroups ||
      forceRefresh) {

      this.setDeviceRepo(undefined);
      this.setDevices(undefined);
      this.setDeviceDetail(undefined);
      this.setDeviceGroups(undefined);
      this.setDevicesLoading(true);

      this._repoId = id;

      this.nuviotClient.getFormResponse<Devices.DeviceRepository, Devices.DeviceRepoView>(`/api/devicerepo/${id}`)
        .then(deviceRepoResponse => this.setDeviceRepo(deviceRepoResponse.model));

      this.nuviotClient.getListResponse<Devices.DeviceSummary>(`/api/devices/${id}`)
        .then(devicesListResponse => {
          this.setDevices(devicesListResponse.model);
          this.setDevicesLoading(false);
        });

      this.nuviotClient.getListResponse<Devices.DeviceGroupSummary>(`api/repo/${id}/groups`)
        .then(deviceListResponse => this.setDeviceGroups(deviceListResponse.model));
    } else {
      this.setDeviceRepo(this._deviceRepo);
      this.setDevices(this._devices);
      this.setDeviceGroups(this._deviceGroups);
    }
  }

  public loadDeviceRepo(repoId: string): Promise<Devices.DeviceRepository> {
    const promise = new Promise<Devices.DeviceRepository>((resolve, reject) => {
      this.nuviotClient.getFormResponse<Devices.DeviceRepository, Devices.DeviceRepoView>(`/api/devicerepo/${repoId}`)
        .then(deviceRepoResponse => {
          this.setDeviceRepo(deviceRepoResponse!.model);
          resolve(deviceRepoResponse!.model);
        })
        .catch(err => reject(err));
    });

    return promise;
  }

  getDevicesForRepoAsync(repoId: string) : Promise<Core.ListResponse<Devices.DeviceSummary>> {
    return this.nuviotClient.getListResponse<Devices.DeviceSummary>(`/api/devices/${repoId}`);
  }

  /**
   * This method will load a device from the server and broadcast the device to
   * any pages that have a subscription.
   * @param repoId Repository Id
   * @param deviceId  Device Id
   */
  public loadDeviceOntoPage(repoId: string, deviceId: string) {
    if (deviceId !== this._deviceId) {
      this._deviceLoading$.next(undefined);
      this._deviceCleared$.next(undefined);

      const uri = `/api/device/${repoId}/${deviceId}/metadata`;
      this.nuviotClient.getFormResponse<Devices.DeviceDetail, Devices.DeviceView>(uri)
        .then(response => {
          this._deviceId = deviceId;
          this._repoId = repoId;

          /* Make any last minute initialization of potentially invalid data */
          this.deviceSafeInit(response!.model);
          this.setDeviceDetail(response!.model);
        });
    }
  }

  public getDeviceType(deviceTypeId: string): Promise<Core.FormResult<Devices.DeviceType, Devices.DeviceTypeView>> {
    const uri = `/api/devicetype/${deviceTypeId}`;
    console.log(uri);
    return this.nuviotClient.getFormResponse(uri);
  }

  public updateRemoteDeviceProperties(repoId: string, deviceId: string): Promise<Core.InvokeResult> {
    const uri = `/api/device/remoteconfig/${repoId}/${deviceId}/all/send`;
    return this.nuviotClient.request<Core.InvokeResult>(uri);
  }

  public restartDevice(repoId: string, deviceId: string): Promise<Core.InvokeResult> {
    const uri = `/api/device/remoteconfig/${repoId}/${deviceId}/restart`;
    return this.nuviotClient.request<Core.InvokeResult>(uri);
  }

  public refreshDeviceTwin(repoId: string, deviceId: string): Promise<Core.InvokeResult> {
    const uri = `/api/device/remoteconfig/${repoId}/${deviceId}/query`;
    return this.nuviotClient.request<Core.InvokeResult>(uri);
  }

  public requestFirmwareUpdate(repoId: string, deviceId: string, firmwareId: string, revisionId: string) : Promise<Core.InvokeResultEx<string>> {
    const uri = `/api/device/remoteconfig/${repoId}/${deviceId}/firmware/${firmwareId}/revision/${revisionId}?`;
    return this.nuviotClient.request(uri);
  }

  public getFirmwareHistory(repoId: string, deviceId: string): Promise<Devices.FirmwareDownloadRequest[]> {
    const promise = new Promise<Devices.FirmwareDownloadRequest[]>((resolve, reject) => {
      this.nuviotClient.getListResponse<Devices.FirmwareDownloadRequest>(`/api/firmware/history/${repoId}/${deviceId}`)
        .then(requests => {
          resolve(requests.model);
        })
        .catch(err => reject(err));
    });

    return promise;
  }

  /**
   * !!! not tested!!!
   * @param repoId
   * @param deviceId
   */
  public loadDeviceLogs(repoId: string, deviceId: string) {
    if (deviceId !== this._deviceIdForLogs) {
      const uri = `device/${repoId}/logs/${deviceId}`;
      this._deviceLogLoading$.next(undefined);
      this._deviceCleared$.next(undefined);
      this.nuviotClient.getListResponse<Devices.DeviceLog>(uri)
        .then(response => {
          this._deviceId = deviceId;
          this._repoId = repoId;
          this._deviceLogs$.next(response.model);
        });
    }
  }


  public downloadDeviceTypeResource(fileName: string, deviceTypeId: string, resourceId: string) {
    const uri = `/api/devicetype/${deviceTypeId}/resources/${resourceId}`;

    this.nuviotClient.getBlobResponse(uri, fileName);
  }

  /**
 * This method will load a device from the server and broadcast the device to
 * any pages that have a subscription.
 * @param repoId Repository Id
 * @param deviceId  Device Id
 */
  public getMediaItemsForDevice(repoId: string, deviceId: string): Promise<Core.ListResponse<Devices.MediaItem>> {
    const promise = new Promise<Core.ListResponse<Devices.MediaItem>>((resolve, reject) => {
      const uri = `/api/${repoId}/devices/${deviceId}/media`;
      this.nuviotClient.getListResponse<Devices.MediaItem>(uri)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });

    return promise;
  }

  /**
   * This method will return a device to the caller via a promise.
   * @param repoId Repository Id
   * @param deviceId Device Id
   */
  public async getDevice(repoId: string, deviceId: string): Promise<Devices.DeviceDetail | null> {
    this.setDeviceDetail(undefined);
    this._deviceLoading$.next(undefined);
    const uri = `/api/device/${repoId}/${deviceId}/metadata`;
    let result = await this.nuviotClient.getFormResponse<Devices.DeviceDetail, Devices.DeviceView>(uri);
    this.setDeviceDetail(result!.model);

    if(result!.successful)
      return result!.model;
    
    console.error('[DeviceService__getDevice] - Error loading device');
    console.error(result.errors[0].message);
    return null;
  }

  public async getPublicDeviceInfo(orgId: string, repoId: string, deviceId: string): Promise<Devices.PublicDeviceInfo> {
    const uri = `/api/public/device/${orgId}/${repoId}/${deviceId}`;
    return await this.nuviotClient.request<Devices.PublicDeviceInfo>(uri);
  }

  public refreshDeviceData(repoId: string, deviceId: string) {
    const uri = `/api/device/${repoId}/${deviceId}/metadata`;
    this.nuviotClient.getFormResponse<Devices.DeviceDetail, Devices.DeviceView>(uri)
      .then(response => {
        this.setDeviceDetail(response!.model);
      });
  }

  public loadDeviceGroup(repoId: string, groupId: string) {
    this.setDeviceGroup(undefined);
    this.deviceGroupService.getDeviceGroup(repoId, groupId)
      .then(group => this.setDeviceGroup(group.model));
  }

  public loadDeviceExceptions(repoId: string, deviceId: string): Promise<Core.ListResponse<Devices.DeviceException>> {
    const promise = new Promise<Core.ListResponse<Devices.DeviceException>>((resolve, reject) => {
      this.nuviotClient.getListResponse<Devices.DeviceException>(`/api/device/${repoId}/errors/${deviceId}`)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  public clearDevice() {
    this.setDeviceDetail(undefined);
  }

  public clearDeviceErrorCode(repoId: string, deviceId: string, errorCode: string): Promise<Core.InvokeResult> {
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.nuviotClient.delete(`/api/device/${repoId}/${deviceId}/error/${errorCode}`)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  public async addDevice(device: Devices.DeviceDetail, replace: boolean = false, reportError: boolean = true): Promise<Core.InvokeResultEx<Devices.DeviceDetail>> {
    console.log('should we replace?', replace, 'report error', reportError);

     return await this.nuviotClient.postWithResponse(`/api/device/${device.deviceRepository.id}?reassign=${replace}`, device, reportError);
  }

  public addUserDevice(user: Devices.DeviceUser): Promise<Core.InvokeResult> {
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.nuviotClient.insert(`/api/device/${user.device.deviceRepository.id}/userdevice`, user)
        .then(resp => {
          this.setDeviceDetail(undefined);
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }


  public getUserDevices(repoid: string, filter: Core.ListFilter): Promise<Core.ListResponse<Users.AppUserSummary>> {
    const promise = new Promise<Core.ListResponse<Users.AppUserSummary>>((resolve, reject) => {
      this.nuviotClient.getListResponse<Users.AppUserSummary>(`/api/users/repo/${repoid}`, filter)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  public async updateDevice(device: Devices.DeviceDetail, clearDevice: boolean = true): Promise<Core.InvokeResult> {
    let response = await this.nuviotClient.update(`/api/device/${device.deviceRepository.id}`, device)

    console.log(response);

    if ((response).successful) {
      if (clearDevice) {
        this.setDeviceDetail(undefined);
      } else {
        this.setDeviceDetail(device);
      }
    }

    return response;
  }

  public addDeviceNote(deviceRepoId: string, deviceId: string, deviceNote: Devices.DeviceNote): Promise<Core.InvokeResult> {
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {

      this.nuviotClient.post(`/api/device/${deviceRepoId}/${deviceId}/note`, deviceNote)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  public validateDevice(device: Devices.DeviceDetail): Core.ErrorMessage[] {
    const errs: Core.ErrorMessage[] = [];

    if (!device.name) {
      errs.push({ message: 'Device Name is a required field.' });
    }

    if (!device.deviceId) {
      errs.push({ message: 'Device Id is a required field.' });
    }

    if (!device.primaryAccessKey) {
      errs.push({ message: 'Primary access key is a required field.' });
    }

    if (!device.secondaryAccessKey) {
      errs.push({ message: 'Secondary access key is a required field.' });
    }

    if (!device.deviceType || !device.deviceType.id) {
      errs.push({ message: 'Device Type is a required Field.' });
    } else if (!device.deviceConfiguration || !device.deviceConfiguration.id) {
      errs.push({ message: 'Device Configuration is a required field (device type may be invalid)' });
    }

    return errs;
  }

  createDeviceSensor(): Promise<Core.FormResult<Devices.Sensor, Devices.SensorView>> {
    return this.nuviotClient.getFormResponse("/api/device/sensor/factory");
  }

  setDeviceSensor(repoid: string, id: string, sensor: Devices.Sensor): Promise<Core.InvokeResult> {
    return this.nuviotClient.post(`/api/device/{repoid}/${id}/sensor`, sensor);
  }

  onDeviceNotificationSubscription(): Observable<Core.Notification> {
    return this._deviceNotificationSubscription$.asObservable();
  }

  onDeviceGroupNotificationSubscription(): Observable<Core.Notification> {
    return this._deviceGroupNotificationSubscription$.asObservable();
  }

  onDeviceRepoNotificationSubscription(): Observable<Core.Notification> {
    return this._deviceRepoNotificationSubscription$.asObservable();
  }

  onDevices(): Observable<Devices.DeviceSummary[] | undefined> {
    return this._devices$.asObservable();
  }

  onDevicesLoading(): Observable<boolean> {
    return this._devicesLoading$.asObservable();
  }

  onDeviceRepo(): Observable<Devices.DeviceRepository | undefined> {
    return this._deviceRepo$.asObservable();
  }

  onDeviceGroups(): Observable<Devices.DeviceGroupSummary[] | undefined> {
    return this._deviceGroups$.asObservable();
  }

  onDeviceGroup(): Observable<Devices.DeviceGroup | undefined> {
    return this._deviceGroup$.asObservable();
  }

  onDeviceRepos(): Observable<Devices.DeviceRepoSummary[] | undefined> {
    return this._deviceRepos$.asObservable();
  }

  onDeviceDetail(): Observable<Devices.DeviceDetail | undefined> {
    return this._device$.asObservable();
  }

  onDeviceCleared(): Observable<Devices.DeviceDetail | undefined> {
    return this._deviceCleared$.asObservable();
  }

  onDeviceLoading(): Observable<string | undefined> {
    return this._deviceLoading$.asObservable();
  }

  onDeviceLog(): Observable<Devices.DeviceLog[]> {
    return this._deviceLogs$.asObservable();
  }

  onDeviceLogCleared(): Observable<Devices.DeviceLog[]> {
    return this._deviceLogCleared$.asObservable();
  }

  onDeviceLogLoading(): Observable<string | undefined> {
    return this._deviceLogLoading$.asObservable();
  }

  getDeviceGroups(): Devices.DeviceGroupSummary[] | undefined {
    return this._deviceGroups;
  }

  getDevices(): Devices.DeviceSummary[] | undefined {
    return this._devices;
  }

  getDeviceRepo(): Devices.DeviceRepository | undefined {
    return this._deviceRepo;
  }

  getDeviceRepos(): Devices.DeviceRepoSummary[] | undefined {
    return this._deviceRepos;
  }

  getDeviceDetail(): Devices.DeviceDetail | undefined {
    return this._device;
  }

  setDevices(devices: Devices.DeviceSummary[] | undefined) {
    this._devices = devices;
    this._devices$.next(devices);
  }

  setDevicesLoading(isLoading: boolean) {
    this._devicesLoading$.next(isLoading);
  }

  setDeviceRepo(deviceRepoSummary: Devices.DeviceRepository | undefined) {
    this._deviceRepo = deviceRepoSummary;
    this._deviceRepo$.next(deviceRepoSummary);
  }

  setDeviceDetail(device: Devices.DeviceDetail | undefined) {
    if (device) {
      this._deviceId = device.id;
    } else {
      this._deviceId = undefined;
    }

    this._device = device;
    this._device$.next(device);
  }

  setDeviceGroups(deviceGroups: Devices.DeviceGroupSummary[] | undefined) {
    this._deviceGroups = deviceGroups;
    this._deviceGroups$.next(deviceGroups);
  }

  setDeviceRepos(deviceRepos: Devices.DeviceRepoSummary[] | undefined) {
    this._deviceRepos = deviceRepos;
    this._deviceRepos$.next(deviceRepos);
  }

  setDeviceGroup(deviceGroup: Devices.DeviceGroup | undefined) {
    this._deviceGroup = deviceGroup;
    this._deviceGroup$.next(deviceGroup);
  }
}
