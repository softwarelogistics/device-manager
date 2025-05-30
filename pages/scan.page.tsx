import React, { useState, useEffect } from "react";
import { Text, Platform, View, TouchableOpacity, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble } from '../NuvIoTBLE'

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

export default function ScanPage({ navigation, props, route }: IReactPageServices) {
  const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
  const [discoveredPeripherals, setDiscoveredPeripherals] = useState<Peripheral[]>([]);

  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [busyMessage, setBusyMessage] = useState<String>('Busy');
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [currentOrgId, setCurrentOrgId] = useState<string>('');
  
  const themePalette = AppServices.instance.getAppTheme();
  const deviceRepoId = route.params.repoId;
  const instanceId = route.params.instanceId;
  const customerId = route.params.customerId;
  const customerLocationId = route.params.customerLocationId;

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

  const showDevice = async (device: BLENuvIoTDevice) => {
    console.log(device);
    if (device.provisioned)
      navigation.navigate('liveDevicePage', { id: device.peripheralId, owned: device.orgId == currentOrgId, instanceRepoId: deviceRepoId, deviceRepoId: device.repoId, deviceId: device.deviceUniqueId, instanceId: route.params.instanceId});
    else
      navigation.navigate('provisionPage', { id: device.peripheralId, customerId: customerId, customerLocationId: customerLocationId, repoId: deviceRepoId, instanceId: instanceId });
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

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor}  onPress={() => startScan()} name='refresh-outline' />
        </View>
      ),
    });

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
                {item.provisioned && <Icon style={{ fontSize: 48, color: 'green' }} name='information-outline' />}
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


