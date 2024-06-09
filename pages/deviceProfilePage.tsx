import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Platform, View, Text, TextStyle, TouchableOpacity, ScrollView, ViewStyle } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import styles from '../styles';
import palettes from "../styles.palettes";
import ViewStylesHelper from "../utils/viewStylesHelper";
import fontSizes from "../styles.fontSizes";
import Icon from "react-native-vector-icons/Ionicons";
import { useInterval } from 'usehooks-ts'
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { RemoteDeviceState } from "../models/blemodels/state";
import Page from "../mobile-ui-common/page";
import { IOValues } from "../models/blemodels/iovalues";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import colors from "../styles.colors";

interface ConsoleOutput {
  timestamp: string;
  message: string;
}

export const DeviceProfilePage = ({ props, navigation, route }: IReactPageServices) => {
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined | null>(undefined);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
  const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [peripheralId, setPeripheralId] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [timerId, setTimerId] = useState<number | undefined>(undefined);
  const [pageVisible, setPageVisible] = useState<boolean>(true);

  const stateRef = useRef();

  stateRef.current = deviceDetail

  const repoId = route.params.repoId;
  const id = route.params.id;

  const themePalette = AppServices.instance.getAppTheme();

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

  useInterval(async () => {
    if(peripheralId && !isDeviceConnected){
      await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_STATE, CHAR_UUID_IO_VALUE], 1)
        }
      }, pageVisible ? 6000 : null  
  )

  // const attemptConnect = async (peripheralId: string) => {
  //   console.log(`[DeviceProfilePage__attemptConnect] - Peripheral: ${peripheralId}.`);

  //   if(!await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_STATE, CHAR_UUID_IO_VALUE], 1)){
  //     console.log('[DeviceProfilePage__attemptConnect] - Could Not Connect; will retry.');
  //     let timerId = window.setTimeout(attemptConnect, 2500, peripheralId)
  //     setTimerId(timerId);
  //   }
  //   else {
  //     console.log('[DeviceProfilePage__attemptConnect] - Connected!; will retry.');
  //     setTimerId(undefined);
  //   }
  // }


  const handleWSMessage = (e: any) => {
    let json = e.data;
    let wssMessage = JSON.parse(json);
    let wssPayload = wssMessage.payloadJSON;
    let device = JSON.parse(wssPayload) as Devices.DeviceForNotification;

    console.log('got message');

    if (deviceDetail) {
      deviceDetail.sensorCollection = device.sensorCollection;
      deviceDetail.lastContact = device.lastContact;        
      console.log(deviceDetail.lastContact);
      setDeviceDetail(deviceDetail);
    }
    else 
      console.log('device detail is null');
  }

  const loadDevice = async () => {
    let fullDevice = await AppServices.instance.deviceServices.getDevice(repoId, id);    
    if (fullDevice) {
      await AppServices.instance.wssService.init('device', fullDevice.id);
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
        ConnectedDevice.onDisconnected = () => setIsDeviceConnected(false);
      }
                
      AppServices.instance.wssService.onmessage = (e) => handleWSMessage(e);
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
    AppServices.instance.wssService.close();
    let params = { peripheralId: peripheralId, instanceRepoId: repoId, deviceRepoId: repoId, deviceId: id }
    navigation.navigate(pageName, params);
 
    setPageVisible(false);
  }

  const showConfigurePage = async () => {
    if (isDeviceConnected) {
      await showPage('deviceOptionsPage');      
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


    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
        </View>),
    });

    const focusSubscription = navigation.addListener('focus', () => {
        loadDevice();
        setPageVisible(true);
        
      console.log("FOCUS SUBSCRIPTION FIRED!");
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      if(isDeviceConnected)
        await ConnectedDevice.disconnect();

      setPageVisible(false);
      AppServices.instance.wssService.close();
      console.log("BLUR SUBSCRIPTION FIRED!");
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
        <View style={{ height:110, backgroundColor: color, borderRadius: 8 }}>
          <Text style={{ textAlign: "center", color: 'white' }}>{label}</Text>
          <View >
            <Icon style={{ textAlign: 'center', }} size={48} color="white" name={icon} />
          </View>
          <Text style={{ textAlign: "center", textAlignVertical:"bottom", color: 'white' }}>Connected</Text>
        </View>
      }
      {!status &&
        <View style={{ height:110, backgroundColor: '#e0e0e0', borderRadius: 8 }}>
          <Text style={{  textAlign: "center", color: 'black' }}>{label}</Text>
          <View >
            <Icon style={{ textAlign: 'center', }} size={48} color="gray" name={icon} />
          </View>
          <Text style={{ textAlign: "center", textAlignVertical:"bottom", fontWeight: '500', color: 'black' }}>Not Connected</Text>
        </View>
      }
    </View>
  }


  const ioSensorBlock = (idx: number, sensors: Devices.Sensor[], icon: string) => {
    
    let sensor = sensors.find(snsr => snsr.portIndex == (idx) && snsr.technology.key == 'io');    
  
    let sensorName = sensor?.name ?? `Sensor ${idx + 1}`;

    return (
      <View style={[{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop:10, height: 130, width: 120, backgroundColor: themePalette.viewBackground, marginRight: 8, borderRadius: 8 }]}>
          <View style={[{ display: "flex", justifyContent: 'center', alignItems: 'center', width: 56, height: 56, backgroundColor: colors.primaryBlue, borderRadius: 8, marginBottom: 8 }]}>
          <Icon style={{ textAlign: 'center', color: sensor ? 'white' : '#d0d0d0' }} size={24} onPress={showConfigurePage} name={icon} />
        </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: themePalette.shellTextColor }}>{sensorName}</Text>
         <Text style={{ textAlign: "center", textAlignVertical: "center", color: sensor ? 'white' : '#d0d0d0' }}>{sensor?.value ?? '-'}</Text> 
      </View>)
  }

  const adcSensorBlock = (idx: number, sensors: Devices.Sensor[], icon: string) => {
    let sensor = sensors.find(snsr => snsr.portIndex == (idx) && snsr.technology.key == 'adc');    
  
    let sensorName = sensor?.name ?? `Sensor ${idx + 1}`;

    return (
    <View style={[{ display: "flex", flexDirection: "column", alignItems: "center",  paddingTop: 10, height: 130, width: 120, backgroundColor: themePalette.viewBackground, marginRight: 8, borderRadius: 8 }]}>
      <View style={[{ display: "flex", justifyContent: 'center', alignItems: 'center', width: 56, height: 56, backgroundColor: colors.primaryBlue, borderRadius: 8, marginBottom: 8 }]}>
          <Icon style={{ textAlign: 'center', color: sensor ? 'white' : '#d0d0d0' }} size={24} onPress={showConfigurePage} name={icon} />
      </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: themePalette.shellTextColor }}>{sensorName}</Text>
    </View>
      )
  }


  return <Page style={[styles.container]}>
    <ScrollView style={[styles.scrollContainer,{backgroundColor: themePalette.background }]}>
      {/* <StatusBar style="auto" /> */}
      {
        <View>
          {
            errorMessage &&
            <View>
              <Text style={contentStyle}>{errorMessage}</Text>
            </View>
          }
          <View >
            {sectionHeader('Device Information')}
          <View style={{ backgroundColor: themePalette.background}}>
            {
              deviceDetail &&
              <View style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: 'hidden'}}>
                {panelDetail('purple', deviceDetail.deviceNameLabel, deviceDetail?.name)}
                <View style={{ height: 1, backgroundColor: themePalette.background, width: '100%' }} />
                {panelDetail('purple', deviceDetail.deviceIdLabel, deviceDetail?.deviceId)}
                <View style={{ height: 1, backgroundColor: themePalette.background, width: '100%' }} />
                {panelDetail('purple', deviceDetail.deviceTypeLabel, deviceDetail?.deviceType ? deviceDetail.deviceType.text : 'N/A')}
                <View style={{ height: 1, backgroundColor: themePalette.background, width: '100%' }} />
                {panelDetail('purple', 'Repository', deviceDetail?.deviceRepository ? deviceDetail.deviceRepository.text : 'N/A')}
                <View style={{ height: 1, backgroundColor: themePalette.background, width: '100%' }} />
                {panelDetail('purple', 'Last Contact', deviceDetail?.lastContact ? deviceDetail.lastContact : 'N/A')}
                <View style={{ height: 1, backgroundColor: themePalette.background, width: '100%' }} />
              </View>
            }
            {
              !remoteDeviceState &&
              <View style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden'}}>
                {panelDetail('purple', "Firmware SKU", deviceDetail?.actualFirmware ? deviceDetail?.actualFirmware : 'N/A')}
                <View style={{ height: 1, backgroundColor: themePalette.background, width: '100%' }} />
                {panelDetail('purple', "FIrmware Rev", deviceDetail?.actualFirmwareRevision ? deviceDetail.actualFirmwareRevision : 'N/A')}
              </View>
            }
              </View>
            {
              isDeviceConnected &&
              <View style={{ marginTop: 24 }}>
                  {sectionHeader('Local Connection')}
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: themePalette.viewBackground, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8  }}>
                  <Text style={labelStyle}>Connected</Text>
                  <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={(() => showConfigurePage())} name='settings-sharp' />
                </View>
              </View>
            }
            {
              deviceDetail && !isDeviceConnected &&
              <View style={{ marginTop: 24 }}>
                  {sectionHeader('Local Connection')}
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: themePalette.viewBackground, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8  }}>
                  <View>
                    <Text style={labelStyle}>Not Connected</Text>
                    <Text style={{fontSize: 14, fontWeight: "400", color: themePalette.subtitleColor}}>Search</Text>
                  </View>
                    <View>
                      <Icon.Button size={22} backgroundColor="transparent" underlayColor="transparent" color={colors.primaryBlue} onPress={(() => showScanPage())} name='bluetooth-outline' />
                    </View>
                  </View>
                {
                  !peripheralId &&
                  <View style={{ display: 'flex', flexDirection: "row", alignItems: "center", backgroundColor: themePalette.blueBox , padding: 16, borderRadius: 8, marginTop: 8, borderColor: '#C0DFFF', borderWidth: 1}}>
                    <Icon.Button style={{padding: 0, width: 'auto'}} size={28} backgroundColor="transparent" color={colors.primaryBlue} underlayColor="transparent" onPress={(() => showScanPage())} name='information-circle-outline' />
                  
                    <View>
                      <Text style={ { paddingHorizontal: 4, color: themePalette.blueText}}>Device is not associated on this platform. Please scan and associate.</Text>
                    </View>                    
                  </View>
                }
              </View>
            }
            {
              remoteDeviceState &&
              <View style={{ marginTop: 24 }}>
                {sectionHeader('Current Device Status')}
                {panelDetail('green', 'Firmware SKU', remoteDeviceState.firmwareSku)}
                {panelDetail('green', 'Device Model', remoteDeviceState.deviceModelKey)}
                {panelDetail('green', 'Firmware Rev', remoteDeviceState.firmwareRevision)}
                {panelDetail('green', 'Hardware Rev', remoteDeviceState.hardwareRevision)}
                {panelDetail('green', 'Commissioned', remoteDeviceState.commissioned ? 'Yes' : 'No')}
              </View>
            }
            {
              remoteDeviceState &&
              <View style={{ marginTop:8}} >
                {sectionHeader('Connectivity')}
                <View style={{ flexDirection: 'row', marginHorizontal: 8 }} >
                  {connectionBlock('orange', 'wifi-outline', 'WiFi', remoteDeviceState.wifiStatus == 'Connected')}
                  {connectionBlock('orange', 'cellular-outline', 'Cellular', remoteDeviceState.cellularConnected)}
                  {connectionBlock('orange', 'bluetooth-outline', 'Bluetooth', true)}
                  {connectionBlock('orange', 'cloud', 'Cloud', remoteDeviceState.isCloudConnected)}
                </View>
              </View>
            }
            {
              deviceDetail && deviceDetail.sensorCollection &&
              <View style={{ marginTop: 20, marginBottom: 20 }}>
                {sectionHeader('Live Sensor Data')}
                <Text style={[labelStyle, {fontSize: 18, fontWeight: "500"}]}>ADC Sensors</Text>
                <ScrollView horizontal={true} style={{ marginBottom: 24 }}>
                  {adcSensorBlock(0, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(1, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(2, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(3, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(4, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(5, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(6, deviceDetail.sensorCollection, 'radio-outline')}
                  {adcSensorBlock(7, deviceDetail.sensorCollection, 'radio-outline')}
                </ScrollView>
                <Text style={[labelStyle, {fontSize: 18, fontWeight: "500"}]}>IO Sensors</Text>
                <ScrollView horizontal={true} style={{ marginBottom: 24 }}>
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