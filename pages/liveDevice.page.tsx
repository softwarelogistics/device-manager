import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, ActivityIndicator, TextInput, TextStyle, ViewStyle } from "react-native";

import AppServices from "../services/app-services";
import { SimulatedData } from "../services/simulatedData";

import Icon from "react-native-vector-icons/Ionicons";

import styles from '../styles';
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { RemoteDeviceState } from "../models/blemodels/state";
import { SysConfig } from "../models/blemodels/sysconfig";
import { IOValues } from "../models/blemodels/iovalues";
import Page from "../mobile-ui-common/page";
import { NetworkCallStatusService } from "../services/network-call-status-service";
import { connectionBlock, panelDetail, sectionHeader } from "../mobile-ui-common/PanelDetail";
import { labelStyle } from "../compound.styles";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import { useInterval } from "usehooks-ts";


let simData = new SimulatedData();

export const LiveDevicePage = ({ props, navigation, route }: IReactPageServices) => {

  const [pageVisible, setPageVisible] = useState<boolean>(true);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
  const [sysConfig, setSysConfig] = useState<SysConfig>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const peripheralId = route.params.id;
  const instanceRepoId = route.params.instanceRepoId;
  const deviceRepoId = route.params.deviceRepoId;
  const deviceId = route.params.deviceId;
  const isOwnedDevice = route.params.owned;
  const themePalette = AppServices.instance.getAppTheme();

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
    }
  }

  const connectToBLE = async () => {
    setErrorMessage(undefined);    
    NetworkCallStatusService.beginCall('Establishing BLE Connection to Device.')
    if (await ConnectedDevice.connectAndSubscribe(peripheralId,[CHAR_UUID_STATE,CHAR_UUID_IO_VALUE])) {
      NetworkCallStatusService.endCall();
      let sysConfigStr = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
      if (sysConfigStr) {
        let sysConfig = new SysConfig(sysConfigStr);
        setSysConfig(sysConfig);

        if(isOwnedDevice) {
          try {
            NetworkCallStatusService.beginCall('Loading Device Details from Server.')
            let device = await AppServices.instance.deviceServices.getDevice(sysConfig.repoId, sysConfig.id);
            setDeviceDetail(device);
          }
          catch (e) {
            alert(e);            
            return;
          }
          finally
          {
            NetworkCallStatusService.endCall();
          }
        }
      }
      else {
        NetworkCallStatusService.endCall();        
        setErrorMessage(`Could not get sys config for ${peripheralId}`)
        return;
      }

      NetworkCallStatusService.endCall();
    }
    else {
      NetworkCallStatusService.endCall();
    }      
  }

  const showConfigurePage = async () => {
    ConnectedDevice.disconnect();
    setPageVisible(false);
    navigation.navigate('deviceOptionsPage', { peripheralId: peripheralId, deviceRepoId:deviceRepoId, instanceRepoId:instanceRepoId, deviceId: deviceId });
  }

  const loadDevice = async () => {
    if (ble.simulatedBLE()) {
      setSysConfig(simData.getSysConfig());
      setRemoteDeviceState(simData.getRemoteDeviceState());
      setDeviceDetail(simData.getDeviceDetail());
      setSensorValues(simData.getSensorValues());
      return;
    }

    await connectToBLE();
  }

  const disconnectHandler = () => {
    setIsDeviceConnected(false);
    setRemoteDeviceState(undefined);
    setSensorValues(undefined);
  }

  useInterval(async () => {
    if (peripheralId && !isDeviceConnected) {
      ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_STATE, CHAR_UUID_IO_VALUE], 1)
    }
  }, pageVisible ? 6000 : null
  )

  useEffect(() => {
    ConnectedDevice.onReceived = (value) => charHandler(value);
    ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
    ConnectedDevice.onDisconnected = () => disconnectHandler();
   
    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      ConnectedDevice.disconnect();
      setPageVisible(false);
    });

    const focusSubscription = navigation.addListener('focus', async () => {
      loadDevice();
      setPageVisible(true);
    });

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => showConfigurePage()} name='cog-outline' />
        </View>),
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  });

  const sensorBlock = (idx: number, value: any, icon: string) => {
    return (
      <View style={[{ flex: 1, width: 100, backgroundColor: value ? 'green' : '#d0d0d0', margin: 5, justifyContent: 'center', borderRadius: 8 }]}>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: value ? 'white' : 'black' }}>Sensor {idx + 1}</Text>
        <View >
          <Icon style={{ textAlign: 'center', color: value ? 'white' : '#a0a0a0' }} size={64} onPress={showConfigurePage} name={icon} />
        </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: value ? 'white' : '#d0d0d0' }}>{value ?? '-'}</Text>
      </View>)
  }

  return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
    {
      errorMessage &&
      <View style={{ marginBottom: 30 }}>
        <Text>{ errorMessage }</Text>
      </View>
    }
    <ScrollView style={styles.scrollContainer}>
      <StatusBar style="auto" />
      { isDeviceConnected &&
        <View style={{ marginBottom: 30 }}>
          {
            deviceDetail &&
            <View>
              {sectionHeader('Device Info and Connectivity')}
              {panelDetail('purple', 'Device Name', deviceDetail?.name)}
              {panelDetail('purple', 'Device Id', deviceDetail?.deviceId)}
              {panelDetail('purple', 'Repository', deviceDetail.deviceRepository.text)}
              {panelDetail('purple', deviceDetail.deviceTypeLabel, deviceDetail.deviceType.text)}
            </View>
          }
          {
            (!deviceDetail && isOwnedDevice) &&
            <View>
              {sectionHeader('Device Not Configured')}
            </View>
          }
                    {
            (!isOwnedDevice) &&
            <View>
              {sectionHeader('You do not own this device.')}
            </View>
          }
          {
            remoteDeviceState &&
            <View>
              {sectionHeader('Current Device Status')}
              <View style={{ flexDirection: 'row', marginHorizontal: 8 }} >              
                {connectionBlock('orange', 'bluetooth-outline', 'Bluetooth', true)}
                {connectionBlock('orange', 'wifi-outline', 'WiFi', remoteDeviceState.wifiStatus == 'Connected')}
                {connectionBlock('orange', 'cellular-outline', 'Cellular', remoteDeviceState.cellularConnected)}                
                {connectionBlock('orange', 'cloud', 'Cloud', remoteDeviceState.isCloudConnected)}
              </View>
            </View>
          }
          {
            remoteDeviceState &&
            <View style={{ marginTop: 20 }}>
              {sectionHeader('Device Configuration')}
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
                {sensorBlock(0, sensorValues.adcValues[0], 'radio-outline')}
                {sensorBlock(1, sensorValues.adcValues[1], 'radio-outline')}
                {sensorBlock(2, sensorValues.adcValues[2], 'radio-outline')}
                {sensorBlock(3, sensorValues.adcValues[3], 'radio-outline')}
                {sensorBlock(4, sensorValues.adcValues[4], 'radio-outline')}
                {sensorBlock(5, sensorValues.adcValues[5], 'radio-outline')}
                {sensorBlock(6, sensorValues.adcValues[6], 'radio-outline')}
                {sensorBlock(7, sensorValues.adcValues[7], 'radio-outline')}
              </ScrollView>
              <Text style={labelStyle}>IO Sensors</Text>
              <ScrollView horizontal={true}>
                {sensorBlock(0, sensorValues.ioValues[0], 'radio-outline')}
                {sensorBlock(1, sensorValues.ioValues[1], 'radio-outline')}
                {sensorBlock(2, sensorValues.ioValues[2], 'radio-outline')}
                {sensorBlock(3, sensorValues.ioValues[3], 'radio-outline')}
                {sensorBlock(4, sensorValues.ioValues[4], 'radio-outline')}
                {sensorBlock(5, sensorValues.ioValues[5], 'radio-outline')}
                {sensorBlock(6, sensorValues.ioValues[6], 'radio-outline')}
                {sensorBlock(7, sensorValues.ioValues[7], 'radio-outline')}
              </ScrollView>


            </View>

          }
        </View>     
      }      
      {! isDeviceConnected && 
      <View style={{ alignItems:'center', paddingTop:40}}>
        <Text style={[labelStyle, { fontSize: 24, fontWeight: "500" }]}>Not Connected, Will Retry.</Text>
      </View>}
    </ScrollView>
  </Page>

}