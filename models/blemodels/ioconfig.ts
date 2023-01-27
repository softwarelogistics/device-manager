export class IOConfig {
    constructor(str: string) {
        let parts = str.split(',');
        this.port = parts[0];
        this.name = parts[1];
        this.config = parseInt(parts[2]);
        this.scaler = parseFloat(parts[3]);
        this.calibration = parseFloat(parts[4]);
        this.zero =parseFloat(parts[5]);
    }

    port: String;
    name: String;
    config: number;
    scaler: number;
    calibration: number;
    zero: number;
}