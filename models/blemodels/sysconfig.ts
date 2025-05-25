export class SysConfig {
  constructor(str: string) {
    console.log(str);
    let parts = str.split(',');    

    this.deviceId = parts[0];
    this.orgId = parts[1];
    this.repoId = parts[2];
    this.id = parts[3];
    this.deviceTypeId = parts[4];
    this.customerId = parts[4];
    this.deviceFirmwareSku = parts[5];
    this.configurationLevel = parseInt(parts[6]);
    this.serverHostName = parts[7];
    this.serverUid = parts[8];
    this.serverPwd = parts[9];
    this.port = isNaN(parseInt(parts[10])) ? undefined : parseInt(parts[10]);
    this.serverType = parts[11];
    this.deviceAccessKey = parts[12];
    this.commissioned = parts[13] == '1';
    this.cellEnabled = parts[14] == '1';
    this.wifiEnabled = parts[15] == '1';
    this.wifiSSID = parts[16];
    this.wifiPWD = parts[17];
    this.pingRate = parseInt(parts[18]);
    this.sendUpdateRate = parseInt(parts[19]);
    this.gpsEnabled = parts[20] == '1';
    this.gpsUpdateRate = parts[21];
    this.loopRate = parts[22];
    this.macAddress = parts[23];
  }

  deviceId: string;
  orgId: string;
  repoId: string;
  customerId: string;
  id: string;
  deviceTypeId: string;
  deviceFirmwareSku: string;
  configurationLevel: number;
  serverHostName: string;
  serverUid: string;
  serverPwd: string;
  serverType: string;
  deviceAccessKey: string;
  commissioned: boolean;
  cellEnabled: boolean;
  wifiEnabled: boolean;
  wifiSSID: string;
  port?: number;
  wifiPWD: string;
  pingRate: number;
  sendUpdateRate: number;
  gpsEnabled: boolean;
  gpsUpdateRate: string;
  loopRate: string;
  macAddress: string;
}