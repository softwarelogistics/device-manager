import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, ActivityIndicator, TextInput, TextStyle, ViewStyle } from "react-native";

import AppServices from "../services/app-services";
import { SimulatedData } from "../services/simulatedData";

import Icon from "react-native-vector-icons/Ionicons";
import fontSizes from "../styles.fontSizes";

import styles from '../styles';
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { RemoteDeviceState } from "../models/blemodels/state";
import { SysConfig } from "../models/blemodels/sysconfig";
import { IOValues } from "../models/blemodels/iovalues";
import { ThemePalette } from "../styles.palette.theme";
import ViewStylesHelper from "../utils/viewStylesHelper";
import palettes from "../styles.palettes";
import colors from "../styles.colors";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

let simData = new SimulatedData();

export const DevicePage = ({ props, navigation, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);

  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<number>(IDLE);
  const [sysConfig, setSysConfig] = useState<SysConfig>();
  const [isBusy, setIsBusy] = useState<boolean>(true);


  const peripheralId = route.params.id;

  const headerStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellNavColor, fontSize: 24, fontWeight: '700', textAlign: 'left' }]);
  const chevronBarVerticalStyle: ViewStyle = ViewStylesHelper.combineViewStyles([{ height: 39 }]);
  const chevronBarColorTick: ViewStyle = ViewStylesHelper.combineViewStyles([chevronBarVerticalStyle, { width: 8 }]);
  const barGreyChevronRightStyle: TextStyle = ViewStylesHelper.combineTextStyles([chevronBarVerticalStyle, { backgroundColor: palettes.gray.v20, fontSize: 18, paddingLeft: 4, paddingRight: 4, width: '98%', textAlignVertical: 'center' }]);
  const barGreyChevronRightLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ fontWeight: '700' }]);
  const labelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);

  const charHandler = (value: any) => {
    if (value.characteristic == CHAR_UUID_STATE) {
      console.log(value.value);
      let rds = new RemoteDeviceState(value.value);
      setRemoteDeviceState(rds);
    }

    if (value.characteristic == CHAR_UUID_IO_VALUE) {
      console.log(value.value);
      let values = new IOValues(value.value);
      setSensorValues(values);
      console.log('hi');
      console.log(values.ioValues);
    }
  }

  const disconnectHandler = (id: string) => {
    setConnectionState(DISCONNECTED);
    setRemoteDeviceState(undefined);
    setSensorValues(undefined);

    ble.removeAllListeners('receive');
    ble.removeAllListeners('disconnected');
    ble.unsubscribe();
  }

  const showConfigurePage = async () => {
    if (connectionState == CONNECTED) {
      ble.removeAllListeners('receive');
      ble.removeAllListeners('disconnected');
      ble.unsubscribe();
      await ble.disconnectById(peripheralId);
      setConnectionState(DISCONNECTED_PAGE_SUSPENDED);
    }

    navigation.navigate('configureDevice', { id: peripheralId, repoId: deviceDetail?.deviceRepository.id, deviceId: deviceDetail?.id });
  }

  const loadDevice = async () => {
    if (ble.simulatedBLE()) {
      setConnectionState(CONNECTED);
      setIsBusy(false);
      setSysConfig(simData.getSysConfig());
      setRemoteDeviceState(simData.getRemoteDeviceState());


      setDeviceDetail(simData.getDeviceDetail());
      setSensorValues(simData.getSensorValues());
      return;
    }

    setConnectionState(CONNECTING);

    if (await ble.connectById(peripheralId, CHAR_UUID_SYS_CONFIG)) {
      setConnectionState(CONNECTED);
      await ble.subscribe(ble);

      let sysConfigStr = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
      if (sysConfigStr) {
        let sysConfig = new SysConfig(sysConfigStr);
        setSysConfig(sysConfig);

        let device = await appServices.deviceServices.getDevice(sysConfig.repoId, sysConfig.id);
        setDeviceDetail(device);
      }

      await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);

      ble.removeAllListeners('receive');
      ble.removeAllListeners('disconnected');

      ble.addListener('receive', charHandler);
      ble.addListener('disconnected', disconnectHandler);
    }
  }

  useEffect(() => {
    if (initialCall) {
      appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) });
      appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) });

      setThemePalette(AppServices.getAppTheme());
    
      loadDevice();
      setInitialCall(false);
    }

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
        ble.unsubscribe();
        await ble.disconnectById(peripheralId);
      }
    });

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={showConfigurePage} name='ios-settings-sharp' />
        </View>),
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  });

  React.useLayoutEffect(() => {

  });

  const sectionHeader = (sectionHeader: string) => {
    return (<View>
      <Text style={headerStyle}>{sectionHeader}</Text>
    </View>)
  }

  const panelDetail = (color: string, label: string, value: string | null | undefined) => {
    return (
      remoteDeviceState &&
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
    return <View style={[{ flex: 1,  margin: 2, justifyContent: 'center', }]}>
      {status &&
        <View style={{backgroundColor: color,  borderRadius: 8}}>
          <Text  style={{ fontSize:20, textAlign: "center", color: 'white' }}>{label}</Text>
          <View >
            <Icon style={{ textAlign: 'center', }} size={64} color="white" onPress={showConfigurePage} name={icon} />
          </View>
          <Text style={{ textAlign: "center", color: 'white' }}>Connected</Text>
        </View>
      }
      {!status &&
        <View style={{backgroundColor: '#e0e0e0', borderRadius: 8}}>
          <Text style={{ fontSize:20, textAlign: "center", color: 'black' }}>{label}</Text>
          <View >
            <Icon style={{ textAlign: 'center', }} size={64} color="gray" onPress={showConfigurePage} name={icon} />
          </View>
          <Text style={{ textAlign: "center", fontWeight:'500', color: 'black' }}>Not Connected</Text>
        </View>
      }
    </View>
  }

  const sensorBlock = (idx: number, value: any, icon: string) => {
    return (
      <View style={[{ flex: 1, width:100, backgroundColor: value ?  'green': '#d0d0d0', margin: 5, justifyContent: 'center', borderRadius: 8 }]}>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: value ?  'white' : 'black' }}>Sensor {idx + 1}</Text>
        <View >
          <Icon style={{ textAlign: 'center', color: value ? 'white' : '#a0a0a0' }} size={64}  onPress={showConfigurePage} name={icon} />
        </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: value ? 'white' : '#d0d0d0' }}>{value ?? '-'}</Text>
      </View>)
  }

  return <View style={[styles.container, { backgroundColor: themePalette.background }]}>
    {
      isBusy &&
      <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Retrieving Device</Text>
        <ActivityIndicator size="large" color={colors.accentColor} animating={isBusy} />
      </View>
    }

    {
      !isBusy &&
      <ScrollView style={styles.scrollContainer}>
        <StatusBar style="auto" />
        {
          connectionState == CONNECTED &&
          <View style={{marginBottom:30}}>
            {
              deviceDetail &&
              <View>
                {sectionHeader('Device Info and Connectivity')}
                {panelDetail('purple', 'Device Name', deviceDetail?.name)}
                {panelDetail('purple', 'Repository', deviceDetail.deviceRepository.text)}
                {panelDetail('purple', deviceDetail.deviceTypeLabel, deviceDetail.deviceType.text)}
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
              remoteDeviceState &&
              <View style={{ marginTop: 20 }}>
                {sectionHeader('Current Device Status')}
                {panelDetail('green', 'Firmware SKU', remoteDeviceState.firmwareSku)}
                {panelDetail('green', 'Firmware Rev', remoteDeviceState.firmwareRevision)}
                {panelDetail('green', 'Commissioned', remoteDeviceState.commissioned ? 'Yes' : 'No')}
              </View>
            }
            {
              sensorValues &&
              <View style={{ marginTop: 20 }}>
                {sectionHeader('Live Sensor Data')}
                <Text style={labelStyle}>ADC Sensors</Text>
                <ScrollView horizontal={true}>                  
                  {sensorBlock(0, sensorValues.adcValues[0],'radio-outline')}
                  {sensorBlock(1, sensorValues.adcValues[1],'radio-outline')}
                  {sensorBlock(2, sensorValues.adcValues[2],'radio-outline')}
                  {sensorBlock(3, sensorValues.adcValues[3],'radio-outline')}
                  {sensorBlock(4, sensorValues.adcValues[4],'radio-outline')}
                  {sensorBlock(5, sensorValues.adcValues[5],'radio-outline')}
                  {sensorBlock(6, sensorValues.adcValues[6],'radio-outline')}
                  {sensorBlock(7, sensorValues.adcValues[7],'radio-outline')}
                </ScrollView>
                <Text style={ labelStyle }>IO Sensors</Text>
                <ScrollView horizontal={true}>                  
                  {sensorBlock(0, sensorValues.ioValues[0],'radio-outline')}
                  {sensorBlock(1, sensorValues.ioValues[1],'radio-outline')}
                  {sensorBlock(2, sensorValues.ioValues[2],'radio-outline')}
                  {sensorBlock(3, sensorValues.ioValues[3],'radio-outline')}
                  {sensorBlock(4, sensorValues.ioValues[4],'radio-outline')}
                  {sensorBlock(5, sensorValues.ioValues[5],'radio-outline')}
                  {sensorBlock(6, sensorValues.ioValues[6],'radio-outline')}
                  {sensorBlock(7, sensorValues.ioValues[7],'radio-outline')}
                </ScrollView>
              

              </View>

            }
          </View>
        }
        {
          connectionState == CONNECTING &&
          <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
            <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Connecting to BLE</Text>
            <ActivityIndicator size="large" color={colors.accentColor} animating={isBusy} />
          </View>
          }
        {
          connectionState == DISCONNECTED &&
          <View>
            <Text style={{ color: themePalette.shellTextColor }}>Disconnected</Text>
            <TouchableOpacity style={[styles.submitButton]} onPress={() => loadDevice()}>
              <Text style={[styles.submitButtonText, { color: 'white' }]}> Re-Connect </Text>
            </TouchableOpacity>
          </View>
        }
        {
          connectionState == IDLE &&
          <Text style={{ color: themePalette.shellTextColor }}>Please wait</Text>
        }
        {
          connectionState == DISCONNECTED_PAGE_SUSPENDED &&
          <Text style={{ color: themePalette.shellTextColor }}>Please Wait Reconnecting</Text>
        }
      </ScrollView>
    }
  </View>

}