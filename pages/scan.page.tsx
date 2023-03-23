import React, { useState, useEffect } from "react";
import { Text, PermissionsAndroid, Platform, View, TouchableOpacity, FlatList, ActivityIndicator, Pressable, BackHandler, Alert, TextStyle, } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

import AppServices from "../services/app-services";

import Icon from "react-native-vector-icons/Ionicons";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";

import { IReactPageServices } from "../services/react-page-services";
import { BLENuvIoTDevice } from "../models/device/device-local";
import { SysConfig } from "../models/blemodels/sysconfig";

import { ThemePalette } from "../styles.palette.theme";
import styles from '../styles';
import palettes from "../styles.palettes";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import { PermissionsHelper } from "../services/ble-permissions";
import { scanUtils } from "../services/scan-utils";

export default function ScanPage({ navigation }: IReactPageServices) {
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);

  const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
  const [discoveredPeripherals, setDiscoveredPeripherals] = useState<Peripheral[]>([]);

  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [busyMessage, setIsBusyMessage] = useState<String>('Busy');
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [initialCall, setInitialCall] = useState<boolean>(true);


  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      let hasPermissions = false;
      if (Platform.Version >= 23) {
        hasPermissions = await PermissionsHelper.requestLocationPermissions();
      }

      hasPermissions = await PermissionsHelper.requestBLEPermission();
      setHasPermissions(hasPermissions);
    }
    else {
      setHasPermissions(true);
    }
  }

  const scanningStatusChanged = async (isScanning: boolean) => {
    console.log('scanningStatusChanged=>' + isScanning);
    setIsScanning(isScanning);

    if (!isScanning) {
      console.log('scanning finished');
      ble.removeAllListeners('connected');
      ble.removeAllListeners('scanning');
      setIsScanning(true);
      setIsBusyMessage('Loading devices');
      let newDevices = await scanUtils.getNuvIoTDevices(discoveredPeripherals, devices.length);
      setDevices([...newDevices]);

      setIsScanning(false);
    }
    else {
      setIsBusyMessage('Scanning for local devices.');
    }
  }

  if (initialCall) {
    checkPermissions();
    setInitialCall(false);
    ble.peripherals = [];
  }

  const startScan = async () => {
    console.log(isScanning);
    if (isScanning)
      return;

    setDevices([]);

    let newDevices: BLENuvIoTDevice[] = [];

    if (hasPermissions) {
      setDiscoveredPeripherals([]);

      ble.addListener('connected', (device) => discovered(device))
      ble.addListener('scanning', (isScanning) => { scanningStatusChanged(isScanning); });
      await ble.startScan();

      if (ble.simulatedBLE()) {
        setIsBusyMessage('Scanning for local devices.');
        setIsScanning(true);
        window.setTimeout(() => {
          let idx = newDevices.length;
          for (let item of ble.peripherals) {
            newDevices.push({ name: item.name!, peripheralId: item.id, provisioned: idx % 2 == 0, id: idx++, deviceType: 'BILL0'})
          }

          setDevices(newDevices);
          }, 5000);
      }
    }
  }

  const stopScanning = () => {
    if (isScanning) {
      if (!ble.simulatedBLE()) {
        ble.removeAllListeners('connected');
        ble.removeAllListeners('scanning');
        ble.stopScan();
      }
    }
  }

  const showDevice = async (device: BLENuvIoTDevice) => {
    if (device.provisioned)
      navigation.navigate('liveDevicePage', { id: device.peripheralId });
    else
      navigation.navigate('provisionPage', { id: device.peripheralId });
  }

  const discovered = async (peripheral: Peripheral) => {
    discoveredPeripherals.push(peripheral);
  }

  const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

  const myListEmpty = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={styles.item}> Could not find any devices. </Text>
      </View>
    );
  };

  useEffect(() => {

    ble.peripherals = [];

    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);
    setThemePalette(AppServices.getAppTheme());

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button backgroundColor="transparent" underlayColor="transparent" color="#1976D2" onPress={() => startScan()} name='refresh-outline' />
        </View>
      ),
    });

    const focusSubscription = navigation.addListener('focus', () => { });
    const blurSubscription = navigation.addListener('beforeRemove', () => { stopScanning();});

    return (() => {
      focusSubscription();
      blurSubscription();

      if (subscription)
        AppServices.themeChangeSubscription.remove(subscription);
    });
  }, []);

  return <View style={[styles.container, { padding: 0, backgroundColor: themePalette.background }]}>
    {
      isScanning &&
      <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={{ fontSize: 25, color: themePalette.shellTextColor }}>{busyMessage}</Text>
        <ActivityIndicator size="large" color={palettes.accent.normal} animating={isScanning} />
      </View>
    }
    {
      !isScanning && devices.length > 0 &&
      <>
        <Text style={{ fontSize: 18, padding: 15, color: themePalette.shellTextColor }}>{devices.length} Device{devices.length === 1 ? '' : 's'} Found</Text>
        <FlatList
          contentContainerStyle={{ alignItems: "stretch" }}
          style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={devices}
          renderItem={({ item }) =>
            <Pressable onPress={() => showDevice(item)} key={item.peripheralId} >
              <View style={[styles.listRow, { padding: 10, marginBottom: 10, height: 90, backgroundColor: themePalette.shell, }]}  >
                <View style={{ flex: 3 }} key={item.peripheralId}>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize: 18, flex: 3 }]}>ID: {item.name}</Text>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize: 18, flex: 3 }]}>Type: {item.deviceType}</Text>
                </View>
                <Text style={[{ marginLeft: 10, color: themePalette.shellTextColor, fontSize: 18, flex: 3 }]}>{item.peripheralId}</Text>
                {item.provisioned && <Icon style={{ fontSize: 48, color: themePalette.listItemIconColor }} name='ios-information-circle' />}
                {!item.provisioned && <Icon style={{ fontSize: 48, color: 'green' }} name='add-circle-outline' />}
              </View>
            </Pressable>
          }
        />
      </>
    }

    {
      !isScanning && devices.length <= 0 &&
      <View style={[styles.centeredContent, { padding: 50, backgroundColor: themePalette.background }]}>
        <MciIcon name="radar" style={[styles.centeredIcon]}></MciIcon>
        <TouchableOpacity style={[styles.submitButton]} onPress={() => startScan()}>
          <Text style={[styles.submitButtonText,]}> Begin Scanning</Text>
        </TouchableOpacity>
      </View>
    }
  </View>
}


