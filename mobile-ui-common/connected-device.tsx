import { IReactPageServices } from "../services/react-page-services";
import { ble, CHAR_UUID_CONSOLE, SVC_UUID_NUVIOT, CHAR_UUID_CAN_MSG } from '../NuvIoTBLE'
import { useEffect, useState } from "react";
import styles from '../styles';
import ViewStylesHelper from "../utils/viewStylesHelper";
import { ThemePalette } from "../styles.palette.theme";
import AppServices from "../services/app-services";
import fontSizes from "../styles.fontSizes";
import { Text, TextStyle, View } from "react-native";
import { PermissionsHelper } from "../services/ble-permissions";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export const ConnectedDevice = ({ navigation, props, route, onReceived, subscriptions }: IReactPageServices) => {
    const [connectionState, setConnectionState] = useState<number>(IDLE);
    const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
    const [deviceInRange, setDeviceInRange] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [initialCall, setInitialCall] = useState<boolean>(true);

    const peripheralId = route.params.peripheralId;
    const contentStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.mediumSmall, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);

    const disconnectHandler = (id: string) => {
        console.log(`[Console__disconnectHandler] disconnected; // deviceid=${id}`)
        setConnectionState(DISCONNECTED);
        ble.removeAllListeners();
    }

    const charHandler = (value: any) => {
        if (onReceived) {
            console.log('sending it', value);
            onReceived(value);
        }
    }

    const connectViaBLE = async () => {
        setConnectionState(CONNECTING);

        if (await ble.connectById(peripheralId)) {
            ble.addListener('receive', (char) => charHandler(char));
            ble.addListener('disconnected', disconnectHandler);
            setConnectionState(CONNECTED);
            setDeviceInRange(true);

            for(let charId of subscriptions!){
                let success = await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, charId);    
                if (!success) setErrorMessage('Could not listen for notifications.'); else console.log('blesubscribe=console;')
            }
        }
        else {
            setDeviceInRange(false);
        }
    }

    const connectToDevice = async () => {
        setDeviceInRange(false);

        if (await PermissionsHelper.hasBLEPermissions())
            connectViaBLE();
    }

    useEffect(() => {
        if (initialCall) {
            connectToDevice();
            setInitialCall(false);
        }
        const focusSubscription = navigation.addListener('focus', () => {
            if (connectionState == DISCONNECTED_PAGE_SUSPENDED) {
                setDeviceInRange(false);
                connectToDevice();
            }
        });

        const blurSubscription = navigation.addListener('beforeRemove', async () => {
            if (connectionState == CONNECTING) {
                ble.cancelConnect();
            }
            else if (connectionState == CONNECTED) {
                ble.removeAllListeners();
                for(let charId of subscriptions!){
                    await ble.stopListeningForNotifications(peripheralId!, SVC_UUID_NUVIOT, charId);
                }

                await ble.disconnectById(peripheralId!);
            }
        });

        return (() => {
            focusSubscription();
            blurSubscription();
        });
    }, [deviceInRange, connectionState]);

    return <View>
        <Text style={contentStyle}>
            Connected
        </Text>
        <Text style={contentStyle}>
            {connectionState}
        </Text>
    </View>
}