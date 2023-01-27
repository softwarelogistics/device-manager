import React, { useEffect, useState } from "react";
import { TouchableOpacity, ScrollView, View, Text, ActivityIndicator, TextInput, Alert } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { Device } from "react-native-ble-plx";

import Icon from "react-native-vector-icons/Ionicons";

import { IReactPageServices } from "../services/react-page-services";
import { SysConfig } from "../models/blemodels/sysconfig";
import { RemoteDeviceState } from "../models/blemodels/state";

import AppServices from "../services/app-services";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE';

import { ThemePalette } from "../styles.palette.theme";
import styles from '../styles';
import fontSizes from "../styles.fontSizes";
import colors from "../styles.colors";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export const DfuPage = ({ props, navigation, route }: IReactPageServices) => {

  const [appServices, setAppServices] = useState<AppServices>(new AppServices());

  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(true);
  const [firmware, setFirmware] = useState<Devices.FirmwareDetail>();
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<number>(IDLE);

  const peripheralId = route.params.id;
  const deviceId = route.params.deviceId;
  const repoId = route.params.repoId;

  const initializePage = async () => {
    if (await ble.connectById(peripheralId, CHAR_UUID_SYS_CONFIG)) {
      setConnectionState(CONNECTED);
      await ble.subscribe(ble);

      let deviceStateStr = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      if (deviceStateStr) {
        let state = new RemoteDeviceState(deviceStateStr);
        setRemoteDeviceState(state);
      }
    }

    let device = await appServices.deviceServices.getDevice(repoId, deviceId);
    let deviceType = await appServices.deviceServices.getDeviceType(device.deviceType.id);
    if (deviceType.model.firmware) {
      let firmware = await appServices.deviceServices.getFirmware(deviceType.model.firmware.id);
      setFirmware(firmware);
    }
    else
      setFirmware(undefined);
  }

  function handler(value: any) {
    if (value.characteristic == CHAR_UUID_STATE) {
      console.log(value.value);
      let rds = new RemoteDeviceState(value.value);
      setRemoteDeviceState(rds);
    }
  }

  const disconnectHandler = (id: string) => {
    setConnectionState(DISCONNECTED);
    setRemoteDeviceState(undefined);

    ble.btEmitter?.removeAllListeners('receive');
    ble.btEmitter?.removeAllListeners('disconnected');
    ble.unsubscribe();
  }

  const updateFirmware = async () => {
    let result = await appServices.deviceServices.requestFirmwareUpdate(repoId, deviceId, firmware!.id, firmware!.defaultRevision.id);
    if (result.successful) {
      let downloadId = result.result;
      console.log(result.result);

      if (await ble.connectById(peripheralId)) {
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `dfu=${downloadId}`);
        await ble.disconnectById(peripheralId);

        setConnectionState(CONNECTED);
        await ble.subscribe(ble);
        ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
        ble.btEmitter?.addListener('receive', handler);
        ble.btEmitter?.addListener('disconnected', disconnectHandler);
      }
    }
    else {
      console.log(result);
      Alert.alert("Error", "Error could not request new firmware");
    }
  }

  useEffect(() => {
    if (initialCall) {
      appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) })
      appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) })
      initializePage();
      setInitialCall(false);
    }  
  });

  return (
    isBusy ?
      <View style={[styles.spinnerView, { backgroundColor: AppServices.getAppTheme().background }]}>
        <Text style={{ color: AppServices.getAppTheme().shellTextColor, fontSize: 25 }}>Please Wait</Text>
        <ActivityIndicator size="large" color={colors.primaryColor} animating={isBusy} />
      </View>
      :
      <View style={[styles.scrollContainer, { backgroundColor: AppServices.getAppTheme().background }]}>
        <StatusBar style="auto" />
        {firmware ?
          <View>
            <Text style={[{ color: AppServices.getAppTheme().shellTextColor }]}>Firmware: {firmware.name}</Text>
            <Text style={[{ color: AppServices.getAppTheme().shellTextColor }]}>Firmware SKU: {firmware.firmwareSku}</Text>
            <Text style={[{ color: AppServices.getAppTheme().shellTextColor }]}>Available Firmware Revision: {firmware.defaultRevision.text}</Text>

            {remoteDeviceState &&
              <View>
                <Text style={[{ color: AppServices.getAppTheme().shellTextColor }]}>Device FW SKU: {remoteDeviceState.firmwareSku}</Text>
                <Text style={[{ color: AppServices.getAppTheme().shellTextColor }]}>Device Revision: {remoteDeviceState.firmwareRevision}</Text>
              </View>}

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: AppServices.getAppTheme().buttonPrimary, borderColor: AppServices.getAppTheme().buttonPrimaryBorderColor }]} onPress={() => updateFirmware()}>
              <Text style={[styles.submitButtonText, { color: AppServices.getAppTheme().buttonPrimaryText }]}> Update to Revision </Text>
            </TouchableOpacity>
          </View>


          :
          <View style={[styles.container, { backgroundColor: AppServices.getAppTheme().background }]}>
            <Text style={[{ color: AppServices.getAppTheme().shellTextColor, fontSize: fontSizes.medium }]}>Device does not have default firmware.</Text>
          </View>
        }
      </View>
  )

}

export default DfuPage;