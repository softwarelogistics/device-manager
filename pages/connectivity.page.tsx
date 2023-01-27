import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, TextInput, Switch, TouchableOpacity, ActivityIndicator, TextStyle } from "react-native";
import { StatusBar } from 'expo-status-bar';

import AppServices from "../services/app-services";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { SysConfig } from "../models/blemodels/sysconfig";
import { RemoteDeviceState } from "../models/blemodels/state";
import { IReactPageServices } from "../services/react-page-services";

import Icon from "react-native-vector-icons/Ionicons";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import FaIcon from "react-native-vector-icons/FontAwesome5";

import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import ViewStylesHelper from "../utils/viewStylesHelper";
import styles from '../styles';
import palettes from "../styles.palettes";
import colors from "../styles.colors";
import Tabbar from "@mindinventory/react-native-tab-bar-interaction";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


export const ConnectivityPage = ({ props, navigation, route }: IReactPageServices) => {
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());

  const peripheralId = route.params.id;
  const [initialCall, setInitialCall] = useState<boolean>(true);

  const [deviceId, setDeviceId] = useState<string>();
  const [serverUrl, setServerUrl] = useState<string>();
  const [serverUid, setServerUid] = useState<string>();
  const [serverPwd, setServerPwd] = useState<string>();
  const [port, setPort] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(true);
  const [wifiSSID, setWiFiSSID] = useState<string>();
  const [wifiPWD, setWiFiPWD] = useState<string>();
  const [commissioned, setCommissioned] = useState<boolean>(false);
  const [useWiFi, setUseWiFi] = useState<boolean>(true);
  const [useCellular, setUseCellular] = useState<boolean>(false);
  const [viewReady, setViewReady] = useState<boolean>(false);
  const [handler, setHandler] = useState<string | undefined>(undefined);

  const inputStyleOverride = {
    backgroundColor: themePalette.inputBackgroundColor,
    borderColor: palettes.gray.v80,
    color: themePalette.shellTextColor,
    marginBottom: 20,
    paddingLeft: 4
  };

  const inputStyleWithBottomMargin: TextStyle = ViewStylesHelper.combineTextStyles([styles.inputStyle, inputStyleOverride]);
  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: themePalette.shellTextColor, fontWeight: (AppServices.getAppTheme().name === 'dark' ? '700' : '400') }]);
  const placeholderTextColor: string = AppServices.getAppTheme().name === 'dark' ? themePalette.shellNavColor : palettes.gray.v50;
  const switchThumbColorOffSetting: string = AppServices.getAppTheme().name === 'dark' ? palettes.gray.v5 : colors.black;
  const switchThumbColorOnSetting: string = AppServices.getAppTheme().name === 'dark' ? themePalette.background : colors.white;
  const switchTrackColorSetting: any = { false: colors.transparent, true: AppServices.getAppTheme().name === 'dark' ? themePalette.shellNavColor : palettes.gray.v20 };

  const writeChar = async () => {
    if (!peripheralId) {
      console.error('PeripheralId not set, can not write.');
      return;
    }

    setIsBusy(true);

    if (await ble.connectById(peripheralId)) {
      if (deviceId) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `deviceid=${deviceId}`);
      if (serverUrl) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${serverUrl}`);
      if (port) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${port}`);
      if (serverUid) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `uid=${serverUid}`);
      if (serverPwd) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `pwd=${serverPwd}`);

      if (wifiSSID) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${wifiSSID}`);
      if (wifiPWD) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPWD}`);

      await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=' + (useWiFi ? '1' : '0'));
      await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=' + (useCellular ? '1' : '0'));
      await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0'));
      await ble.disconnectById(peripheralId);

      await getData();
    }
    else {
      console.warn('could not connect');
    }

    setIsBusy(false);
  };

  const getData = async () => {
    setIsBusy(true);
    if (await ble.connectById(peripheralId)) {
      let deviceStateCSV = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);

      let deviceState = new RemoteDeviceState(deviceStateCSV!);
      let deviceConfig = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
      let sysconfig = new SysConfig(deviceConfig!);

      setDeviceId(sysconfig.deviceId);
      setServerUrl(sysconfig.serverHostName);
      setServerUid(sysconfig.serverUid);
      setServerPwd(sysconfig.serverPwd);
      setCommissioned(sysconfig.commissioned);
      setUseCellular(sysconfig.cellEnabled);
      setUseWiFi(sysconfig.wifiEnabled);
      setWiFiSSID(sysconfig.wifiSSID);
      setPort(sysconfig.port?.toString());

      await ble.disconnectById(peripheralId);
      setViewReady(true);
    }
    else {
      console.warn('could not connect.');
    }
    setIsBusy(false);
  }

  useEffect(() => {
    console.log('[ConnectivityPage__UseEffect] ' + peripheralId);
    setThemePalette(AppServices.getAppTheme());

    switch (handler) {
      case 'save': writeChar();
        setHandler(undefined);
        break;
    }

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => setHandler('save')} name='save' />
        </View>),
    });



    return (() => {
      console.log('[ConnectivityPage__UseEffect_Return] ' + peripheralId);
    });
  }, [handler]);

  if (initialCall) {
    setInitialCall(false);

    if (peripheralId) {
      getData();
    }
  }

  return (
    isBusy ?
      <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Please Wait</Text>
        <ActivityIndicator size="large" color={colors.primaryColor} animating={isBusy} />
      </View>
      :
      <KeyboardAwareScrollView style={[{ backgroundColor: themePalette.background, paddingLeft: 20, paddingRight: 20 }]}>
        <View>
          <Text style={inputLabelStyle}>Device ID:</Text>
          <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Device ID" value={deviceId} onChangeText={e => { setDeviceId(e); console.log(deviceId) }} />

          <Text style={inputLabelStyle}>Server Host Name:</Text>
          <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Server URL" value={serverUrl} onChangeText={e => setServerUrl(e)} />

          <Text style={inputLabelStyle}>Server User Id:</Text>
          <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Server URL" value={serverUid} onChangeText={e => setServerUid(e)} />

          <Text style={inputLabelStyle}>Server Host Password:</Text>
          <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="enter server password" value={serverPwd} onChangeText={e => setServerPwd(e)} />

          <Text style={inputLabelStyle}>Server Port Number:</Text>
          <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Port Number" value={port} onChangeText={e => setPort(e)} />

          <Text style={inputLabelStyle}>WiFi SSID:</Text>
          <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Wifi SSID" value={wifiSSID} onChangeText={e => setWiFiSSID(e)} />

          <Text style={inputLabelStyle}>WiFi PWD:</Text>
          <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter WiFi Password" value={wifiPWD} onChangeText={e => setWiFiPWD(e)} />

          <View style={styles.flex_toggle_row}>
            <Text style={inputLabelStyle}>Commissioned:</Text>
            <Switch onValueChange={e => setCommissioned(e)} value={commissioned}
              thumbColor={(colors.primaryColor)}
              trackColor={{ false: colors.accentColor, true: colors.accentColor }} />          
            </View>

          <View style={styles.flex_toggle_row}>
            <Text style={inputLabelStyle}>Use WiFi:</Text>
            <Switch onValueChange={e => setUseWiFi(e)} value={useWiFi}
              thumbColor={(colors.primaryColor)}
              trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
          </View>

          <View style={styles.flex_toggle_row}>
            <Text style={inputLabelStyle}>Use Cellular:</Text>
            <Switch onValueChange={e => setUseCellular(e)} value={useCellular}
              thumbColor={(colors.primaryColor)}
              trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
          </View>
        </View>
      </KeyboardAwareScrollView>
  );
}