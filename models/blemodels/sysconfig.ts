import { timestamp } from "rxjs";

export class SysConfig {
  constructor(str: string) {
    let parts = str.split(',');    

    this.deviceId = parts[0];
    this.orgId = parts[1];
    this.repoId = parts[2];
    this.id = parts[3];
    this.deviceModelId = parts[4];
    this.serverHostName = parts[5];
    this.serverUid = parts[6];
    this.serverPwd = parts[7];
    this.port = parts.length >= 9 ? parseInt(parts[8]) : 0;
    this.serverType = parts[9];
    this.deviceAccessKey = parts[10];
    this.commissioned = parts[11] == '1';
    this.cellEnabled = parts[12] == '1';
    this.wifiEnabled = parts[13] == '1';
    this.wifiSSID = parts[14];
    this.wifiPWD = parts[15];
    this.pingRate = parseInt(parts[16]);
    this.sendUpdateRate = parseInt(parts[17]);
    this.gpsEnabled = parts[18] == '1';
    this.gpsUpdateRate = parts[19];
    if(parts.length >= 20)
      this.loopRate = parts[20];
    else 
      this.loopRate = "250";
  }

  deviceId: string;
  orgId: string;
  repoId: string;
  id: string;
  deviceModelId: string;
  serverHostName: string;
  serverUid: string;
  serverPwd: string;
  serverType: string;
  deviceAccessKey: string;
  commissioned: boolean;
  cellEnabled: boolean;
  wifiEnabled: boolean;
  wifiSSID: string;
  port: number;
  wifiPWD: string;
  pingRate: number;
  sendUpdateRate: number;
  gpsEnabled: boolean;
  gpsUpdateRate: string;
  loopRate: string;
}