export class IOValues {
    constructor(str: string) {
        console.log(str);
        this.adcValues = [];
        this.ioValues = [];

        let parts = str.split(',');
        for (let idx = 0; idx < 8; ++idx) {
            let value = parts[idx];
            if (value)
                this.ioValues.push(parseFloat(value));
            else
                this.ioValues.push(undefined);
        }

        for (let idx = 8; idx < 16; ++idx) {
            let value = parts[idx];
            console.log(value);
            if (value)
                this.adcValues.push(parseFloat(value));
            else
                this.adcValues.push(undefined);
        }
    };

    adcValues: (number | undefined)[];
    ioValues: (number | undefined)[];
}