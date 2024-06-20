import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, TextInput, Switch, TouchableOpacity, ActivityIndicator, TextStyle } from "react-native";

import AppServices from "../services/app-services";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { SysConfig } from "../models/blemodels/sysconfig";
import { RemoteDeviceState } from "../models/blemodels/state";
import { IReactPageServices } from "../services/react-page-services";

import Icon from "react-native-vector-icons/Ionicons";

import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import ViewStylesHelper from "../utils/viewStylesHelper";
import styles from '../styles';
import palettes from "../styles.palettes";
import colors from "../styles.colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect } from "@react-navigation/native";
import Page from "../mobile-ui-common/page";


export const DeviceAdvancedPage = ({ props, navigation, route }: IReactPageServices) => {
  const peripheralId = route.params.peripheralId;

  const [isBusy, setIsBusy] = useState<boolean>(true);

  const [gpsEnabled, setGPSEnabled] = useState<boolean>(false);
  const [gpsRate, setGPSRate] = useState<string>("250");
  const [pingRate, setPingRate] = useState<string>("30");
  const [loopRate, setLoopRate] = useState<string>("250");
  const [sendUpdateRate, setSendUpdateRate] = useState<string>("250");

  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [viewReady, setViewReady] = useState<boolean>(false);
  const [handler, setHandler] = useState<string | undefined>(undefined);

  const themePalette = AppServices.instance.getAppTheme();

  const inputStyleOverride = {
    backgroundColor: themePalette.inputBackgroundColor,
    borderColor: palettes.gray.v80,
    color: themePalette.shellTextColor,
    marginBottom: 20,
    paddingLeft: 4
  };

  const inputStyleWithBottomMargin: TextStyle = ViewStylesHelper.combineTextStyles([styles.inputStyle, inputStyleOverride]);
  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: themePalette.shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400') }]);
  const placeholderTextColor: string = themePalette.name === 'dark' ? themePalette.shellNavColor : palettes.gray.v50;

  const writeChar = async () => {
    if (!peripheralId) {
      console.error('PeripheralId not set, can not write.');
      return;
    }

    setIsBusy(true);

    if (await ble.connectById(peripheralId)) {
      if (gpsEnabled) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `gps=${gpsEnabled ? '1' : '0'}`);
      if (gpsRate) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `gpsrate=${gpsRate}`);
      if (pingRate) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `pingrate=${pingRate}`);
      if (sendUpdateRate) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `sendrate=${sendUpdateRate}`);
      if (loopRate) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `looprate=${loopRate}`);

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

      setGPSEnabled(sysconfig.gpsEnabled);
      setGPSRate(sysconfig.gpsUpdateRate?.toString());
      setLoopRate(sysconfig.loopRate?.toString());
      setSendUpdateRate(sysconfig.sendUpdateRate?.toString());
      setPingRate(sysconfig?.pingRate?.toString());

      await ble.disconnectById(peripheralId);
      setViewReady(true);

      console.log('got device data.');
    }
    else {
      console.warn('could not connect.');
    }
    setIsBusy(false);
  }

  useFocusEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);

      if (peripheralId) {
        getData();
      }
      else
        throw 'peripheralId not set from calling page, must pass in as a parameter.'
    }
  });

  useEffect(() => {
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

  return (
    <Page>
      {isBusy ?
        <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
          <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Please Wait</Text>
          <ActivityIndicator size="large" color={colors.primaryColor} animating={isBusy} />
        </View>
        :
        <KeyboardAwareScrollView style={[{ backgroundColor: themePalette.background, paddingLeft: 20, paddingRight: 20 }]}>
          <View>
            <Text style={inputLabelStyle}>Send Update Rate (MS):</Text>
            <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="default (250 ms)" value={sendUpdateRate} onChangeText={e => { setSendUpdateRate(e); }} />

            <Text style={inputLabelStyle}>Internal Loop Rate (MS):</Text>
            <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="default (250 ms)" value={loopRate} onChangeText={e => setLoopRate(e)} />

            <Text style={inputLabelStyle}>Ping/Keep Alive Rate (Seconds):</Text>
            <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="default (30 seconds)" value={pingRate} onChangeText={e => setPingRate(e)} />

            <View style={styles.flex_toggle_row}>
              <Text style={inputLabelStyle}>GPS Enabled:</Text>
              <Switch onValueChange={e => setGPSEnabled(e)} value={gpsEnabled}
                thumbColor={(colors.primaryColor)}
                trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
            </View>

            <Text style={inputLabelStyle}>GPS Update Rate (MS):</Text>
            <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="default (250 ms)" value={gpsRate} onChangeText={e => setGPSRate(e)} />
          </View>
        </KeyboardAwareScrollView>}
    </Page>
  );
}