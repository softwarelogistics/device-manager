import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, TouchableOpacity, FlatList, ActivityIndicator, Pressable, BackHandler, Alert, TextStyle, } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

import AppServices from "../services/app-services";

import Icon from "react-native-vector-icons/Ionicons";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import FaIcon from "react-native-vector-icons/FontAwesome5";

import { IReactPageServices } from "../services/react-page-services";
import { BLENuvIoTDevice } from "../models/device/device-local";
import { SysConfig } from "../models/blemodels/sysconfig";

import { ThemePalette } from "../styles.palette.theme";
import styles from '../styles';
import palettes from "../styles.palettes";
import colors from "../styles.colors";
import ViewStylesHelper from "../utils/viewStylesHelper";
import { Subscription } from "../utils/NuvIoTEventEmitter";

export default function ScanPage({ navigation }: IReactPageServices) {
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);

  const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
  const [discoveredPeripherals, setDiscoveredPeripherals] = useState<Peripheral[]>([]);

  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [busyMessage, setIsBusyMessage] = useState<String>('Busy');
  const [initialCall, setInitialCall] = useState<boolean>(true);

  const tabs = [
    {
      name: 'Home',
      activeIcon: <Icon name="home" color={colors.primaryColor} size={42} style={{ top: 16 }} />,
      inactiveIcon: <Icon name="home" color={themePalette.shellNavColor} size={42} />
    },
    {
      name: 'Scan',
      activeIcon: <MciIcon name="radar" color={colors.primaryColor} size={42} style={{ top: 16 }} />,
      inactiveIcon: <MciIcon name="radar" color={themePalette.shellNavColor} size={42} />
    },
    {
      name: 'Profile',
      activeIcon: <FaIcon name="user-alt" color={colors.primaryColor} size={42} style={{ top: 16 }} />,
      inactiveIcon: <FaIcon name="user-alt" color={themePalette.shellNavColor} size={42} />
    },

  ];

  const tabBarLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ color: themePalette.shellNavColor, fontWeight: '600', fontSize: 10, marginTop: 3 }]);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
        title: 'Location permission for bluetooth scanning',
        message: 'To scan for NuvIoT devices, the application must have permissions to access course location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
      );

      let btGranted = PermissionsAndroid.RESULTS.GRANTED;
      let btcGranted = PermissionsAndroid.RESULTS.GRANTED;

      let OsVer = Platform.Version;//.constants["Release"] as number;

      console.log('react native version' + OsVer)

      // android revision 30 is android release 11, 31 is 12.
      if (OsVer > 30) {
        console.log('OS Version is greater then 30, need to request additional BT permissions.');

        btGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
          title: 'Bluetooth Scanning Permission',
          message: 'To scan for NuvIoT devices, the application must have permissions to scan for bluetooth devices.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });

        console.log('Scan permissions granted?', btGranted);

        btcGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
          title: 'Bluetooth Connect Permissions',
          message: 'To connect to NuvIoT devices, the application must have permissions to connect to bluetooth devices.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });

        console.log('Scan permissions granted?', btGranted);
      }
      else {
        console.log('OS Version less or equal to 30, do not need to request additional BT permissions.');
      }

      console.log('Permissions Granted', granted, btGranted, btcGranted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        if (btGranted === PermissionsAndroid.RESULTS.GRANTED) {
          if (btcGranted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission for bluetooth scanning granted');
            return true;
          }
          else {
            console.log('Blue tooth connect permission => ' + btcGranted);
            return false;
          }
        }
        else {
          console.log('Blue tooth scan permission revoked -=> ' + btGranted);
          return false;
        }
      } else {
        console.log('Location permission for bluetooth scanning revoked -=> ' + granted);
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  const findNuvIoTDevices = async () => {
    let idx = 1;
    setIsScanning(true);
    let newDevices:BLENuvIoTDevice[] = [];

    for (let peripheral of discoveredPeripherals) {
      setIsBusyMessage(`Loading Device ${idx++} of ${discoveredPeripherals.length}`);
      if (await ble.connectById(peripheral.id, CHAR_UUID_SYS_CONFIG)) {
        let sysConfigStr = await ble.getCharacteristic(peripheral.id, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
        if (sysConfigStr) {
          console.log(sysConfigStr);

          let sysConfig = new SysConfig(sysConfigStr);

          let name = sysConfig.deviceId;
          if (!name || name == '')
            name = peripheral.name!;

          let device: BLENuvIoTDevice = {
            peripheralId: peripheral.id,
            name: name,
            deviceType: sysConfig.deviceModelId,
            provisioned: false,
            orgId: sysConfig.orgId,
            repoId: sysConfig.repoId,
            deviceUniqueId: sysConfig.id,
            id: devices!.length
          }

          if (sysConfig.id && sysConfig.id.length > 0)
            device.provisioned = true;

          newDevices!.push(device);
          setDevices([...newDevices!]);
        }

        await ble.disconnectById(peripheral.id);
      }
    }
    setIsScanning(false);
  }

  const scanningStatusChanged = (isScanning: boolean) => {
    console.log('scanningStatusChanged=>' + isScanning);
    setIsScanning(isScanning);

    if (!isScanning) {
      console.log('scanning finished');
      ble.removeAllListeners('connected');
      ble.removeAllListeners('scanning');
      findNuvIoTDevices();
    }
    else {
      setIsBusyMessage('Scanning for local devices.');
    }
  }

  if (initialCall) {
    ble.peripherals = [];

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

    setInitialCall(false);
  }

  const startScan = async () => {
    console.log(isScanning);
    if (isScanning)
      return;

    setDevices([]);
    
    let newDevices:BLENuvIoTDevice[] = [];

    const permission = Platform.OS == "android" ? await requestLocationPermission() : true;
    if (permission) {
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
          newDevices.push({
            name: item.name!,
            peripheralId: item.id,
            provisioned: idx % 2 == 0,
            id: idx++,
            deviceType: 'BILL0'
          })
        }

        setDevices(newDevices);
        findNuvIoTDevices();
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
      navigation.navigate('devicePage', { id: device.peripheralId });
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

    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()) );
    setSubscription(changed);
    setThemePalette(AppServices.getAppTheme());

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button backgroundColor="transparent" underlayColor="transparent" color="#1976D2" onPress={() => startScan()} name='refresh-outline' />
        </View>
      ),
    });

    const focusSubscription = navigation.addListener('focus', () => {

    });

    const blurSubscription = navigation.addListener('beforeRemove', () => {
      stopScanning();
    });

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
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize:18, flex: 3 }]}>ID: {item.name}</Text>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize:18, flex: 3 }]}>Type: {item.deviceType}</Text>
                </View>
                <Text style={[{ marginLeft:10, color: themePalette.shellTextColor, fontSize:18, flex: 3 }]}>{item.peripheralId}</Text>
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
      <View style={[styles.centeredContent,  {padding:50, backgroundColor: themePalette.background }]}>
        <MciIcon name="radar" style={[styles.centeredIcon]}></MciIcon>
        <TouchableOpacity style={[styles.submitButton]} onPress={() => startScan()}>
          <Text style={[styles.submitButtonText, ]}> Begin Scanning</Text>
        </TouchableOpacity>
      </View>
    }
  </View>
}


