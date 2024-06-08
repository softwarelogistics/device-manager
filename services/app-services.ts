import { UserService } from './user.service';
import { NativeStorageService } from '../core/utils'
import { NuviotClientService } from './nuviot-client.service';
import { NetworkCallStatusService } from './network-call-status-service';
import { ErrorReporterService } from './error-reporter.service';
import { HttpClient } from '../core/utils';

import { DevicesService } from './devices.service';
import { DeviceGroupService } from './device-group.service';
import { ThemePalette, ThemePaletteService } from '../styles.palette.theme';
import { NuvIoTEventEmitter } from '../utils/NuvIoTEventEmitter';
import { DeploymentService } from './deployment.service';
import WssService from './wss.service';
import { OrgService } from './orgservice';
import { NavService } from './NavService';

class AppServices {
    private _appTheme: ThemePalette;
    private static _instanceCount : number = 0;

    public themeChangeSubscription: NuvIoTEventEmitter = new  NuvIoTEventEmitter();

    constructor() {
        AppServices._instanceCount += 1;
        this._appTheme = ThemePaletteService.getThemePalette('light');
        this.storage = new NativeStorageService();
        this.errorReporter = new ErrorReporterService();
        this.networkCallStatusService = new NetworkCallStatusService();

        this.navService = new NavService();
        this.httpClient = new HttpClient(this.storage);

        this.client = new NuviotClientService(this.httpClient, this.navService, this.errorReporter);
        
        this.deploymentServices = new DeploymentService(this.client);
        this.deviceGroupsServices = new DeviceGroupService(this.client);
        this.deviceServices = new DevicesService(this.deviceGroupsServices, this.client);
        this.wssService = new WssService(this.client);
        this.orgsService = new OrgService(this.client);
        this.userServices = new UserService(this.httpClient, this.client, this.errorReporter, this.storage);
        console.log(`[AppServices__constructor] - AppServices initialized. ${AppServices._instanceCount}`);
    }

    getAppTheme(): ThemePalette {
        return this._appTheme;
    }

    setAppTheme(palette: ThemePalette) {
        this._appTheme = palette;                
    }

    httpClient: HttpClient;
    networkCallStatusService: NetworkCallStatusService;
    errorReporter: ErrorReporterService;
    storage: NativeStorageService;
    client: NuviotClientService;
    deploymentServices: DeploymentService;
    deviceGroupsServices: DeviceGroupService;
    deviceServices: DevicesService;
    userServices: UserService;
    orgsService: OrgService;
    wssService: WssService;
    navService: NavService;

    static instance: AppServices = new AppServices();
}

export default AppServices;