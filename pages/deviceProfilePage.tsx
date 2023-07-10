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
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { BLENuvIoTDevice } from "../models/device/device-local";
import { StatusBar } from "expo-status-bar";
import { RemoteDeviceState } from "../models/blemodels/state";
import Page from "../mobile-ui-common/page";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export const DeviceProfilePage = ({ props, navigation, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
  const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
  const [deviceInRange, setDeviceInRange] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<number>(IDLE);
  const [peripheralId, setPeripheralId] = useState<string | undefined>(undefined);

  const repoId = route.params.repoId;
  const id = route.params.id;

  const headerStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellNavColor, fontSize: 24, fontWeight: '700', textAlign: 'left' }]);
  const chevronBarVerticalStyle: ViewStyle = ViewStylesHelper.combineViewStyles([{ height: 39 }]);
  const chevronBarColorTick: ViewStyle = ViewStylesHelper.combineViewStyles([chevronBarVerticalStyle, { width: 8 }]);
  const barGreyChevronRightStyle: TextStyle = ViewStylesHelper.combineTextStyles([chevronBarVerticalStyle, { backgroundColor: palettes.gray.v20, fontSize: 18, paddingLeft: 4, paddingRight: 4, width: '98%', textAlignVertical: 'center' }]);
  const barGreyChevronRightLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ fontWeight: '700' }]);
  const labelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);

  const loadDevice = async () => {
    let fullDevice = await appServices.deviceServices.getDevice(repoId, id);
    if(fullDevice) {
      setDeviceDetail(fullDevice);
      

      //await appServices.wssService.init('device', fullDevice.id);
      appServices.wssService.onmessage = (e) => {
        let json = e.data;
        let wssMessage = JSON.parse(json);
        let wssPayload = wssMessage.payloadJSON;
        let device = JSON.parse(wssPayload) as Devices.DeviceForNotification;

        if (device) {
          fullDevice!.sensorCollection = device.sensorCollection;
          fullDevice!.lastContact = device.lastContact;
          setDeviceDetail(fullDevice);
        }
      }
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

  const connectToDevice = async (device: Devices.DeviceDetail) => {
    setDevices([]);

    console.log('attempt to connect to device ' + device.deviceId);

    let hasPermissions = await checkPermissions();
    if (hasPermissions) {
      if (device!.macAddress) {
        setPeripheralId(device!.macAddress);
        if (await ble.connectById(device!.macAddress)) {
          console.log('connected - android');
          await ble.disconnectById(device!.macAddress)
          setPeripheralId(device!.macAddress);
          setDeviceInRange(true);
        }
        else {
          setDeviceInRange(false);
        }
      }

      if (device!.iosBLEAddress) {
        setPeripheralId(device!.iosBLEAddress);
        if (await ble.connectById(device!.iosBLEAddress)) {
          console.log('connected - ios');
          setPeripheralId(device!.iosBLEAddress);
          await ble.disconnectById(device!.iosBLEAddress);
          setDeviceInRange(true);
        }
        else {
          setDeviceInRange(false);
        }
      }
    }
    else {
      console.log('does not have permissions.');
    }
  }

  const showConfigurePage = async () => {
    if (connectionState == CONNECTED) {
      console.log('was connected...');
      ble.removeAllListeners('receive');
      ble.removeAllListeners('disconnected');
      let peripheralId = Platform.OS == 'ios' ? deviceDetail.iosBLEAddress : deviceDetail.macAddress;
      await ble.disconnectById(peripheralId);
      setConnectionState(DISCONNECTED_PAGE_SUSPENDED);
    }

    appServices.wssService.close();
    let params = { peripheralId: peripheralId, repoId: repoId, deviceId: id }
    console.log('launch config page')
    console.log(params);

    navigation.navigate('configureDevice', params);
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
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={palette.shellNavColor} onPress={(() => showConfigurePage())} name='ios-settings-sharp' />
        </View>),
    });

    const focusSubscription = navigation.addListener('focus', () => {
      if (connectionState == DISCONNECTED_PAGE_SUSPENDED) {
        loadDevice();
      }
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      if (connectionState == CONNECTING) {
        ble.cancelConnect();
      }
      else if (connectionState == CONNECTED) {
        console.log('DevicePage_BeforeRemove.');
        ble.removeAllListeners('receive');
        ble.removeAllListeners('disconnected');
        await ble.disconnectById(peripheralId!);
      }

      appServices.wssService.close();
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  }, []);


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
    if(sensorIndex > 8) sensorIndex -= 8;

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
        deviceDetail && !errorMessage &&

        <View >
          {
            deviceDetail &&
            <View>
              {sectionHeader('Device Info and Connectivity')}
              {panelDetail('purple', 'Device Name', deviceDetail?.name)}
              {panelDetail('purple', 'Repository', deviceDetail.deviceRepository.text)}
              {panelDetail('purple', deviceDetail.deviceTypeLabel, deviceDetail.deviceType.text)}
              {panelDetail('purple', 'Last Contact', deviceDetail.lastContact)}
            </View>
          }
          {
            deviceInRange &&
            <View>
              <Text>In Range</Text>
            </View>
          }
          {
            remoteDeviceState &&
            <View style={{ marginTop: 20 }}>
              {sectionHeader('Current Device Status')}
              {panelDetail('green', 'Firmware SKU', deviceDetail.actualFirmware)}
              {panelDetail('green', 'Firmware Rev', deviceDetail.actualFirmwareRevision)}
              {panelDetail('green', 'Commissioned', deviceDetail.commissioned ? 'Yes' : 'No')}
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
            deviceDetail.sensorCollection &&
            <View style={{ marginTop: 20, marginBottom:20 }}>
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

      }
    </ScrollView>
  </Page>
}