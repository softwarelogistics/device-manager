import React, { useEffect, useState } from "react";
import { TouchableOpacity, ScrollView, View, Text, ActivityIndicator, TextInput, Alert } from "react-native";
import { StatusBar } from 'expo-status-bar';
import Page from "../mobile-ui-common/page";

import { IReactPageServices } from "../services/react-page-services";
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
  const [firmware, setFirmware] = useState<Devices.FirmwareDetail>();
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<number>(IDLE);
  const [busyMessage, setBusyMessage] = useState<string>("Please Wait");
  const [firmwareUpdateStatus, setFirmwareUpdateStatus] = useState<Devices.FirmwareDownloadRequest | undefined>(undefined);

  const peripheralId = route.params.peripheralId;
  const deviceId = route.params.deviceId;
  const repoId = route.params.deviceRepoId;

  const initializePage = async () => {
    setBusyMessage('Connecting to device');
    if (await ble.connectById(peripheralId, CHAR_UUID_SYS_CONFIG)) {
      setConnectionState(CONNECTED);
      setBusyMessage('Subscribing to events');
      await ble.subscribe(ble);

      let deviceStateStr = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      if (deviceStateStr) {
        let state = new RemoteDeviceState(deviceStateStr);
        setRemoteDeviceState(state);
      }

      ble.disconnectById(peripheralId);
    }

    setBusyMessage('Getting Device');
    let device = await appServices.deviceServices.getDevice(repoId, deviceId);
    setBusyMessage('Getting Device Model');
    let deviceType = await appServices.deviceServices.getDeviceType(device!.deviceType.id);
    if (deviceType.model.firmware) {
      setBusyMessage('Getting Current Firmware Version');
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
  }

  const getFirmwareUpdateStatus = async () => {
    let result = await appServices.deviceServices.getFirmwareHistory(repoId, deviceId);
    if (result.length > 0) {
      setFirmwareUpdateStatus(result[0]);
    }
    else{
      console.log('hi');
    }
  }

  const updateFirmware = async () => {
    let result = await appServices.deviceServices.requestFirmwareUpdate(repoId, deviceId, firmware!.id, firmware!.defaultRevision.id);
    if (result.successful) {
      let downloadId = result.result;
      console.log(result.result);

      if (await ble.connectById(peripheralId)) {
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `dfu=${downloadId}`);
        await ble.disconnectById(peripheralId);
        setConnectionState(DISCONNECTED);
        await ble.unsubscribe();
      }
    }
    else {
      console.log(result);
      Alert.alert("Error", "Error could not request new firmware");
    }
  }

  useEffect(() => {
    if (initialCall) {
      initializePage();
      setInitialCall(false);
    }
  });

  return (
    <Page style={[styles.scrollContainer, { backgroundColor: AppServices.getAppTheme().background }]}>
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

          {firmwareUpdateStatus &&
            <View>
              <Text style={[{ color: AppServices.getAppTheme().shellTextColor }]}>Percent Requested: {firmwareUpdateStatus.percentRequested}</Text>
            </View>

          }

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: AppServices.getAppTheme().buttonPrimary, borderColor: AppServices.getAppTheme().buttonPrimaryBorderColor }]} onPress={() => updateFirmware()}>
            <Text style={[styles.submitButtonText, { color: AppServices.getAppTheme().buttonPrimaryText }]}> Update to Revision </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: AppServices.getAppTheme().buttonPrimary, borderColor: AppServices.getAppTheme().buttonPrimaryBorderColor }]} onPress={() => getFirmwareUpdateStatus()}>
            <Text style={[styles.submitButtonText, { color: AppServices.getAppTheme().buttonPrimaryText }]}> Refresh</Text>
          </TouchableOpacity>
        </View>
        :
        <View style={[styles.container, { backgroundColor: AppServices.getAppTheme().background }]}>
          <Text style={[{ color: AppServices.getAppTheme().shellTextColor, fontSize: fontSizes.medium }]}>Device does not have default firmware.</Text>
        </View>
      }
    </Page>
  )
    }

export default DfuPage;