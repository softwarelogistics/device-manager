import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View, Text, TextStyle, TouchableOpacity, ScrollView, ViewStyle } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import styles from '../styles';
import palettes from "../styles.palettes";
import ViewStylesHelper from "../utils/viewStylesHelper";
import fontSizes from "../styles.fontSizes";
import Icon from "react-native-vector-icons/Ionicons";
import { PermissionsHelper } from "../services/ble-permissions";
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_CONSOLE, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { BLENuvIoTDevice } from "../models/device/device-local";
import { StatusBar } from "expo-status-bar";
import { RemoteDeviceState } from "../models/blemodels/state";
import Page from "../mobile-ui-common/page";
import { IOValues } from "../models/blemodels/iovalues";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export const ConsolePage = ({ props, navigation, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
  const [hasMacAddress, setHasMacAddress] = useState<boolean>(false);
  const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
  const [deviceInRange, setDeviceInRange] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<number>(IDLE);
  
  const peripheralId = route.params.peripheralId;

  const headerStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellNavColor, fontSize: 24, fontWeight: '700', textAlign: 'left' }]);
  const chevronBarVerticalStyle: ViewStyle = ViewStylesHelper.combineViewStyles([{ height: 39 }]);
  const chevronBarColorTick: ViewStyle = ViewStylesHelper.combineViewStyles([chevronBarVerticalStyle, { width: 8 }]);
  const barGreyChevronRightStyle: TextStyle = ViewStylesHelper.combineTextStyles([chevronBarVerticalStyle, { backgroundColor: palettes.gray.v20, fontSize: 18, paddingLeft: 4, paddingRight: 4, width: '98%', textAlignVertical: 'center' }]);
  const barGreyChevronRightLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ fontWeight: '700' }]);
  const labelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);
  const contentStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.mediumSmall, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);


  const charHandler = (value: any) => {
    console.log('char handler');
    if (value.characteristic == CHAR_UUID_CONSOLE) {
      console.log(value.value);
    }
  }

  const checkPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 23) {
        if (!await PermissionsHelper.requestLocationPermissions())
          return false;
      }

      return await PermissionsHelper.requestBLEPermission();
    }
    else {
      return true;
    }
  }

  const disconnectHandler = (id: string) => {
    console.log(`device=disconnected; // deviceid= ${id}`)

    setConnectionState(DISCONNECTED);
    setRemoteDeviceState(undefined);

    ble.removeAllListeners('receive');
    ble.removeAllListeners('disconnected');
  }

  const tryConnectViaAndroid = async (device: Devices.DeviceDetail) => {
    if (device!.macAddress && device.macAddress.length > 0) {
      setHasMacAddress(true);
      

      console.log('android path', device!.macAddress);

      if (await ble.isConnected(device!.macAddress)) {
        ble.addListener('receive', charHandler);
        ble.addListener('disconnected', disconnectHandler);
        setDeviceInRange(true);
        setConnectionState(CONNECTED);

        console.log('blesubscribing=console; // already connected.');
      }
      else {
        setConnectionState(CONNECTING);

        if (await ble.connectById(device!.macAddress)) {
          ble.addListener('receive', charHandler);
          ble.addListener('disconnected', disconnectHandler);
          setDeviceInRange(true);
          setConnectionState(CONNECTED);

          console.log('blesubscribing=console;')
          let success = await ble.listenForNotifications(device!.macAddress, SVC_UUID_NUVIOT, CHAR_UUID_CONSOLE);
          if (!success) setErrorMessage('Could not listen for notifications.'); else console.log('blesubscribe=console;')
        }
        else {
          setDeviceInRange(false);
          setRemoteDeviceState(undefined);
        }
      }
    }
  }

  const connectViaBLE = async () => {
      if (await ble.isConnected(peripheralId)) {
        ble.addListener('receive', charHandler);
        ble.addListener('disconnected', disconnectHandler);
        setDeviceInRange(true);
        setConnectionState(CONNECTED);

        let success = await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_CONSOLE);
        if (!success) setErrorMessage('Could not listen for notifications.'); else console.log('blesubscribe=console;')
    }
      else {
        if (await ble.connectById(peripheralId)) {
          ble.addListener('receive', charHandler);
          ble.addListener('disconnected', disconnectHandler);
          setConnectionState(CONNECTED);
          setDeviceInRange(true);

          let success = await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_CONSOLE);
          if (!success) setErrorMessage('Could not listen for notifications.'); else console.log('blesubscribe=console;')
  
        }
        else {
          setDeviceInRange(false);
        }
      }
    }
  

  const connectToDevice = async () => {
    setHasMacAddress(false);
    setDeviceInRange(false);

    let hasPermissions = await checkPermissions();
    if (hasPermissions) {     
        connectViaBLE();
    }
    else {
      console.log('does not have permissions.');
    }
  }
  
  useEffect(() => {
    if (initialCall) {
      connectToDevice();
      setInitialCall(false);
      ble.peripherals = [];
    }

    let palette = AppServices.getAppTheme()
    setThemePalette(palette);

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
        </View>),
    });

    const focusSubscription = navigation.addListener('focus', () => {
      if (connectionState == DISCONNECTED_PAGE_SUSPENDED) {
        setRemoteDeviceState(undefined);
        setDeviceInRange(false);
        connectToDevice();
      }
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      console.log('before remove called CS=> ', connectionState);
      if (connectionState == CONNECTING) {
        ble.cancelConnect();
      }
      else if (connectionState == CONNECTED) {
        console.log('DevicePage_BeforeRemove - ', peripheralId);
        ble.removeAllListeners('receive');
        ble.removeAllListeners('disconnected');
        ble.stopListeningForNotifications(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_CONSOLE);

        await ble.disconnectById(peripheralId!);
      }

      appServices.wssService.close();
    });

    return (() => {
      console.log('return was called');

      focusSubscription();
      blurSubscription();
    });
  }, [deviceInRange, connectionState]);


  const sectionHeader = (sectionHeader: string) => {
    return (<View>
      <Text style={headerStyle}>{sectionHeader}</Text>
    </View>)
  }


  return <Page style={[styles.container]}>
    <ScrollView style={styles.scrollContainer}>
      <StatusBar style="auto" />
      {
       <View>
        </View>
      }
    </ScrollView>
  </Page>
}