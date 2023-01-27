export class RemoteDeviceState {
    constructor(str: string) {
        if(str) {
            let parts = str.split(',');   
            this.firmwareSku= parts[0];
            this.firmwareRevision = parts[1];
            this.hardwareRevision = parts[2];
            this.commissioned = parts[3] == '1';            
            this.wifiRSSI = parseInt(parts[5]);
            this.wifiIPAddress = parts[6];
            this.cellularConnected = parts[7] == '1';
            this.cellularRSSI = parseInt(parts[8]),
            this.cellularIPAddress = parts[9]
            this.isCloudConnected = parts[10] == '1'
            this.inputVoltage = parseFloat(parts[11]);
            this.externalPower = parts[12] == '1';
            this.otaParam = parts[13];
            this.otaState = parts[14];

            switch(parts[4])
            {
                case '0': this.wifiStatus = 'Idle'; break;
                case '1': this.wifiStatus = 'Not Commissioned'; break;
                case '2': this.wifiStatus = 'No SSID'; break;
                case '3': this.wifiStatus = 'No Connection Available'; break;
                case '4': this.wifiStatus = 'Connecting'; break;
                case '5': this.wifiStatus = 'Connected'; break;
                case '6': this.wifiStatus = 'Disconnected'; break;
            }
        }
    };

    firmwareSku:string = "?";
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



