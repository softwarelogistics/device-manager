import { useEffect, useState, useRef } from "react";
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
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { BLENuvIoTDevice } from "../models/device/device-local";
import { StatusBar } from "expo-status-bar";
import { RemoteDeviceState } from "../models/blemodels/state";
import Page from "../mobile-ui-common/page";
import { IOValues } from "../models/blemodels/iovalues";
import Moment from 'moment';

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;


interface ConsoleOutput {
  timestamp: string;
  message: string;
}

export const DeviceProfilePage = ({ props, navigation, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined | null>(undefined);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
  const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
  const [hasMacAddress, setHasMacAddress] = useState<boolean>(false);
  const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
  const [deviceInRange, setDeviceInRange] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<number>(IDLE);
  const [peripheralId, setPeripheralId] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  const stateRef = useRef();

  stateRef.current = deviceDetail

  const repoId = route.params.repoId;
  const id = route.params.id;

  const headerStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellNavColor, fontSize: 24, fontWeight: '700', textAlign: 'left' }]);
  const chevronBarVerticalStyle: ViewStyle = ViewStylesHelper.combineViewStyles([{ height: 39 }]);
  const chevronBarColorTick: ViewStyle = ViewStylesHelper.combineViewStyles([chevronBarVerticalStyle, { width: 8 }]);
  const barGreyChevronRightStyle: TextStyle = ViewStylesHelper.combineTextStyles([chevronBarVerticalStyle, { backgroundColor: palettes.gray.v20, fontSize: 18, paddingLeft: 4, paddingRight: 4, width: '98%', textAlignVertical: 'center' }]);
  const barGreyChevronRightLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ fontWeight: '700' }]);
  const labelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);
  const contentStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.mediumSmall, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);

  const loadDevice = async () => {
    let fullDevice = await appServices.deviceServices.getDevice(repoId, id);    
    if (fullDevice) {
      await appServices.wssService.init('device', fullDevice.id);
      setDeviceDetail(fullDevice);
      await connectToDevice(fullDevice);
      
      appServices.wssService.onmessage = (e) => {
        let json = e.data;
        let wssMessage = JSON.parse(json);
        let wssPayload = wssMessage.payloadJSON;
        let device = JSON.parse(wssPayload) as Devices.DeviceForNotification;

        if (fullDevice) {
          fullDevice.sensorCollection = device.sensorCollection;
        }
      }
    }
    else {
      console.error("[DeviceProfilePage__loadDevice] - Could Not Load Device");
      setErrorMessage('Sorry - Could Not Load Device.');
    }
  }

  /*const handleDeviceUpdate = (update: Devices.DeviceForNotification) => {
    fullDevice!.sensorCollection = update.sensorCollection;
    fullDevice!.lastContact = update.lastContact;
    console.log('wss update:' + update.lastContact);
    setDeviceDetail(fullDevice);
  }*/

  const charHandler = async (value: any, device: Devices.DeviceDetail) => {
    if (value.characteristic == CHAR_UUID_STATE) {
      console.log(value.value);
      let rds = new RemoteDeviceState(value.value);

      setRemoteDeviceState(rds);
    }

    if (value.characteristic == CHAR_UUID_IO_VALUE) {
      console.log(value);

      let values = new IOValues(value.value);
      for (let i = 0; i < values.ioValues.length; i++) {
        let value = values.ioValues[i];
        if (value) {
          console.log(i, value);
        }
      }

      for (let i = 0; i < values.adcValues.length; i++) {
        let value = values.adcValues[i];
        if (value !== undefined) {
          device.sensorCollection![i].value = value.toString();
        }
      }
      setSensorValues(values);
      setLastUpdated(new Date());
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
    setRemoteDeviceState(null);

    ble.removeAllListeners();
  }

  const tryConnect = async (device: Devices.DeviceDetail, peripheralId: string) => {
    if (peripheralId?.length > 0) {
      setHasMacAddress(true);
      setPeripheralId(device!.macAddress);

      setConnectionState(CONNECTING);

      if (await ble.connectById(peripheralId)) {
        ble.addListener('receive', (char) => charHandler(char, device));
        ble.addListener('disconnected', disconnectHandler);

        setDeviceInRange(true);
        setConnectionState(CONNECTED);

        let success = await ble.listenForNotifications(device!.macAddress, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
        if (!success) setErrorMessage('Could not listen for notifications.');
        success = await ble.listenForNotifications(device!.macAddress, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
        if (!success) setErrorMessage('Could not listen for notifications.');
      }
      else {
        setDeviceInRange(false);
        setRemoteDeviceState(undefined);
      }
    }
  }

  const connectToDevice = async (device: Devices.DeviceDetail) => {
    setDevices([]);

    setHasMacAddress(false);
    setPeripheralId(undefined);
    setDeviceInRange(false);

    let hasPermissions = await checkPermissions();
    if (hasPermissions) {
      if (Platform.OS === 'ios')
        await tryConnect(device, device.iosBLEAddress);
      else if (Platform.OS == 'android')
        await tryConnect(device, device.macAddress);
    }
    else {
      console.log('does not have permissions.');
    }
  }

  const showPage = async (pageName: String) => {
    ble.removeAllListeners();
    let peripheralId = Platform.OS == 'ios' ? deviceDetail.iosBLEAddress : deviceDetail.macAddress;
    if(connectionState == CONNECTED) {
      await ble.stopListeningForNotifications(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      await ble.stopListeningForNotifications(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
      await ble.disconnectById(peripheralId);
      setConnectionState(DISCONNECTED_PAGE_SUSPENDED);
    }

    appServices.wssService.close();
    let params = { peripheralId: peripheralId, repoId: repoId, deviceId: id }
    navigation.navigate(pageName, params);
  }

  const showConfigurePage = async () => {
    if (connectionState == CONNECTED) {
      await showPage('configureDevice');      
    }
    else {
      alert('You must be connected to your device via Bluetooth to Remotely Configure device.');
    }
  }

  const showScanPage = async () => {
    await showPage('associatePage');
  }

  useEffect(() => {
    if (initialCall) {
      loadDevice();
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
        loadDevice();
      }
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      if (connectionState == CONNECTING) {
        ble.cancelConnect();
      }
      else if (connectionState == CONNECTED) {
        ble.removeAllListeners();
        await ble.stopListeningForNotifications(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
        await ble.stopListeningForNotifications(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
        await ble.disconnectById(peripheralId!);
      }

      appServices.wssService.close();
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  }, [deviceInRange, connectionState]);


  const sectionHeader = (sectionHeader: string) => {
    return (<View>
      <Text style={headerStyle}>{sectionHeader}</Text>
    </View>)
  }

  const panelDetail = (color: string, label: string, value: string | null | undefined) => {
    return (
      deviceDetail &&
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

  const connectionBlock = (color: string, icon: string, label: string, status: boolean) => {
    return <View style={[{ flex: 1, margin: 2, justifyContent: 'center', }]}>
      {status &&
        <View style={{ backgroundColor: color, borderRadius: 8 }}>
          <Text style={{ fontSize: 20, textAlign: "center", color: 'white' }}>{label}</Text>
          <View >
            <Icon style={{ textAlign: 'center', }} size={64} color="white" onPress={showConfigurePage} name={icon} />
          </View>
          <Text style={{ textAlign: "center", color: 'white' }}>Connected</Text>
        </View>
      }
      {!status &&
        <View style={{ backgroundColor: '#e0e0e0', borderRadius: 8 }}>
          <Text style={{ fontSize: 20, textAlign: "center", color: 'black' }}>{label}</Text>
          <View >
            <Icon style={{ textAlign: 'center', }} size={64} color="gray" onPress={showConfigurePage} name={icon} />
          </View>
          <Text style={{ textAlign: "center", fontWeight: '500', color: 'black' }}>Not Connected</Text>
        </View>
      }
    </View>
  }

  const sensorBlock = (idx: number, sensors: Devices.Sensor[], icon: string) => {
    let sensor = sensors.find(snsr => snsr.portIndex == idx);

    let sensorIndex = idx + 1;
    if (sensorIndex > 8) sensorIndex -= 8;

    let sensorName = sensor?.name ?? `Sensor ${sensorIndex}`;

    return (
      <View style={[{ flex: 1, width: 100, backgroundColor: sensor ? 'green' : '#d0d0d0', margin: 5, justifyContent: 'center', borderRadius: 8 }]}>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: sensor ? 'white' : 'black' }}>{sensorName}</Text>
        <View >
          <Icon style={{ textAlign: 'center', color: sensor ? 'white' : '#a0a0a0' }} size={64} onPress={showConfigurePage} name={icon} />
        </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: sensor ? 'white' : '#d0d0d0' }}>{sensor?.value ?? '-'}</Text>
      </View>)
  }

  return <Page style={[styles.container]}>
    <ScrollView style={styles.scrollContainer}>
      <StatusBar style="auto" />
      {
        <View>
          {
            errorMessage &&
            <View>
              <Text style={contentStyle}>{errorMessage}</Text>
            </View>
          }
          <View >

            {
              deviceDetail &&
              <View>
                {sectionHeader('Device Info and Connectivity')}
                {panelDetail('purple', deviceDetail.deviceNameLabel, deviceDetail?.name)}
                {panelDetail('purple', deviceDetail.deviceIdLabel, deviceDetail?.deviceId)}
                {panelDetail('purple', deviceDetail.deviceTypeLabel, deviceDetail.deviceType.text)}
                {panelDetail('purple', 'Repository', deviceDetail.deviceRepository.text)}
                {panelDetail('purple', 'Last Contact', deviceDetail.lastContact)}
              </View>
            }
            {
              !remoteDeviceState &&
              <View>
                {panelDetail('purple', "Firmware SKU", deviceDetail?.actualFirmware)}
                {panelDetail('purple', "FIrmware Rev", deviceDetail?.actualFirmwareRevision)}
              </View>
            }
            {
              deviceInRange &&
              <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
                <Text style={labelStyle}>Local Device Connected</Text>
                <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={(() => showConfigurePage())} name='ios-settings-sharp' />
              </View>
            }
            {
              deviceDetail && !deviceInRange &&
              <View>
                <Text style={labelStyle}>Not Connected</Text>
                {
                  hasMacAddress == false &&
                  <View>
                    <Text style={contentStyle}>Device is not associated on this platform.</Text>
                    <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
                      <Text style={contentStyle}>Please scan and associate. {hasMacAddress}</Text>
                      <Icon.Button size={18} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={(() => showScanPage())} name='ios-settings-sharp' />
                    </View>
                  </View>
                }
                {
                  hasMacAddress == true &&
                  <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
                    <Text style={contentStyle}>Hardware has been associated</Text>
                    <Icon style={{ textAlign: 'center', }} size={18} color="white" onPress={() => showScanPage()} name='bluetooth-outline' />
                  </View>
                }
              </View>
            }
            {
              remoteDeviceState &&
              <View style={{ marginTop: 20 }}>
                {sectionHeader('Current Device Status')}
                {panelDetail('green', 'Firmware SKU', remoteDeviceState.firmwareSku)}
                {panelDetail('green', 'Device Model', remoteDeviceState.deviceModelKey)}
                {panelDetail('green', 'Firmware Rev', remoteDeviceState.firmwareRevision)}
                {panelDetail('green', 'Hardware Rev', remoteDeviceState.hardwareRevision)}
                {panelDetail('green', 'Commissioned', remoteDeviceState.commissioned ? 'Yes' : 'No')}
                {panelDetail('green', 'Server Connection', remoteDeviceState.isCloudConnected ? 'Yes' : 'No')}
              </View>
            }
            {
              remoteDeviceState &&
              <View style={{ flexDirection: 'row', marginHorizontal: 8 }} >
                {connectionBlock('orange', 'wifi-outline', 'WiFi', remoteDeviceState.wifiStatus == 'Connected')}
                {connectionBlock('orange', 'cellular-outline', 'Cellular', remoteDeviceState.cellularConnected)}
                {connectionBlock('orange', 'bluetooth-outline', 'Bluetooth', true)}

              </View>
            }
            {
              deviceDetail && deviceDetail.sensorCollection &&
              <View style={{ marginTop: 20, marginBottom: 20 }}>
                {sectionHeader('Live Sensor Data')}
                <Text style={labelStyle}>ADC Sensors</Text>
                <ScrollView horizontal={true}>
                  {sensorBlock(8, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(9, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(10, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(11, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(12, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(13, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(14, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(15, deviceDetail.sensorCollection, 'radio-outline')}
                </ScrollView>
                <Text style={labelStyle}>IO Sensors</Text>
                <ScrollView horizontal={true}>
                  {sensorBlock(0, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(1, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(2, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(3, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(4, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(5, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(6, deviceDetail.sensorCollection, 'radio-outline')}
                  {sensorBlock(7, deviceDetail.sensorCollection, 'radio-outline')}
                </ScrollView>


              </View>
            }
          </View>
        </View>
      }
    </ScrollView>
  </Page>
}