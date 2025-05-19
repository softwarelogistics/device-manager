import { View, Text, ActivityIndicator, Pressable, TouchableOpacity, FlatList, Platform, ScrollView, TextInput } from "react-native";
import { IReactPageServices } from "../services/react-page-services";
import AppServices from "../services/app-services";
import styles from '../styles';
import palettes from "../styles.palettes";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { BLENuvIoTDevice } from "../models/device/device-local";
import { Peripheral } from "react-native-ble-manager";
import { RemoteDeviceState } from "../models/blemodels/state";
import { ble, CHAR_UUID_CAN_MSG, CHAR_UUID_CONSOLE, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { PermissionsHelper } from "../services/ble-permissions";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import { scanUtils } from "../services/scan-utils";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { connectionBlock, panelDetail, sectionHeader, wiFiIcon } from "../mobile-ui-common/PanelDetail";
import { SysConfig } from "../models/blemodels/sysconfig";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { inputLabelStyle, inputStyleWithBottomMargin, placeholderTextColor } from "../compound.styles";

interface SSID {
    idx: number;
    name: string;
    level: number;
}

export const WiFiSetupPage = ({ navigation, props, route }: IReactPageServices) => {
    const themePalette = AppServices.instance.getAppTheme();
    const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined | null>(undefined);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [deviceInfo, setDeviceInfo] = useState<Devices.PublicDeviceInfo | undefined>(undefined);
    const [sysConfig, setSysConfig] = useState<SysConfig | undefined>(undefined);
    const [busyMessage, setBusyMessage] = useState<String>('Busy'); 
    const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
    const [discoveredPeripherals, setDiscoveredPeripherals] = useState<Peripheral[]>([]);
    const [hasPermissions, setHasPermissions] = useState<boolean>(false);
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
    const [pageVisible, setPageVisible] = useState<boolean>(true);
    const [peripheralId, setPeripheralId] = useState<string | undefined>(undefined);
    const [ssids, setSsids] = useState<SSID[]| undefined>(undefined);
    const [selectedSsid, setSelectedSsid] = useState<SSID | undefined>(undefined);
    const [wifiPassword, setWifiPassword] = useState<string | undefined>(undefined);    
    const [isBusy, setIsBusy] = useState<boolean>(false);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const charHandler = async (value: any) => {
        if (value.characteristic == CHAR_UUID_STATE) {
            let rds = new RemoteDeviceState(value.value);
            setRemoteDeviceState(rds);              
        }

        if (value.characteristic == CHAR_UUID_CONSOLE) {
            let msgContent: string = value.value;
            if(msgContent.startsWith("wifi=scanresult;")) {
                var sites = msgContent.split("//");
                let resultSection = sites[1].trim();
                console.log("WiFi Scan Results", resultSection);
                var siteList = resultSection.split(";");
                let ssidList: SSID[] = [];
                let idx = 1;
                for(let site of siteList) {
                    let sections = site.split("=");
                    if(sections.length > 1) {
                        ssidList.push({idx: idx++, name: sections[0], level: parseInt(sections[1]) });
                    }
                }

                setSsids(ssidList);
                setIsBusy(false);
            }       
        }
    }
    
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
            console.log("Found Devices" + discoveredPeripherals.length + " ");
            let newDevices = await scanUtils.getNuvIoTDevices(discoveredPeripherals, devices.length);
            setDevices([...newDevices]);
            setDiscoveredPeripherals(discoveredPeripherals);
            ble.removeAllListeners('connecting');
            ble.removeAllListeners('connected');
            ble.removeAllListeners('scanning');
            setIsScanning(false);
        }
        else {
            setBusyMessage('Scanning for local devices.');
        }
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

   const startScan = async () => {
        ble.peripherals = [];
        setDiscoveredPeripherals([]);
        setSsids(undefined);
        setSelectedSsid(undefined);
        setWifiPassword(undefined);
        setRemoteDeviceState(undefined);

        console.log('[ScanPage__StartScan] Start Scan;');

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
        else {
            console.log('[ScanPage__StartScan] BLE Permissions Not Enabled;');
            setBusyMessage('BLE Permissions Not Enabled');
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

    const setDevice = async (device: BLENuvIoTDevice) => {
        setIsBusy(true);
        setBusyMessage('Connecting to Device');
        await ConnectedDevice.connectAndSubscribe(device.peripheralId, [CHAR_UUID_STATE, CHAR_UUID_CONSOLE], 1)
        setPeripheralId(device.peripheralId);
        let result = await ConnectedDevice.getCharacteristic(device.peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
        if (result) {
            let sysConfig = new SysConfig(result);
            
            let deviceInfo = await AppServices.instance.deviceServices.getPublicDeviceInfo(sysConfig.orgId, sysConfig.repoId, sysConfig.id) ;
            if(deviceInfo) {
                setSysConfig(sysConfig);
                setDeviceInfo(deviceInfo);
                console.log('Device Info', deviceInfo);
            }
            else {
                setDeviceInfo(undefined);
                console.log('Device Info not found');
            }
        } 
        setIsBusy(false);
    }

    const clearDevice = () => {
        ConnectedDevice.disconnect();
        setSsids(undefined);
        setDeviceInfo(undefined);
        setPeripheralId(undefined);
        setRemoteDeviceState(undefined);        
    }

    const wiFiScan = () => {
        setBusyMessage('Scanning for WiFi Hotspots');
        setIsBusy(true);
        ConnectedDevice.writeCharacteristic(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `siteScan=true;`);
    }

    const writeConnectionInfo = async () => {
        if(selectedSsid && wifiPassword) {
           await ble.writeCharacteristic(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${selectedSsid.name};`);
           await ble.writeCharacteristic(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPassword};`); 
           await ble.writeCharacteristic(peripheralId!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `reconnect=true;`); 
        }
    }

    if (initialCall) {
        checkPermissions();
        setInitialCall(false);
        ble.peripherals = [];
        ConnectedDevice.onReceived = (value) => charHandler(value);
        ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
        ConnectedDevice.onDisconnected = () => {
            console.log('Device has disconnected');
            setIsDeviceConnected(false);
            setSsids(undefined);
            setDeviceInfo(undefined);
            setPeripheralId(undefined);
            setRemoteDeviceState(undefined);        
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
            <View style={{ flexDirection: 'row' }} >
                <Icon.Button backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor}  onPress={() => startScan()} name='refresh-outline' />
            </View>
            ),
        });
        
        ConnectedDevice.onReceived = (value) => charHandler(value);
        ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
        ConnectedDevice.onDisconnected = () => setIsDeviceConnected(false);
    
        const focusSubscription = navigation.addListener('focus', async () => {
          setPageVisible(true);
        });
    
        const blurSubscription = navigation.addListener('beforeRemove', async () => {
          if (isDeviceConnected)
            await ConnectedDevice.disconnect();
    
          setPageVisible(false);
        });
    
        return (() => {
          focusSubscription();
          blurSubscription();
        });
    }, [isDeviceConnected]);

    const setSsid = (ssid: SSID) => {
        setSelectedSsid(ssid);
    }

    const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

    const myListEmpty = () => {
        return (
        <View style={{ alignItems: "center" }}>
            <Text style={styles.item}> Could not find any devices. </Text>
        </View>
        );
    };

    return <View style={[styles.container, { padding: 0, backgroundColor: themePalette.background }]}>
     {
      (isScanning || isBusy) &&
      <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={{ fontSize: 25, color: themePalette.shellTextColor }}>{busyMessage}</Text>
        <ActivityIndicator size="large" color={palettes.accent.normal} animating={isScanning || isBusy} />
      </View>
    }
    {
    !isScanning && !remoteDeviceState && devices.length > 0 &&
      <>
        <Text style={{ fontSize: 18, padding: 15, color: themePalette.shellTextColor }}>{devices.length} Device{devices.length === 1 ? '' : 's'} Found</Text>
        <FlatList
          contentContainerStyle={{ alignItems: "stretch" }}
          style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={devices}
          renderItem={({ item }) =>
            <Pressable onPress={() => setDevice(item)} key={item.peripheralId} >
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
       !selectedSsid && ssids && ssids.length > 0 &&
      <>
        <Text style={{ fontSize: 18, padding: 15, color: themePalette.shellTextColor }}>{ssids.length} WiFi Hotspot{ssids.length === 1 ? '' : 's'} Found</Text>
        <FlatList
          contentContainerStyle={{ alignItems: "stretch" }}
          style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={ssids}
          renderItem={({ item }) =>
            <Pressable onPress={() => setSsid(item)} key={item.idx} >
              <View style={[styles.listRow, { padding: 10, marginBottom: 10, height: 50, backgroundColor: themePalette.shell, }]}  >
                <View style={{ flex: 3, flexDirection:'row' }} key={item.idx}>
                  <Text style={[{ color: themePalette.shellTextColor, flex:12, fontSize: 18}]}>{item.name}</Text>
                  {wiFiIcon(item.level)}
                </View>
              </View>
            </Pressable>
          }
        />
      </>
    }
    {
        ssids && ssids.length == 0 && !selectedSsid && 
        <View style={[styles.scrollContainer, { paddingBottom:50, backgroundColor: themePalette.background }]} >
            <Text>No WiFi Connections Available</Text>
        </View>
    }
    {
        selectedSsid && 
            <KeyboardAwareScrollView>
                <View style={{ padding: 20 }}>
                    {remoteDeviceState && <View style={{ marginTop: 8 }} >
                        {sectionHeader('Connectivity')}
                        <View style={{ flexDirection: 'row', marginHorizontal: 8 }} >
                        {connectionBlock('orange', 'bluetooth-outline', 'Bluetooth', true)}
                        {connectionBlock('orange', 'wifi-outline', 'WiFi', remoteDeviceState.wifiStatus == 'Connected')}
                        {connectionBlock('orange', 'cellular-outline', 'Cellular', remoteDeviceState.cellularConnected)}
                        {connectionBlock('orange', 'cloud', 'Cloud', remoteDeviceState.isCloudConnected)}
                        </View>
                    </View>}
        
                    <Text style={inputLabelStyle}>WiFi SSID:</Text>
                    <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Wifi SSID" value={selectedSsid.name} readOnly={true} />

                    <Text style={inputLabelStyle}>WiFi PWD:</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TextInput secureTextEntry={!showPassword} style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter WiFi Password" value={wifiPassword} onChangeText={e => setWifiPassword(e)} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} >
                            <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={themePalette.shellTextColor} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.submitButton]} onPress={() => writeConnectionInfo()}>
                        <Text style={[styles.submitButtonText,]}> Connect</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.submitButton]} onPress={() => setSelectedSsid(undefined)}>
                        <Text style={[styles.submitButtonText,]}> Cancel</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
    }
    {
    remoteDeviceState && !ssids &&
     <ScrollView style={[styles.scrollContainer, { paddingBottom:50, backgroundColor: themePalette.background }]} >
        <View > 
            <TouchableOpacity style={[styles.submitButton, {width: 30, marginBottom:50}]} onPress={() => wiFiScan()}>
                   <Icon style={{ textAlign: 'center', }} size={48} color="white" name="wifi-outline" />
            </TouchableOpacity>
            {
                sysConfig && deviceInfo && 
                <View> 
                    {sectionHeader('Device Information')}
                    {panelDetail('purple', "Name", deviceInfo?.deviceName)}
                    {panelDetail('purple', "Customer", deviceInfo?.customer.text)}
                    {panelDetail('purple', "Type", deviceInfo?.deviceType.text)}
                    {panelDetail('purple', "Firmware", deviceInfo?.deviceFirmware.text)}
                    {panelDetail('purple', "Desired Firmware Rev", deviceInfo?.deviceFirmwareRevision.text)}
                </View>
            }
    
            <View style={{ marginTop: 24 }}>
                {sectionHeader('Current Device Status')}
                {panelDetail('green', 'Device Model', remoteDeviceState.deviceModelKey)}
                {panelDetail('green', 'Hardware Rev', remoteDeviceState.hardwareRevision)}
                {panelDetail('green', 'Firmware SKU', remoteDeviceState.firmwareSku)}
                {panelDetail('green', 'Firmware Rev', remoteDeviceState.firmwareRevision)}
                {panelDetail('green', 'Commissioned', remoteDeviceState.commissioned ? 'Yes' : 'No')}
            </View>
            <View style={{ marginTop: 8 }} >
                {sectionHeader('Connectivity')}
                <View style={{ flexDirection: 'row', marginHorizontal: 8 }} >
                {connectionBlock('orange', 'bluetooth-outline', 'Bluetooth', true)}
                {connectionBlock('orange', 'wifi-outline', 'WiFi', remoteDeviceState.wifiStatus == 'Connected')}
                {connectionBlock('orange', 'cellular-outline', 'Cellular', remoteDeviceState.cellularConnected)}
                {connectionBlock('orange', 'cloud', 'Cloud', remoteDeviceState.isCloudConnected)}
                </View>
            </View>
        </View>
         <TouchableOpacity style={[styles.submitButton, {marginBottom:50}]} onPress={() => clearDevice()}>
          <Text style={[styles.submitButtonText,]}> Done</Text>
        </TouchableOpacity>
    </ScrollView>
    }
    {
      !isScanning && !remoteDeviceState && devices.length <= 0 &&
      <View style={[styles.centeredContent, { padding: 50, backgroundColor: themePalette.background }]}>
        <MciIcon name="radar" style={[styles.centeredIcon]}></MciIcon>
        <TouchableOpacity style={[styles.submitButton]} onPress={() => startScan()}>
          <Text style={[styles.submitButtonText,]}> Find Devices</Text>
        </TouchableOpacity>
      </View>
    }
   </View>
}
