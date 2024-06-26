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
import { busyBlock, panelDetail, sectionHeader } from "../mobile-ui-common/PanelDetail";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import { LogWriter, showError } from "../mobile-ui-common/logger";
import { center } from "@shopify/react-native-skia";

export const DfuPage = ({ props, navigation, route }: IReactPageServices) => {
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [firmware, setFirmware] = useState<Devices.FirmwareDetail>();
  const [pageVisible, setPageVisible] = useState<boolean>();
  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  

  const [busyMessage, setBusyMessage] = useState<string>("Please Wait");
  const [firmwareUpdateStatus, setFirmwareUpdateStatus] = useState<Devices.FirmwareUpdateStatus | undefined>(undefined);
  const [isBusy, setIsBusy] = useState<boolean>(true);

  const peripheralId = route.params.peripheralId;
  const deviceId = route.params.deviceId;
  const repoId = route.params.deviceRepoId;
  const themePalette = AppServices.instance.getAppTheme();

  const handleWSMessage = (e: any) => {
    let wssMessage = JSON.parse(e.data);
    console.log(wssMessage);
    setFirmwareUpdateStatus(JSON.parse(wssMessage.payloadJSON));
  }

  const initializePage = async () => {
    setBusyMessage('Connecting to device');
    if (await ConnectedDevice.connect(peripheralId)) {
      setBusyMessage('Subscribing to events');

      let deviceStateStr = await ConnectedDevice.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      if (deviceStateStr) {
        let state = new RemoteDeviceState(deviceStateStr);
        setRemoteDeviceState(state);
      }

      await ConnectedDevice.disconnect();
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

      setIsBusy(false);
    }

  const updateFirmware = async () => {
    let result = await AppServices.instance.deviceServices.requestFirmwareUpdate(repoId, deviceId, firmware!.id, firmware!.defaultRevision.id);
    if (result.successful) {
      let downloadId = result.result;
      AppServices.instance.wssService.init('dfu', downloadId);

      if(await ConnectedDevice.connectAndWrite(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `dfu=${downloadId};`)) {

      }
    }
    else {
      showError("Error", "Error could not request new firmware");
    }
  }

  useEffect(() => {
    if (initialCall) {      
      initializePage();
      setInitialCall(false);
    }

    const focusSubscription = navigation.addListener('focus', async () => {
      setPageVisible(true);
      await LogWriter.log("[DFUPage__Focus]");
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      setPageVisible(false);
      AppServices.instance.wssService.close();
      await LogWriter.log("[DFUPage__Blur]");
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  });
  
  return (
    <Page >
      {isBusy && busyBlock(busyMessage)}
      <StatusBar style="auto" />
      {!isBusy && firmware &&
        <View style={[styles.container, { backgroundColor: themePalette.background, padding: 20 }]}>
          {sectionHeader('Available Firmware')}
          
          {panelDetail('purple', "Name", firmware.name)}
          {panelDetail('purple', "SKU", firmware.firmwareSku)}
          {firmware.defaultRevision && panelDetail('purple', "Revision", firmware.defaultRevision?.text)}
          {remoteDeviceState &&
            <View>
              {sectionHeader('Device Firmware')}
              {panelDetail('green', "SKU", remoteDeviceState.firmwareSku)}
              {panelDetail('green', "Version", remoteDeviceState.firmwareRevision)}
            </View>}
          {firmwareUpdateStatus &&
            <View style={[{  justifyContent: "center" }]}>
              <Text style={[{ color: themePalette.shellTextColor, fontSize:24, textAlign:'center' }]}>{firmwareUpdateStatus.Message}</Text>
            </View>}
          {!firmwareUpdateStatus && <TouchableOpacity style={[styles.submitButton, { backgroundColor: themePalette.buttonPrimary, borderColor: themePalette.buttonPrimaryBorderColor }]} onPress={() => updateFirmware()}>
            <Text style={[styles.submitButtonText, { color: themePalette.buttonPrimaryText }]}> Update to Revision </Text>
          </TouchableOpacity>}
        </View>
      }
      {!isBusy && !firmware &&
        <View style={[styles.container, { backgroundColor: themePalette.background }]}>
          <Text style={[{ color: themePalette.shellTextColor, fontSize: fontSizes.medium }]}>Device does not have default firmware.</Text>
        </View>
      }
    </Page>
  )
    }

export default DfuPage;