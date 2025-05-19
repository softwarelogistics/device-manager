import React, { useState, useEffect } from "react";
import { Text, Platform, View, TouchableOpacity, FlatList, ActivityIndicator, Pressable, TextInput,  ActionSheetIOS, ActionSheetIOSOptions } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble,  SVC_UUID_NUVIOT,  CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG } from '../NuvIoTBLE'
import { Button } from 'react-native-ios-kit';

import AppServices from "../services/app-services";

import Icon from "react-native-vector-icons/Ionicons";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";

import { IReactPageServices } from "../services/react-page-services";
import { BLENuvIoTDevice } from "../models/device/device-local";
import styles from '../styles';
import palettes from "../styles.palettes";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import { PermissionsHelper } from "../services/ble-permissions";
import { scanUtils } from "../services/scan-utils";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import { RemoteDeviceState } from "../models/blemodels/state";
import { SysConfig } from "../models/blemodels/sysconfig";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Picker } from "@react-native-picker/picker";
import { inputLabelStyle, inputStyleWithBottomMargin, placeholderTextColor } from "../compound.styles";

export const WiFiPage = ({ navigation, props, route }: IReactPageServices) => {
  const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
  const [discoveredPeripherals, setDiscoveredPeripherals] = useState<Peripheral[]>([]);

  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [busyMessage, setBusyMessage] = useState<String>('Busy');
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [currentOrgId, setCurrentOrgId] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(true);
  const [peripheralId, setPeripheralId] = useState<string>('');
  const [wifiSSID, setWiFiSSID] = useState<string>();
  const [wifiPWD, setWiFiPWD] = useState<string>();
  const [wifiConnections, setWiFiConnections] = useState<Deployment.WiFiConnectionProfile[] | undefined>(undefined);
  const [selectedWiFiConnection, setSelectedWiFiConnection] = useState<Deployment.WiFiConnectionProfile | undefined>(undefined);

  const [handler, setHandler] = useState<string | undefined>(undefined);
  const themePalette = AppServices.instance.getAppTheme();
  const deviceRepoId = route.params.repoId;

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
    setIsScanning(isScanning);

    if (!isScanning) {
      setIsScanning(true);
      setBusyMessage(`Loading ${discoveredPeripherals.length} Devices`);
      let newDevices = await scanUtils.getNuvIoTDevices(discoveredPeripherals, devices.length);
      setDevices([...newDevices]);
      ble.removeAllListeners('connecting');
      ble.removeAllListeners('connected');
      ble.removeAllListeners('scanning');
      setIsScanning(false);
    }
    else {
      setBusyMessage('Scanning for local devices.');
    }
  }

  if (initialCall) {
    checkPermissions();
    setInitialCall(false);
    ble.peripherals = [];
  }

  const getData = async () => {
    setIsBusy(true);
        if (await ble.connectById(peripheralId)) {
            let deviceStateCSV = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            let deviceState = new RemoteDeviceState(deviceStateCSV!);
            let deviceConfig = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            let sysconfig = new SysConfig(deviceConfig!);
        }
    }

  const startScan = async () => {
    ble.peripherals = [];

    if (isScanning){
      console.log('[ScanPage__StartScan] Already Scanning;');
      return;
    }

    setDevices([]);

    let newDevices: BLENuvIoTDevice[] = [];

    if (hasPermissions) {
      console.log('[ScanPage__StartScan] BLE Permissions Enabled;');

      ConnectedDevice.disconnect();

      setDiscoveredPeripherals([]);

      ble.addListener('connected', (device) => discovered(device))
      ble.addListener('connecting', (msg) => { setBusyMessage(msg); console.log(msg);});
      ble.addListener('scanning', (isScanning) => { scanningStatusChanged(isScanning); });

      await ble.startScan();

      if (ble.simulatedBLE()) {
        setBusyMessage('Scanning for Local Devices');
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
    console.log('[ScanPage__StopScanning];');
    if (isScanning) {
      console.log('[ScanPage__StopScanning] Is Scanning;');
      if (!ble.simulatedBLE()) {
        ble.removeAllListeners('connecting');
        ble.removeAllListeners('connected');
        ble.removeAllListeners('scanning');
        ble.stopScan();
      }
    }
  }


  const getOptions = (options: string[]): ActionSheetIOSOptions => {
    return {
      options: options,
      cancelButtonIndex: 0,
      userInterfaceStyle: themePalette.name == 'dark' ? 'dark' : 'light',
    }
  }


  const iOSselectWiFiConnection = () => {
    if (wifiConnections == undefined) return;

    ActionSheetIOS.showActionSheetWithOptions(getOptions(wifiConnections.map(item => item.name)),
      buttonIndex => {
        if (buttonIndex > 0) {
          setSelectedWiFiConnection(wifiConnections![buttonIndex]);
          setWiFiSSID(wifiConnections![buttonIndex].ssid);
          setWiFiPWD(wifiConnections![buttonIndex].password);
        }
        else {
          setWiFiSSID('');
          setWiFiPWD('');
        }
      })
  };

const androidSelectWiFiConnection = (e: any) => {
    console.log(e);
    let selected = wifiConnections?.find(cn => cn.id == e)
    console.log(selected);
    setSelectedWiFiConnection(selected);

    if (e == 'cellular') {
      setWiFiSSID('');
      setWiFiPWD('');
    }
    else if (e == 'none') {
      setWiFiSSID('');
      setWiFiPWD('');
    }
    else {
      if (selected)
      setWiFiSSID(selected!.ssid);
      setWiFiPWD(selected!.password);
        }
    }

const setDeviceWiFi = async (device: BLENuvIoTDevice) => {
    setPeripheralId(device.peripheralId)
}

const discovered = async (peripheral: Peripheral) => {
let existing = discoveredPeripherals.find(per=>per.id == peripheral.id);
if(!existing)
    discoveredPeripherals.push(peripheral);

    if(discoveredPeripherals.length > 1)
    setBusyMessage(`Scanning - Found ${discoveredPeripherals.length} Devices`);
else
    setBusyMessage(`Scanning - Found ${discoveredPeripherals.length} Device`);
}

  const writeChar = async () => {
    if (!peripheralId) {
      console.error('PeripheralId not set, can not write.');
      return;
    }


    if (await ble.connectById(peripheralId)) {

        setIsBusy(true);

        if (wifiSSID) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${wifiSSID};`);
        if (wifiPWD) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPWD};`);

        setIsBusy(false);
    }
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

    switch (handler) {
        case 'save': writeChar();
          setHandler(undefined);
          break;
      }

      if(peripheralId) {
            navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }} >
                    <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => setHandler('save')} name='save' />
                </View>),
            });
        }

    const focusSubscription = navigation.addListener('focus', async () => {
      let user = await AppServices.instance.userServices.getUser();
      setCurrentOrgId(user!.currentOrganization!.id  )
     });
    const blurSubscription = navigation.addListener('beforeRemove', () => { stopScanning();});

    return (() => {
      focusSubscription();
      blurSubscription();
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
      !isScanning && devices.length > 0 && !peripheralId && 
      <>
        <Text style={{ fontSize: 18, padding: 15, color: themePalette.shellTextColor }}>{devices.length} Device{devices.length === 1 ? '' : 's'} Found</Text>
        <FlatList
          contentContainerStyle={{ alignItems: "stretch" }}
          style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={devices}
          renderItem={({ item }) =>
            <Pressable onPress={() => setDeviceWiFi(item)} key={item.peripheralId} >
              <View style={[styles.listRow, { padding: 10, marginBottom: 10, height: 90, backgroundColor: themePalette.shell, }]}  >
                <View style={{ flex: 3 }} key={item.peripheralId}>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize: 18, flex: 3 }]}>ID: {item.name}</Text>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize: 18, flex: 3 }]}>Type: {item.deviceType}</Text>
                </View>
                {item.provisioned && <Icon style={{ fontSize: 48, color: 'green' }} name='information-outline' />}
                {!item.provisioned && <Icon style={{ fontSize: 48, color: 'green' }} name='add-circle-outline' />}
              </View>
            </Pressable>
          }
        />
      </>
    }
    {  peripheralId && 
        <KeyboardAwareScrollView>
            <View style={{ padding: 20 }}>
              <Text style={inputLabelStyle}>WiFi Connection:</Text>
              {Platform.OS == 'ios' && selectedWiFiConnection && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => iOSselectWiFiConnection()} >{selectedWiFiConnection.name}</Button>}
              {Platform.OS == 'ios' && !selectedWiFiConnection && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => iOSselectWiFiConnection()} >-select wifi connection-</Button>}
              {Platform.OS != 'ios' &&
                <Picker selectedValue={selectedWiFiConnection} onValueChange={e => androidSelectWiFiConnection(e)} itemStyle={{ color: themePalette.shellTextColor }} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
                  {wifiConnections?.map(itm =>
                    <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }} />
                  )}
                </Picker>
              }
    
            <Text style={inputLabelStyle}>WiFi SSID:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Wifi SSID" value={wifiSSID} onChangeText={e => setWiFiSSID(e)} />

              <Text style={inputLabelStyle}>WiFi PWD:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter WiFi Password" value={wifiPWD} onChangeText={e => setWiFiPWD(e)} />
              </View>
              </KeyboardAwareScrollView>
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


