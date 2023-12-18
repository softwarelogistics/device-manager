import { useState } from "react";
import { View, Text, Image, Animated, Button } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import Page from "../mobile-ui-common/page";
import { RadialGauge } from "../mobile-ui-common/radial-gauge";
import { IRadialGaugeProps, GetNeedleStyle } from "../mobile-ui-common/gauge-props";
import { LevelGauge } from "../mobile-ui-common/level-gauge";
// @ts-ignore
import NeedleImage from '../assets/needle.png';
// @ts-ignore
import SimpleNeedleImage from '../assets/simple-needle.png';
import { RemoteDeviceState } from "../models/blemodels/state";
import { ble, CHAR_UUID_IO_VALUE, CHAR_UUID_STATE } from "../NuvIoTBLE";
import { IOValues } from "../models/blemodels/iovalues";
import { PermissionsHelper } from "../services/ble-permissions";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;


export const SeaWolfHomePage = ({ navigation, props, route }: IReactPageServices) => {
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
    const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
    const [label, setLabel] = useState<string | undefined>("RPM");
    const [stepMarker, setStepMarker] = useState(18);
    const [marker, setMarker] = useState(50);
    const [hasMacAddress, setHasMacAddress] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [connectionState, setConnectionState] = useState<number>(IDLE);
    const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined | null>(undefined);
    const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
    const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
    const [deviceInRange, setDeviceInRange] = useState<boolean>(false);
    const [peripheralId, setPeripheralId] = useState<string | undefined>(undefined);
   
    const Label = () => (
        <View>
            <Text style={{ color: themePalette.accentColor, fontSize: 10 }}>{label}</Text>
        </View>
    );

    const Step: IRadialGaugeProps['renderStep'] = ({ step, angle, getX, getY, radius, }) => (
        <>
            <View style={[{
                width: step % 25 === 0 ? 4 : 1, marginLeft: -2, height: 20, borderRadius: 2,
                position: 'absolute', left: getX(0, radius + stepMarker), top: getY(10, radius + stepMarker),
                backgroundColor: 'lightgray', transform: [{ rotateZ: `${angle}deg` }],
            },
            ]} />
            <Text style={[{
                position: 'absolute', fontSize: 16, left: getX(-10, radius + marker), top: getY(10, radius + marker),
                color: themePalette.shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400') , transform: [{ rotateZ: `${angle}deg` }],
            },]} >
                {step % 10 === 0 ? `${step}` : ''}
            </Text>
        </>
    );

    const Needle: IRadialGaugeProps['renderNeedle'] = ({ getNeedleStyle }) => (
        <>
            <AnimatedImage
                style={[getNeedleStyle(300 / 3, 300 / 3)]}
                source={SimpleNeedleImage}
            />
        </>
    );

    return (<Page>
        <View>
            <View>
                <RadialGauge key='two' emptyColor="#C1C1C1" colors={['green', 'yellow', 'red']} sweepAngle={270} strokeWidth={2}
                    fillProgress={80} renderNeedle={Needle} steps={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} renderStep={Step}
                    renderLabel={Label} size={300} thickness={10}></RadialGauge>


            </View>
            <View>
            <LevelGauge key='one' emptyColor="#C1C1C1" colors={['green', 'yellow', 'red']} sweepAngle={270} strokeWidth={5}
                    fillProgress={33} steps={[0, 20, 40, 60, 80, 100]}
                    renderStep={Step} renderLabel={Label} width={100} height={180} level={50} thickness={20}></LevelGauge>
            </View>
        </View>
    </Page>

    )
}