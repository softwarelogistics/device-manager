import { Text, TextStyle, View, ViewStyle, FlatList, Pressable, Button, TextInput } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import ProgressSpinner from "../mobile-ui-common/progress-spinner";

import Page from "../mobile-ui-common/page";
import { IReactPageServices } from "../services/react-page-services";
import { useEffect, useState } from "react";
import styles from '../styles';
import AppServices from "../services/app-services";
import { SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, CHAR_UUID_WIFI_MSG } from '../NuvIoTBLE'
import ViewStylesHelper from "../utils/viewStylesHelper";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import { WiFiStatus } from "../models/blemodels/wifiStatus";
import { useInterval } from 'usehooks-ts'
import EditField from "../mobile-ui-common/edit-field";
import palettes from "../styles.palettes";
import { busyBlock } from "../mobile-ui-common/PanelDetail";
import { inputLabelStyle, inputStyleWithBottomMargin, placeholderTextColor } from "../compound.styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface wifiLogin {
    ssid: string;
    password: string;
}

export const WiFiTroubleShootingPage = ({ props, navigation, route }: IReactPageServices) => {

    const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
    const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
    const themePalette = AppServices.instance.getAppTheme();
    const [pageVisible, setPageVisible] = useState<boolean>(true);

    const [wifiStatus, setWiFiStatus] = useState<WiFiStatus | undefined>(undefined);

    const chevronBarVerticalStyle: ViewStyle = ViewStylesHelper.combineViewStyles([{ height: 39 }]);
    const chevronBarColorTick: ViewStyle = ViewStylesHelper.combineViewStyles([chevronBarVerticalStyle, { width: 8 }]);
    const barGreyChevronRightStyle: TextStyle = ViewStylesHelper.combineTextStyles([chevronBarVerticalStyle, { backgroundColor: palettes.gray.v20, fontSize: 18, paddingLeft: 4, paddingRight: 4, width: '98%', textAlignVertical: 'center' }]);
    const barGreyChevronRightLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ fontWeight: '700' }]);

    const [loginInfo, setLoginInfo] = useState<wifiLogin>({ ssid: '', password: '' });
   

    const [isBusy, setIsBusy] = useState<boolean>(false);

    const peripheralId = route.params.peripheralId;

    const charHandler = (value: any) => {
        var now = new Date();

        if (value.characteristic == CHAR_UUID_WIFI_MSG) {
            setLastUpdated(now);
            console.log(value.value, loginInfo.ssid, loginInfo.password);
            let status = new WiFiStatus(value.value);
            setWiFiStatus(status);
            if (!loginInfo.ssid)
                loginInfo.ssid = status.ssid;

            if (!loginInfo.password)
                loginInfo.password = status.password;
        }
    }

    const panelDetail = (color: string, label: string, value: string | null | undefined) => {
        return (
            isDeviceConnected &&
            <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
                <View style={[chevronBarColorTick, { backgroundColor: color, borderBottomLeftRadius: 6, borderTopLeftRadius: 6 }]}>
                    <Text> </Text>
                </View>
                <View style={[barGreyChevronRightStyle, { flexDirection: 'row', alignItems: 'center', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]}>
                    <Text style={[barGreyChevronRightLabelStyle, { flex: 1, textAlignVertical: 'center', fontSize: 16 }]}>{label}:</Text>
                    <Text style={{ flex: 2, textAlign: 'right', textAlignVertical: 'center', marginRight: 5, fontSize: 16 }}>{value}</Text>
                </View>
            </View>
        )
    }

    const performSiteScan = async () => {
        setIsBusy(true);
        await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, "siteScan=start;");
        setIsBusy(false);
    }

    useInterval(async () => {
        if (peripheralId && !isDeviceConnected) {
            setIsBusy(true);
            await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_WIFI_MSG], 1);
            setIsBusy(false);
        }
    }, pageVisible ? 6000 : null
    )


    const selectSSID = (ssid: string) => {
        console.log(ssid);
        loginInfo.ssid = ssid;
        loginInfo.password = '';
    }

    const updateConnection = async () => {
        console.log('update connection', loginInfo.ssid,loginInfo.password);
        setIsBusy(true);
        if (loginInfo.ssid) await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${loginInfo.ssid};`);
        if (loginInfo.password) await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${loginInfo.password};`);
        setIsBusy(false);
    }

    useEffect(() => {
        ConnectedDevice.onReceived = (e) => charHandler(e);
        ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
        ConnectedDevice.onDisconnected = () => setIsDeviceConnected(false);

        if (isDeviceConnected) {
            navigation.setOptions({
                headerRight: () => (
                    <View style={{ flexDirection: 'row' }} >
                        <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => updateConnection()} name='save' />
                        <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => performSiteScan()} name='refresh' />
                    </View>),
            });
        }
        else {
            navigation.setOptions({
                headerRight: () => (
                    <View style={{ flexDirection: 'row' }} >
                    </View>),
            });
        }

        const focusSubscription = navigation.addListener('focus', async () => {
            setPageVisible(true);
            await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_WIFI_MSG], 1)
        });

        const blurSubscription = navigation.addListener('beforeRemove', async () => {
            setPageVisible(false);
            if (isDeviceConnected)
                await ConnectedDevice.disconnect();
        });

        return (() => {
            focusSubscription();
            blurSubscription();
        });
    }, [isDeviceConnected]);


    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 25, textAlign: 'center', marginTop: 50, color: themePalette.shellTextColor }}>No Networks, press refresh to scan networks.</Text>
            </View>
        );
    };

    const userNameChanged = (e: string) => {
        console.log('new password', e);
        loginInfo.password = e;
        setLoginInfo(loginInfo);
    }

    const passwordChanged = (e: string) => {
        console.log('new password', e);
        loginInfo.password = e;
        setLoginInfo(loginInfo);
    }

    return (
        <Page style={[styles.container, { backgroundColor: themePalette.background, padding: 120 }]}>
            <KeyboardAwareScrollView >
                <View style={[styles.container, { backgroundColor: themePalette.background, padding: 20 }]}>
                    {(!wifiStatus || isBusy) && busyBlock("Please Wait") }
                    {!isDeviceConnected && !isBusy &&  busyBlock("Attempting to connect") } 
                    {!isBusy && isDeviceConnected && wifiStatus &&
                        <View>
                            <EditField onChangeText={(e)=> userNameChanged(e)} label="SSID" placeHolder="enter wifi ssid" value={loginInfo.ssid} />
                            <EditField onChangeText={(e) => passwordChanged(e)} label="Password" placeHolder="enter wifi password" value={loginInfo.password} />

                            {panelDetail('purple', "Connected", wifiStatus.connected ? 'Yes' : 'No')}
                            {wifiStatus.connected && panelDetail('purple', "RSSI", wifiStatus.rssi.toString())}
                            {panelDetail('purple', "Status", wifiStatus.status)}
                            {wifiStatus.connected && panelDetail('purple', "IP Addr", wifiStatus.ipAddress)}
                            {panelDetail('purple', "MAC Addr", wifiStatus.macAddress)}
                            {wifiStatus.connections.length == 0 && myListEmpty()}
                            {wifiStatus.connections.map((item,idx) =>
                                <Pressable onPress={() => selectSSID(item.ssid)} key={idx} >
                                    <View style={[styles.listRow, { padding: 10, marginBottom: 10, height: 40, backgroundColor: themePalette.shell }]}  >
                                        <View style={{ flexDirection: 'row', }} key={item.ssid}>
                                            <Text style={[{ color: themePalette.shellTextColor, flexGrow: 1, fontSize: 18 }]}>{item.ssid} ({item.rssi})</Text>
                                        </View>
                                    </View>
                                </Pressable>)
                            }
                        </View>
                    }
                </View>
            </KeyboardAwareScrollView>
        </Page>
    )
}