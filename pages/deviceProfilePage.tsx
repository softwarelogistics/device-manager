import { useEffect, useState } from "react";
import { Platform, View, Text, ScrollView } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import styles from '../styles';
import Icon from "react-native-vector-icons/Ionicons";
import { useInterval } from 'usehooks-ts'
import { ble, CHAR_UUID_IO_VALUE, CHAR_UUID_STATE } from '../NuvIoTBLE'
import { RemoteDeviceState } from "../models/blemodels/state";
import Page from "../mobile-ui-common/page";
import { IOValues } from "../models/blemodels/iovalues";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import colors from "../styles.colors";
import { contentStyle, labelStyle } from "../compound.styles";
import { connectionBlock, panelDetail, sectionHeader, sensorRows } from "../mobile-ui-common/PanelDetail";

export const DeviceProfilePage = ({ props, navigation, route }: IReactPageServices) => {
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined | null>(undefined);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [peripheralId, setPeripheralId] = useState<string | undefined>(undefined);
  const [pageVisible, setPageVisible] = useState<boolean>(true);
  const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);

  const repoId = route.params.repoId;
  const id = route.params.id;

  const themePalette = AppServices.instance.getAppTheme();


  const charHandler = async (value: any, device: Devices.DeviceDetail) => {
    if (value.characteristic == CHAR_UUID_STATE) {
      let rds = new RemoteDeviceState(value.value);
      setRemoteDeviceState(rds);
    }

    if (value.characteristic == CHAR_UUID_IO_VALUE) {
      console.log(value.value);
      let values = new IOValues(value.value);
      setSensorValues(values);  
    }
  }

  useInterval(async () => {
    if (peripheralId && !isDeviceConnected) {
      await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_STATE, CHAR_UUID_IO_VALUE], 1);
    }
  }, pageVisible ? 6000 : null
  )

  const handleWSMessage = (e: any) => {
    let json = e.data;
    let wssMessage = JSON.parse(json);
    let wssPayload = wssMessage.payloadJSON;
    let device = JSON.parse(wssPayload) as Devices.DeviceForNotification;

    if (deviceDetail) {
      deviceDetail.sensorCollection = device.sensorCollection;
      deviceDetail.lastContact = device.lastContact;
      setDeviceDetail(deviceDetail);
    }
  }

  const loadDevice = async () => {
    let fullDevice = await AppServices.instance.deviceServices.getDevice(repoId, id);
    if (fullDevice) {
      await AppServices.instance.wssService.init('device', fullDevice.id);
      setDeviceDetail(fullDevice);

      let peripheralId: string | undefined;
      if (Platform.OS == 'ios')
        peripheralId = fullDevice.iosBLEAddress;
      else if (Platform.OS == 'android')
        peripheralId = fullDevice.macAddress;

      setPeripheralId(peripheralId);

      let sensorValues : IOValues = {
        adcValues :[],
        ioValues : []
      }

      for(let idx = 0; idx < 8; idx++) {
        sensorValues.ioValues.push(undefined);
        sensorValues.adcValues.push(undefined);
      }

      for(let sensor of fullDevice.sensorCollection) {
        if(sensor.technology.key == 'io') 
          sensorValues.ioValues[sensor.portIndex] = parseFloat(sensor.value);
        else if(sensor.technology.key == 'adc') 
          sensorValues.adcValues[sensor.portIndex] = parseFloat(sensor.value);        
      }
        
      console.log(sensorValues.adcValues);      
      console.log(sensorValues.ioValues);

      setSensorValues(sensorValues);

      ConnectedDevice.onReceived = (value) => charHandler(value, fullDevice!);
      ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
      ConnectedDevice.onDisconnected = () => setIsDeviceConnected(false);
      AppServices.instance.wssService.onmessage = (e) => handleWSMessage(e);
    }
    else {
      console.error("[DeviceProfilePage__loadDevice] - Could Not Load Device");
      setErrorMessage('Sorry - Could Not Load Device.');
    }
  }

  const showPage = async (pageName: string) => {
    setPageVisible(false);

    ble.removeAllListeners();

    let peripheralId = Platform.OS == 'ios' ? deviceDetail.iosBLEAddress : deviceDetail.macAddress;
    await ConnectedDevice.disconnect();
    setIsDeviceConnected(false);
    AppServices.instance.wssService.close();
    let params = { deviceName: deviceDetail.name, peripheralId: peripheralId, instanceRepoId: repoId, deviceRepoId: repoId, deviceId: id }
    AppServices.instance.navService.navigate(pageName, params);
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
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => showPage('deviceTwinPage')} name='cog-outline' />
        </View>),
    });
    
    const focusSubscription = navigation.addListener('focus', () => {
      loadDevice();
      setPageVisible(true);
      console.log("[DeviceProfilePage__Focus]");
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      await ConnectedDevice.disconnect();

      setPageVisible(false);
      AppServices.instance.wssService.close();      
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  }, [isDeviceConnected]);


  const ioSensorBlock = (idx: number, sensors: Devices.Sensor[], icon: string) => {
    let sensor = sensors.find(snsr => snsr.portIndex == (idx) && snsr.technology.key == 'io');
    let sensorName = sensor?.name ?? `Sensor ${idx + 1}`;

    return (
      <View style={[{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, height: 130, width: 120, backgroundColor: themePalette.viewBackground, marginRight: 8, borderRadius: 8 }]}>
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
      <View style={[{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, height: 130, width: 120, backgroundColor: themePalette.viewBackground, marginRight: 8, borderRadius: 8 }]}>
        <View style={[{ display: "flex", justifyContent: 'center', alignItems: 'center', width: 56, height: 56, backgroundColor: colors.primaryBlue, borderRadius: 8, marginBottom: 8 }]}>
          <Icon style={{ textAlign: 'center', color: sensor ? 'white' : '#d0d0d0' }} size={24} onPress={showConfigurePage} name={icon} />
        </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: themePalette.shellTextColor }}>{sensorName}</Text>
      </View>
    )
  }

  const formatTimeStamp = (timestamp: string) => {
    const date = new Date(Date.parse(timestamp));
    return date.toLocaleString();
  }

  return <Page style={[styles.container]}>
    <ScrollView style={[styles.scrollContainer, { backgroundColor: themePalette.background }]}>
      {
        <View style={{ marginBottom:50 }}>
          {
            errorMessage &&
            <View>
              <Text style={contentStyle}>{errorMessage}</Text>
            </View>
          }
          <View >
            <View style={{ backgroundColor: themePalette.background }}>
              {
                deviceDetail &&
                <View style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: 'hidden' }}>
                  {sectionHeader('Device Information')}
                  {panelDetail('purple', deviceDetail.deviceNameLabel, deviceDetail?.name)}
                  {panelDetail('purple', deviceDetail.deviceIdLabel, deviceDetail?.deviceId)}
                  {panelDetail('purple', deviceDetail.deviceTypeLabel, deviceDetail?.deviceType ? deviceDetail.deviceType.text : 'N/A')}
                  {panelDetail('purple', 'Repository', deviceDetail?.deviceRepository ? deviceDetail.deviceRepository.text : 'N/A')}
                  {panelDetail('purple', 'Last Contact', deviceDetail?.lastContact ? formatTimeStamp(deviceDetail.lastContact) : 'N/A')}
                </View>
              }
              {
                !remoteDeviceState &&
                <View style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden' }}>
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
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: themePalette.viewBackground, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={labelStyle}>Connected</Text>
                  <Icon.Button size={24} backgroundColor="transparent" onPress={(() => showConfigurePage())} underlayColor="transparent" color={themePalette.buttonPrimary} name='settings-sharp' />
                </View>
              </View>
            }
            {
              deviceDetail && !isDeviceConnected &&
              <View style={{ marginTop: 24 }}>
                {sectionHeader('Local Connection')}
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: themePalette.viewBackground, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <View>
                    <Text style={labelStyle}>Not Connected</Text>
                    <Text style={{ fontSize: 14, fontWeight: "400", color: themePalette.subtitleColor }}>Search</Text>
                  </View>
                  <View>
                    <Icon.Button size={22} backgroundColor="transparent" underlayColor="transparent" color={colors.primaryBlue} onPress={(() => showScanPage())} name='bluetooth-outline' />
                  </View>
                </View>
                {
                  !peripheralId &&
                  <View style={{ display: 'flex', flexDirection: "row", alignItems: "center", backgroundColor: themePalette.blueBox, padding: 16, borderRadius: 8, marginTop: 8, borderColor: '#C0DFFF', borderWidth: 1 }}>
                    <Icon.Button style={{ padding: 0, width: 'auto' }} size={28} backgroundColor="transparent" color={colors.primaryBlue} underlayColor="transparent" onPress={(() => showScanPage())} name='information-circle-outline' />
                    <View>
                      <Text style={{ paddingHorizontal: 4, color: themePalette.blueText }}>Device is not associated on this platform.</Text>
                      <Text style={{ paddingHorizontal: 4, paddingTop:4, color: themePalette.blueText }}>Please scan and associate.</Text>
                    </View>
                  </View>
                }
              </View>
            }
            {
              remoteDeviceState &&
              <View style={{ marginTop: 24 }}>
                {sectionHeader('Current Device Status')}
                {panelDetail('green', 'Device Model', remoteDeviceState.deviceModelKey)}
                {panelDetail('green', 'Hardware Rev', remoteDeviceState.hardwareRevision)}
                {panelDetail('green', 'Firmware SKU', remoteDeviceState.firmwareSku)}
                {panelDetail('green', 'Firmware Rev', remoteDeviceState.firmwareRevision)}
                {panelDetail('green', 'Commissioned', remoteDeviceState.commissioned ? 'Yes' : 'No')}
              </View>
            }
            {
              remoteDeviceState &&
              <View style={{ marginTop: 8 }} >
                {sectionHeader('Connectivity')}
                <View style={{ flexDirection: 'row', marginHorizontal: 8 }} >
                  {connectionBlock('orange', 'bluetooth-outline', 'Bluetooth', true)}
                  {connectionBlock('orange', 'wifi-outline', 'WiFi', remoteDeviceState.wifiStatus == 'Connected')}
                  {connectionBlock('orange', 'cellular-outline', 'Cellular', remoteDeviceState.cellularConnected)}
                  {connectionBlock('orange', 'cloud', 'Cloud', remoteDeviceState.isCloudConnected)}
                </View>
              </View>
            }
            {sensorValues && sensorRows(sensorValues)}
          </View>
        </View>
      }
    </ScrollView>
  </Page>
}