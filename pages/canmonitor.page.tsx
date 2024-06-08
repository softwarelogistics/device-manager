import { useEffect, useState } from "react";
import { View, Text, TextStyle, Animated, ScrollView, Button } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import styles from '../styles';
import ViewStylesHelper from "../utils/viewStylesHelper";
import fontSizes from "../styles.fontSizes";
import { CHAR_UUID_CAN_MSG } from '../NuvIoTBLE'
import { StatusBar } from "expo-status-bar";
import Page from "../mobile-ui-common/page";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";

interface ConsoleOutput {
    timestamp: string;
    message: string;
}

class FluidLevel {
    tankNumber: number;
    tankType: string = "?";
    capacity: number | undefined;
    fluidLevel: number | undefined;
    populated: boolean = false;

    constructor(tankNumber: number) {
        this.tankNumber = tankNumber;
    }

    handle(value: number[]) {
        this.tankNumber = value[0] & 0xF;
        let tankType = (value[0] >> 4) & 0xF
        switch (tankType) {
            case 0:
                this.tankType = 'Fuel';
                break;
            case 1:
                this.tankType = 'Water';
                break;
            case 2:
                this.tankType = 'Gray Water';
                break;
            case 3:
                this.tankType = 'Live Well';
                break;
            case 4:
                this.tankType = 'Oil';
                break;
            case 5:
                this.tankType = 'Black Water';
                break;
        }
        this.fluidLevel = (value[2] << 8 | value[1]) * 0.004;
        this.capacity = Math.round((value[6] << 24 | value[5] << 16 | value[4] << 8 | value[3]) * 0.1 * 26.4172) * 0.01;
        this.populated = true;
    }

    toString() {
        return `Fluid Level: Tank: ${this.tankNumber}, Level: ${this.fluidLevel}`;
    }

}

class EngineRapid {
    engineNumber: number;
    populated: boolean = false;
    engineRPM: number | undefined;
    tilt: number | undefined;

    constructor(engineNumber: number) {
        this.engineNumber = engineNumber;
    }

    handle(value: number[]) {
        this.engineRPM = value[2] << 8 | value[1];
        this.tilt = value[5];
        this.populated = true;
    }

    toString() {
        return `Engine Rapid: RPM: ${this.engineRPM}, Tilt: ${this.tilt}`;
    }
}


class ParserState {
    lastEngineNumber: number | undefined;

    setLastEngineNumber(msgId: number, engineNumber: number) {
        this.lastEngineNumber = engineNumber;
    }

    getLastEngineNumber(msgId: number) {
        return this.lastEngineNumber;
    }

}

class EngineDynamic {
    /*
    
    Field #	Field Name	Description	Unit	Type
    0-3   x   Message Id
      4   x   Message Length
    
        1      0  1	Instance		0 .. 253  8 bits lookup ENGINE_INSTANCE
    02-03  01-02  2	Oil pressure		100 Pa 0 .. 6553300 16 bits unsigned NUMBER
    04-05  03-04  3	Oil temperature		0.1 K  0 .. 6553.3  16 bits unsigned NUMBER 
    06-07  05-06  4	Temperature		0.01 K0 .. 655.33 16 bits unsigned NUMBER
    
    08-09  07-08  5	Alternator Potential		0.01 V -327.67 .. 327.65 16 bits signed NUMBER
    10-11  09-10	Fuel Rate		0.1 L/h -3276.7 .. 3276.5 16 bits signed NUMBER
    12-15  11-14	Total Engine hours		s 0 .. 4294967293 32 bits unsigned TIME
    
    16-17  15-16	Coolant Pressure		100 Pa 0 .. 6553300 16 bits unsigned NUMBER
    18-19   17-18	Fuel Pressure		1000 Pa 0 .. 65533000 16 bits unsigned NUMBER
       20      20   Reserved			8 bits RESERVED 
    21-22   20-21	Discrete Status 1	0 .. 65535 16 bits bitfield ENGINE_STATUS_1
    23-24   22-23	Discrete Status 2	0 .. 65535 16 bits bitfield ENGINE_STATUS_2
       25	   24   Engine Load		% -127 .. 125 8 bits signed NUMBER
       26	   25   Engine Torque		% -127 .. 125 8 bits signed NUMBER
    
     */

    engineNumber: number;

    oilPressure: number | undefined;
    engineTemperature: number | undefined;
    voltage: number | undefined;
    fuelRate: number | undefined;
    fuelPressure: number | undefined

    messageBuffer: number[] = [];
    populated: boolean = false;

    constructor(engineNumber: number, messageSize: number) {
        this.engineNumber = engineNumber;
        for (let idx = 0; idx < messageSize; ++idx) {
            this.messageBuffer[idx] = 0;
        }

        console.log('init-dynamic', 'engineNumber', engineNumber, messageSize, this.messageBuffer);
    }

    handle(idx: number, value: number[]) {
        switch (idx) {
            case 0:
                for (let idx = 0; idx < 6; ++idx) {
                    this.messageBuffer[idx] = value[idx + 2];
                }
                break;
            case 1:
                for (let idx = 0; idx < 7; ++idx) {
                    this.messageBuffer[idx + 6] = value[idx + 1];
                }
                break;
            case 2:
                for (let idx = 0; idx < 7; ++idx) {
                    this.messageBuffer[idx + 6 + 7] = value[idx + 1];
                }
                break;
            case 3:
                for (let idx = 0; idx < 7; ++idx) {
                    this.messageBuffer[idx + 6 + 7 + 7] = value[idx + 1];
                }
                this.populated = true;

                break;
        }

        if (this.messageBuffer[2] != 255 && this.messageBuffer[1] != 255)
            this.oilPressure = (this.messageBuffer[2] << 8 | this.messageBuffer[1]) / 100.0;

        if (this.messageBuffer[6] > 0 && this.messageBuffer[5] != 255) {
            var kelvin = (this.messageBuffer[6] << 8 | this.messageBuffer[5]) / 100.0;
            this.engineTemperature = Math.round((kelvin - 273.15) * 9 / 5 + 32);
        }

        if (this.messageBuffer[10] > 0 && this.messageBuffer[9] != 255)
            this.fuelRate = (this.messageBuffer[10] << 8 | this.messageBuffer[9]) / 100.0;

        if (this.messageBuffer[18] > 0 && this.messageBuffer[17] > 0)
            this.fuelPressure = (this.messageBuffer[18] << 8 | this.messageBuffer[17]) / 100.0;

        if (this.messageBuffer[8] > 0 && this.messageBuffer[7] > 0)
            this.voltage = (this.messageBuffer[8] << 8 | this.messageBuffer[7]) / 100.0;
    }

    toString() {
        let str = `F201 Engine: ${this.engineNumber} `;
        for (let idx = 0; idx < this.messageBuffer.length; ++idx) {
            let value = this.messageBuffer[idx];
            if (value !== undefined) {
                if (value < 8)
                    str += `0${value.toString(16)} `;
                else
                    str += `${value.toString(16)} `;
            }
            else
                str += "?? ";

        }
        //return str;

        return `Engine Dynamic: Temperature: ${this.engineTemperature}, Voltage: ${this.voltage}, Oil Pressure: ${this.oilPressure}`;
    }
}

class CustomParameters  {
    engineNumber: number;
    fuelFlow: number | undefined;
    fuelPressure: number | undefined;
    manifoldPressure: number | undefined;
    bilgeOn: boolean | undefined;

    // E201
    constructor(engineNumber: number) {
        this.engineNumber = engineNumber;
    }

}

class BatteryLevel {
    instanceNumber: number;
    voltage: number | undefined;

    constructor(instanceNumber: number) {
        this.instanceNumber = instanceNumber;
    }

    handle(value: number[]) {
        this.voltage = (value[2] << 8 | value[1]) / 100.0;
    }
    
}

export const CanMonitorPage = ({ props, navigation, route }: IReactPageServices) => {
    

    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
    const [parserState, setParserState] = useState<ParserState>(new ParserState());

    const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);


    const [engineDynamicParameters, setEngineParameters] = useState<EngineDynamic[]>([]);
    const [engineRapidParameters, setEngineRapidParameters] = useState<EngineRapid[]>([]);
    const [fluidLevelParameters, setFluidLevelParameters] = useState<FluidLevel[]>([]);
    const [batteryParameters, setBatteryParameters] = useState<BatteryLevel[]>([]);

    const peripheralId = route.params.peripheralId;
    let themePalette = AppServices.instance.getAppTheme();
    const contentStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.mediumSmall, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);
    const headerStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { marginTop: 20, color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);


    /* CAN Message Structure 
     * 0-3 - Message Id
     * 4 - Message Index
     * 5 - First Messaged - Length
     * 6 - Engine Number
    */
    const charHandler = (value: any) => {
        if (value.characteristic == CHAR_UUID_CAN_MSG) {
            let msgId = value.raw[1] << 8 | value.raw[2];

            let buffer: number[] = [];

            for(let idx = 0; idx < 8; ++idx)
                buffer[idx] = value.raw[idx + 4];
            
            console.log('canmsg', msgId.toString(16), buffer);

            if (msgId == 0xf201) {
                let msgIdx = buffer[0] & 0x0F;        
                if (msgIdx == 0) {
                    let engineNumber = buffer[2];
                    let messageSize = buffer[1];
                    parserState.setLastEngineNumber(msgIdx, engineNumber);
                    let parameter = engineDynamicParameters.find(eng => eng.engineNumber == engineNumber);
                    if (!parameter) {
                        parameter = new EngineDynamic(engineNumber, messageSize);
                        engineDynamicParameters.push(parameter);
                        parameter.handle(msgIdx, buffer);
                    }
                    else {
                        let parameter = engineDynamicParameters.find(eng => eng.engineNumber == engineNumber);
                        parameter!.handle(msgIdx, buffer);                        
                    }
                }
                else {
                    let parameter = engineDynamicParameters.find(eng => eng.engineNumber == parserState.getLastEngineNumber(msgId));
                    if (parameter) {
                        parameter!.handle(msgIdx, buffer);                        
                    }
                }
            }
            else if (msgId == 0xF200) {
                let engineNumber = buffer[0];

                let parameter = engineRapidParameters.find(eng => eng.engineNumber == engineNumber);
                if (!parameter) {
                    parameter = new EngineRapid(engineNumber);
                    engineRapidParameters.push(parameter);
                    parameter.handle(buffer);
                }
                else
                    parameter.handle(buffer);

                //console.log(value.raw);
                //console.log(parameter.toString());
            }
            else if (msgId == 0xF211) {
                let tankNumber = buffer[0];

                let parameter = fluidLevelParameters.find(eng => eng.tankNumber == tankNumber);
                if (!parameter) {
                    parameter = new FluidLevel(tankNumber);
                    fluidLevelParameters.push(parameter);
                    parameter.handle(buffer);
                }
                else
                    parameter.handle(buffer);
            }
            else if(msgId == 0xE202) {

            }
            else if(msgId == 0xE201) {

            }
            else if(msgId == 0xF214) {
                let batteryNumber = buffer[0];

                let parameter = batteryParameters.find(eng => eng.instanceNumber == batteryNumber);
                if (!parameter) {
                    parameter = new BatteryLevel(batteryNumber);
                    batteryParameters.push(parameter);
                    parameter.handle(buffer);
                }
                else
                    parameter.handle(buffer);
            }

            setLastUpdated(new Date());
        }
    }

    const tryConnect = async () => {
        ConnectedDevice.onReceived = (value) => charHandler(value);
        ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
        ConnectedDevice.onDisconnected = () => setIsDeviceConnected(false);

        await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_CAN_MSG]);
    }

    useEffect(() => {
        const focusSubscription = navigation.addListener('focus', async () => {
            await tryConnect();
        });

        const blurSubscription = navigation.addListener('beforeRemove', async () => {
            if (isDeviceConnected)
                await ConnectedDevice.disconnect();

        });

        return (() => {
            focusSubscription();
            blurSubscription();
        });
    }, [isDeviceConnected, lastUpdated]);

    return <Page style={[styles.container]}>
        <ScrollView style={styles.scrollContainer}>
            <StatusBar style="auto" />
            {
                
                <View>
                    <View>
                        <Text>
                        {isDeviceConnected && 
                            <Text>
                            Connected
                            </Text>
                        }
                        {!isDeviceConnected && 
                            <Text>
                            Not Connected
                            <Button title="Connect" onPress={tryConnect} />
                            </Text>
                        }
                        </Text>
                    </View>                    
                    <Text style={headerStyle}>Rapid Properties</Text>
                    {engineRapidParameters.map((itm, idx) =>
                        <View key={idx}>
                            <Text style={contentStyle}>Engine Number: {itm.engineNumber}</Text>
                            <Text style={contentStyle}>RPM: {itm.engineRPM}</Text>
                            <Text style={contentStyle}>Motor Trim: {itm.tilt}</Text>
                        </View>
                    )}

                    <Text style={headerStyle}>Dynamic Properties</Text>
                    {engineDynamicParameters.map((itm, idx) =>
                        <View key={idx}>
                            <Text style={contentStyle}>Engine Number: {itm.engineNumber}</Text>
                            <Text style={contentStyle}>Engine Temperature: {itm.engineTemperature} F</Text>
                            <Text style={contentStyle}>Oil Pressure: {itm.oilPressure} psi</Text>
                            <Text style={contentStyle}>Voltage: {itm.voltage} V</Text>
                            <Text style={contentStyle}>Fuel Pressure: {itm.fuelPressure} l/h</Text>
                            <Text style={contentStyle}>Fuel Rate: {itm.fuelRate} pa</Text>
                        </View>
                    )}

                    <Text style={headerStyle}>Fluid Levels</Text>
                    {fluidLevelParameters.map((itm, idx) =>
                        <View key={idx}>
                            <Text style={contentStyle}>Tank Number: {itm.tankNumber}</Text>
                            <Text style={contentStyle}>Tank Type: {itm.tankType}</Text>
                            <Text style={contentStyle}>Fuel Level: {itm.fluidLevel}%</Text>
                            <Text style={contentStyle}>Capacity: {itm.capacity} Gallons</Text>
                        </View>
                    )}

                    <Text style={headerStyle}>Battery Levels</Text>
                    {batteryParameters.map((itm, idx) =>
                        <View key={idx}>
                            <Text style={contentStyle}>Battery Number: {itm.instanceNumber}</Text>
                            <Text style={contentStyle}>Voltage: {itm.voltage}v</Text>
                        </View>
                    )}
                </View>
            }
        </ScrollView>
    </Page>
}