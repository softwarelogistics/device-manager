import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import { IReactPageServices } from "../services/react-page-services";

import styles from '../styles';
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";

export const BlePropertiesPage = ({ props, navigation, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [theme, setTheme] = useState<string>('');

  let [deviceAddress, setDeviceAddress] = useState<string>();
  let [item, setItem] = useState();

  const [portName, setPortName] = useState('');
  const [analogDeviceType, setAnalogDeviceType] = useState('');

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' }
  ]);

  const getDeviceProperties = async () => {
    console.log(deviceAddress);
    await ble.connectById(deviceAddress!);
    console.log('this came from effect');
  }

  useEffect(() => {
    const promisesToKeep: Promise<any>[] = [
      appServices.userServices.getThemeName(),
      appServices.userServices.getThemePalette()
    ];

    (async () => {
      await Promise.all(promisesToKeep)
        .then(responses => {
          setTheme(responses[0]);
          setThemePalette(responses[1]);
        });
    })();
  }, []);


  return (
    <View style={[styles.container, { backgroundColor: themePalette.background }]}>
      <StatusBar style="auto" />


    </View>
  );
}