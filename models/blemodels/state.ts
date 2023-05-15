export class RemoteDeviceState {
    constructor(str: string) {
        if(str) {
            let parts = str.split(',');   
            this.firmwareSku= parts[0];
            this.deviceModelKey = parts[1];
            this.firmwareRevision = parts[2];
            this.hardwareRevision = parts[3];            
            this.commissioned = parts[4] == '1';            
            // 5 is added below as a enum
            this.wifiRSSI = parseInt(parts[6]);
            this.wifiIPAddress = parts[7];
            this.cellularConnected = parts[8] == '1';
            this.cellularRSSI = parseInt(parts[9]),
            this.cellularIPAddress = parts[10]
            this.isCloudConnected = parts[11] == '1'
            this.inputVoltage = parseFloat(parts[12]);
            this.externalPower = parts[13] == '1';
            this.otaParam = parts[14];
            this.otaState = parts[15];

            switch(parts[5])
            {
                case '0': this.wifiStatus = 'Idle'; break;
                case '1': this.wifiStatus = 'Not Commissioned'; break;
                case '2': this.wifiStatus = 'No SSID'; break;
                case '3': this.wifiStatus = 'No Connection Available'; break;
                case '4': this.wifiStatus = 'Connecting'; break;
                case '5': this.wifiStatus = 'Connected'; break;
                case '6': this.wifiStatus = 'Disconnected'; break;
            }

            console.log(this.wifiStatus);
        }
    };

    firmwareSku:string = "?";
    deviceModelKey: string = "?";
    firmwareRevision: string= "?";
    hardwareRevision: string= "?";
    commissioned: boolean = false;
    wifiStatus: string= '?';
    wifiRSSI: number = -1;
    wifiIPAddress: string = '?';
    cellularConnected: boolean= false;
    cellularRSSI: number = -1;
    cellularIPAddress: string = '?';
    isCloudConnected: boolean= false;
    inputVoltage: number= 0;
    externalPower: boolean= false;
    otaState: string = '?';
    otaParam: string = '?'
}



