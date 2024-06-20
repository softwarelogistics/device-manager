import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Alert } from "react-native";
import { StatusBar } from 'expo-status-bar';
import Page from "../mobile-ui-common/page";

import { IReactPageServices } from "../services/react-page-services";
import { RemoteDeviceState } from "../models/blemodels/state";

import AppServices from "../services/app-services";

import { ble, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE';

import styles from '../styles';
import fontSizes from "../styles.fontSizes";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export const DfuPage = ({ props, navigation, route }: IReactPageServices) => {
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [firmware, setFirmware] = useState<Devices.FirmwareDetail>();
  const [pageVisible, setPageVisible] = useState<boolean>();
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<number>(IDLE);
  const [busyMessage, setBusyMessage] = useState<string>("Please Wait");
  const [firmwareUpdateStatus, setFirmwareUpdateStatus] = useState<Devices.FirmwareDownloadRequest | undefined>(undefined);

  const peripheralId = route.params.peripheralId;
  const deviceId = route.params.deviceId;
  const repoId = route.params.deviceRepoId;
  const themePalette = AppServices.instance.getAppTheme();

  const handleWSMessage = (e: any) => {
    let json = e.data;
    let wssMessage = JSON.parse(json);
    let wssPayload = wssMessage.payloadJSON;
    console.log(wssPayload);
  }

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
    let device = await AppServices.instance.deviceServices.getDevice(repoId, deviceId);
    setBusyMessage('Getting Device Model');
    let deviceType = await AppServices.instance.deviceServices.getDeviceType(device!.deviceType.id);
    if (deviceType.model.firmware) {
      setBusyMessage('Getting Current Firmware Version');
      let firmware = await AppServices.instance.deviceServices.getFirmware(deviceType.model.firmware.id);
      setFirmware(firmware);
    }
    else
      setFirmware(undefined);
  
  
      AppServices.instance.wssService.onmessage = (e) => handleWSMessage(e);
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
    let result = await AppServices.instance.deviceServices.getFirmwareHistory(repoId, deviceId);
    if (result.length > 0) {
      setFirmwareUpdateStatus(result[0]);
    }
    else{
      console.log('hi');
    }
  }

  const updateFirmware = async () => {
    let result = await AppServices.instance.deviceServices.requestFirmwareUpdate(repoId, deviceId, firmware!.id, firmware!.defaultRevision.id);
    if (result.successful) {
      let downloadId = result.result;

      AppServices.instance.wssService.init('dfu', downloadId);

      if (await ble.connectById(peripheralId)) {
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `dfu=${downloadId};`);
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

    const focusSubscription = navigation.addListener('focus', () => {
      setPageVisible(true);
      console.log("[DFUPage__Focus]");
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      setPageVisible(false);
      AppServices.instance.wssService.close();
      console.log("[DFUPage__Blur]");
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  });

  return (
    <Page style={[styles.scrollContainer, { backgroundColor: themePalette.background }]}>
      <StatusBar style="auto" />
      {firmware ?
        <View>
          <Text style={[{ color: themePalette.shellTextColor }]}>Firmware: {firmware.name}</Text>
          <Text style={[{ color: themePalette.shellTextColor }]}>Firmware SKU: {firmware.firmwareSku}</Text>
          <Text style={[{ color: themePalette.shellTextColor }]}>Available Firmware Revision: {firmware.defaultRevision?.text}</Text>

          {remoteDeviceState &&
            <View>
              <Text style={[{ color: themePalette.shellTextColor }]}>Device FW SKU: {remoteDeviceState.firmwareSku}</Text>
              <Text style={[{ color: themePalette.shellTextColor }]}>Device Revision: {remoteDeviceState.firmwareRevision}</Text>
            </View>}

          {firmwareUpdateStatus &&
            <View>
              <Text style={[{ color: themePalette.shellTextColor }]}>Percent Requested: {firmwareUpdateStatus.percentRequested}</Text>
            </View>

          }

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: themePalette.buttonPrimary, borderColor: themePalette.buttonPrimaryBorderColor }]} onPress={() => updateFirmware()}>
            <Text style={[styles.submitButtonText, { color: themePalette.buttonPrimaryText }]}> Update to Revision </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: themePalette.buttonPrimary, borderColor: themePalette.buttonPrimaryBorderColor }]} onPress={() => getFirmwareUpdateStatus()}>
            <Text style={[styles.submitButtonText, { color: themePalette.buttonPrimaryText }]}> Refresh</Text>
          </TouchableOpacity>
        </View>
        :
        <View style={[styles.container, { backgroundColor: themePalette.background }]}>
          <Text style={[{ color: themePalette.shellTextColor, fontSize: fontSizes.medium }]}>Device does not have default firmware.</Text>
        </View>
      }
    </Page>
  )
    }

export default DfuPage;