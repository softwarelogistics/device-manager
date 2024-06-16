export class WiFiStatus {
    constructor (value: string) {
        var parts = value.split(',');        
        this.connections = [];
        if(parts[0]) {
            let connections = parts[0].split(';');

            for(let connection of connections) {
                if(connection)
                    this.connections.push(new WiFiNetwork(connection));
            }
        }

        this.connected = parts[1] != '0';
        this.status = parts[2];
        this.ssid = parts[3];
        this.password= parts[4];
        this.ipAddress = parts[5];
        this.macAddress = parts[6];
        this.rssi = parseInt(parts[7]);
    }

    connections: WiFiNetwork[];
    connected: boolean;
    status: string;
    ssid: string;
    password: string;
    ipAddress: string;
    macAddress: string;
    rssi: number;
}

export class WiFiNetwork {
    constructor(value: string) {
        var parts = value.split('=');
        this.ssid = parts[0];
        this.rssi = parseInt(parts[1]);
    }

    ssid: string;
    rssi: number;
}