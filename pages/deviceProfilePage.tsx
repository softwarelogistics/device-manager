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
import { ConnectedDevice } from "../mobile-ui-common/connected-device";

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
  const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [peripheralId, setPeripheralId] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [timerId, setTimerId] = useState<number | undefined>(undefined);

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


  const charHandler = async (value: any, device: Devices.DeviceDetail) => {
    if (value.characteristic == CHAR_UUID_STATE) {
      let rds = new RemoteDeviceState(value.value);

      setRemoteDeviceState(rds);
    }

    if (value.characteristic == CHAR_UUID_IO_VALUE) {
      let values = new IOValues(value.value);
      for (let i = 0; i < values.ioValues.length; i++) {
        let value = values.ioValues[i];
        let sensor = device.sensorCollection.find(sns=>sns.portIndex == i && sns.technology.key == 'io');
        if(sensor) {
          if (value !== undefined) {
            sensor.value = value.toString();
          }
          else {
            sensor.value = '';
          }
        }
      }

      for (let i = 0; i < values.adcValues.length; i++) {
        let value = values.adcValues[i];
        let sensor = device.sensorCollection.find(sns=>sns.portIndex == i && sns.technology.key == 'adc');
        if(sensor) {
          if (value !== undefined) {
            sensor.value = value.toString();
          }
          else {
            sensor.value = '';
          }
        }
      }
      setSensorValues(values);
      setLastUpdated(new Date());
    }
  }

  const attemptConnect = async (peripheralId: string) => {
    console.log(`[DeviceProfilePage__attemptConnect] - Peripheral: ${peripheralId}.`);

    if(!await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_STATE, CHAR_UUID_IO_VALUE], 1)){
      console.log('[DeviceProfilePage__attemptConnect] - Could Not Connect; will retry.');
      setTimerId(window.setTimeout(attemptConnect, 2500, peripheralId));
    }
    else {
      console.log('[DeviceProfilePage__attemptConnect] - Could Not Connect; will retry.');
      setTimerId(undefined);
    }
  }


  const loadDevice = async () => {
    console.log('load fd');
    let fullDevice = await appServices.deviceServices.getDevice(repoId, id);    
    if (fullDevice) {
      await appServices.wssService.init('device', fullDevice.id);
      setDeviceDetail(fullDevice);

      let peripheralId: string | undefined;
      if(Platform.OS == 'ios')
        peripheralId = fullDevice.iosBLEAddress;
      else if(Platform.OS == 'android')
        peripheralId = fullDevice.macAddress;

      setPeripheralId(peripheralId);

      if(peripheralId)  {
        ConnectedDevice.onReceived = (value) => charHandler(value, fullDevice!);
        ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
        ConnectedDevice.onDisconnected = () =>
          {
            setIsDeviceConnected(false);
            attemptConnect(peripheralId);   
          } 

        attemptConnect(peripheralId);   
      }
                
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


  const showPage = async (pageName: String) => {
    ble.removeAllListeners();
    console.log(deviceDetail);
    let peripheralId = Platform.OS == 'ios' ? deviceDetail.iosBLEAddress : deviceDetail.macAddress;
    await ConnectedDevice.disconnect();
    appServices.wssService.close();
    let params = { peripheralId: peripheralId, repoId: repoId, deviceId: id }
    navigation.navigate(pageName, params);
  }

  const showConfigurePage = async () => {
    if (isDeviceConnected) {
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
        loadDevice();
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      if(isDeviceConnected)
        await ConnectedDevice.disconnect();

      if(timerId) {
        clearTimeout(timerId);
        setTimerId(undefined);
      }

       appServices.wssService.close();
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  }, [isDeviceConnected]);

  const sectionHeader = (sectionHeader: string) => {
    return (<View>
      <Text style={headerStyle}>{sectionHeader}</Text>
    </View>)
  }

  const panelDetail = (color: string, label: string, value: string | null | undefined) => {
    return (
      deviceDetail &&
      <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between', }]}>
        <View style={[chevronBarColorTick, { backgroundColor: color, borderBottomLeftRadius: 6, borderTopLeftRadius: 6, marginRight:0 }]}>
          <Text> </Text>
        </View>
        <View style={[barGreyChevronRightStyle, { flexDirection: 'row', alignItems: 'center', borderTopRightRadius: 6, borderBottomRightRadius: 6, marginLeft:0 }]}>
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

  const ioSensorBlock = (idx: number, sensors: Devices.Sensor[], icon: string) => {
    
    let sensor = sensors.find(snsr => snsr.portIndex == (idx) && snsr.technology.key == 'io');    
  
    let sensorName = sensor?.name ?? `Sensor ${idx + 1}`;

    return (
      <View style={[{ flex: 1, width: 100, backgroundColor: sensor ? 'green' : '#d0d0d0', margin: 5, justifyContent: 'center', borderRadius: 8 }]}>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: sensor ? 'white' : 'black' }}>{sensorName}</Text>
        <View >
          <Icon style={{ textAlign: 'center', color: sensor ? 'white' : '#a0a0a0' }} size={64} onPress={showConfigurePage} name={icon} />
        </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: sensor ? 'white' : '#d0d0d0' }}>{sensor?.value ?? '-'}</Text>
      </View>)
  }

  const adcSensorBlock = (idx: number, sensors: Devices.Sensor[], icon: string) => {
    let sensor = sensors.find(snsr => snsr.portIndex == (idx) && snsr.technology.key == 'adc');    
  
    let sensorName = sensor?.name ?? `Sensor ${idx + 1}`;

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
              isDeviceConnected &&
              <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
                <Text style={labelStyle}>Local Device Connected</Text>
                <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={(() => showConfigurePage())} name='cog-outline' />
              </View>
            }
            {
              deviceDetail && !isDeviceConnected &&
              <View>
                <Text style={labelStyle}>Not Connected</Text>
                {
                  !peripheralId &&
                  <View>
                    <Text style={contentStyle}>Device is not associated on this platform.</Text>
                    <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
                      <Text style={contentStyle}>Please scan and associate.</Text>
                      <Icon.Button size={18} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={(() => showScanPage())} name='cog-outline' />
                    </View>
                  </View>
                }
                {
                  peripheralId &&
                  <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
                    <Text style={contentStyle}>Hardware has been associated</Text>
                    <Icon style={{ textAlign: 'center', }} size={18} color={themePalette.shellNavColor}  onPress={() => showScanPage()} name='bluetooth-outline' />
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
                  {adcSensorBlock(0, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(1, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(2, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(3, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(4, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(5, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(6, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(7, deviceDetail.sensorCollection, 'radio-outline')}
                </ScrollView>
                <Text style={labelStyle}>IO Sensors</Text>
                <ScrollView horizontal={true}>
                  {ioSensorBlock(0, deviceDetail.sensorCollection, 'radio-outline')}
                  {ioSensorBlock(1, deviceDetail.sensorCollection, 'radio-outline')}
                  {ioSensorBlock(2, deviceDetail.sensorCollection, 'radio-outline')}
                  {ioSensorBlock(3, deviceDetail.sensorCollection, 'radio-outline')}
                  {ioSensorBlock(4, deviceDetail.sensorCollection, 'radio-outline')}
                  {ioSensorBlock(5, deviceDetail.sensorCollection, 'radio-outline')}
                  {ioSensorBlock(6, deviceDetail.sensorCollection, 'radio-outline')}
                  {ioSensorBlock(7, deviceDetail.sensorCollection, 'radio-outline')}
                </ScrollView>


              </View>
            }
          </View>
        </View>
      }
    </ScrollView>
  </Page>
}