import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, TextInput, TextStyle, ViewStyle, ActivityIndicator, Platform } from "react-native";

import AppServices from "../services/app-services";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { SimulatedData } from "../services/simulatedData";
import ViewStylesHelper from "../utils/viewStylesHelper";

import styles from '../styles';
import palettes from "../styles.palettes";
import Page from "../mobile-ui-common/page";
import colors from "../styles.colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

let simData = new SimulatedData();

export const ConfigureDevicePage = ({ props, navigation, route }: IReactPageServices) => {
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const themePalette = AppServices.instance.getAppTheme();
  const deviceId = route.params.deviceId;
  const deviceRepoId = route.params.deviceRepoId;
  const instanceRepoId = route.params.instanceRepoId;
  const peripheralId = route.params.peripheralId;

  if (!peripheralId || !deviceId || !instanceRepoId || !deviceRepoId) {
    console.error(route.params);
    throw 'Must provide peripheralId, instanceRepoId, deviceRepoId, and deviceId in the route.params'
  }

  const primaryButtonStyle: ViewStyle = ViewStylesHelper.combineViewStyles([styles.submitButton, { backgroundColor: themePalette.buttonPrimary }]);
  const primaryButtonTextStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, { color: themePalette.buttonPrimaryText }]);

  const safeNavigate = async (pageName: string, args: any) => {
    navigation.navigate(pageName, args)
  }

  const showPage = async (pageName: string) => {
    console.log(deviceId);
    await safeNavigate(pageName, { peripheralId: peripheralId, deviceRepoId: deviceRepoId, instanceRepoId: instanceRepoId, deviceId: deviceId });
  }

  const restartDevice = async () => {
    setIsBusy(true);
    if (await ble.connectById(peripheralId!)) {
      await ble.writeCharacteristic(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `reboot=1`);
      await ble.disconnectById(peripheralId!);
      setIsBusy(false);
      await alert('Success resetting device.');
    }
    else {
      setIsBusy(false);
      await alert('Could not connect to device.');
    }
  }

  const factoryReset = async () => {
    setIsBusy(true);
    if (await ble.connectById(peripheralId!)) {
      let writeSuccess = await ble.writeCharacteristic(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `factoryreset=1`);
      
      await ble.disconnectById(peripheralId!);
      setIsBusy(false);
      if(writeSuccess) {
        await alert('Success resetting device to factory defaults.');
        navigation.popToTop();
      }
      else 
        await alert('Could not send factory reset command to device..');
    }
    else {
      setIsBusy(false);
      await alert('Could not connect to device.');
    }
  }

  useEffect(() => {    
    return (() => {
    });
  }, []);

  return (
    <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
   <StatusBar style="auto" />
   <KeyboardAwareScrollView>
       {
        isBusy ?
          <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
            <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Please Wait</Text>
            <ActivityIndicator size="large" color={colors.accentColor} animating={isBusy} />
          </View>
          :
          <View style={{ margin: 20 }}>
            <TouchableOpacity style={[primaryButtonStyle, { marginTop: 30, }]} onPress={() => showPage('settingsPage')}>
              <Text style={primaryButtonTextStyle}> Connectivity </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[primaryButtonStyle, { marginTop: 30, }]} onPress={() => showPage('advancedPage')}>
              <Text style={primaryButtonTextStyle}> Advanced </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[primaryButtonStyle]} onPress={() => showPage('consolePage')}>
              <Text style={primaryButtonTextStyle}> Console </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[primaryButtonStyle]} onPress={() => showPage('canMonitorPage')}>
              <Text style={primaryButtonTextStyle}> CAN Monitor </Text>
            </TouchableOpacity>            

            <TouchableOpacity style={primaryButtonStyle} onPress={() => showPage('sensorsPage')}>
              <Text style={primaryButtonTextStyle}> Sensors </Text>
            </TouchableOpacity> 

            <TouchableOpacity style={primaryButtonStyle} onPress={() => showPage('dfuPage')}>
              <Text style={primaryButtonTextStyle}> Firmware </Text>
            </TouchableOpacity>

            <View style={[{ marginTop: 40 }]}>
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: palettes.alert.warning }]} onPress={() => restartDevice()}>
                <Text style={primaryButtonTextStyle}> Restart </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.submitButton, { marginTop: 40, backgroundColor: palettes.alert.error }]} onPress={() => factoryReset()}>
                <Text style={primaryButtonTextStyle}> Factory Reset </Text>
              </TouchableOpacity>
            </View>
          </View>
      }
     
      </KeyboardAwareScrollView>
    </Page>
  );

}