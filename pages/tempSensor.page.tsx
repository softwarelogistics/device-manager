import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextStyle } from "react-native";

import { IReactPageServices } from "../services/react-page-services";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { RemoteDeviceState } from "../models/blemodels/state";
import { IOValues } from "../models/blemodels/iovalues";
import { IOConfig } from "../models/blemodels/ioconfig";

import ViewStylesHelper from "../utils/viewStylesHelper";
import styles from '../styles';
import fontSizes from "../styles.fontSizes";
import AppServices from "../services/app-services";
import { useFocusEffect } from "@react-navigation/native";

export const TempSensorPage = ({ props, navigation, route }: IReactPageServices) => {
  let [adcPorts, setADCPorts] = useState<IOConfig[]>([]);
  let [ioPorts, setIOPorts] = useState<IOConfig[]>([]);
  let [ioValues, setIOValues] = useState<IOValues | undefined>();
  let [isConnected, setIsConnected] = useState<boolean>(false);

  const themePalette = AppServices.instance.getAppTheme();
  const staticLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette.name === 'dark' ? '700' : '400') }]);

  const getDeviceProperties = async (peripheralId: string) => {
    try {
      console.log('Device Address', peripheralId)
      await ble.connectById(peripheralId);
      setIsConnected(true);
      let result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      if (result1) {
        let state = new RemoteDeviceState(result1);
        console.log('WiFi Connected: ' + state.wifiStatus);
      }

      result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
      if (result1) {
        let ioValues = new IOValues(result1);
        console.log('Temperature => ' + ioValues.ioValues[0]);
        console.log('Humidity => ' + ioValues.ioValues[1]);
        setIOValues(ioValues);
      }

      if (adcPorts.length == 0) {
        console.log('-------');

        for (let idx = 1; idx <= 8; ++idx) {
          console.log(idx);
          await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=adc${idx}`);
          result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
          if (result1) {
            console.log(result1);
            adcPorts.push(new IOConfig(result1))
          }

          await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=io${idx}`);
          result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
          if (result1) {
            console.log(result1);
            ioPorts.push(new IOConfig(result1));
          }
        }

        setADCPorts(adcPorts);
        setIOPorts(ioPorts);

        console.log('-------');
      }

      ble.disconnectById(peripheralId);
    }
    catch (ex: any) {
      setIsConnected(false);
    }

    console.log('is connected', isConnected);
  }

  useFocusEffect(() => {
    getDeviceProperties(route.params.id);
  })

  useEffect(() => {
    return (() => {
    })
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themePalette.background }]}>
      <StatusBar style="auto" />
      {
        ioValues &&
        <View>
          <Text style={staticLabelStyle}>Is Connected: {isConnected ? 'true' : 'false'}</Text>
          <Text style={staticLabelStyle}>Temperature: {ioValues.ioValues[0]}</Text>
          <Text style={staticLabelStyle}>Humidity: {ioValues.ioValues[1]}</Text>
        </View>
      }
    </View>
  );
}