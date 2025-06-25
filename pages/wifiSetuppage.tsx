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
import { connectionBlock, panelDetail, sectionHeader, wiFiIcon, h1, h2, h1Centered,h2Centered } from "../mobile-ui-common/PanelDetail";
import { SysConfig } from "../models/blemodels/sysconfig";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { inputLabelStyle, inputStyleWithBottomMargin, placeholderTextColor } from "../compound.styles";
import WebLink from "../mobile-ui-common/web-link";
import { AppLogo } from "../mobile-ui-common/AppLogo";
import { center } from "@shopify/react-native-skia";

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
    const [showWelcome, setShowWelcome] = useState<boolean>(true);

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
            console.log(sysConfig);
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
           alert('WiFi Connection Information Sent to Device, please wait for the device to connect to the WiFi Hotspot');
        }
    }

    if (initialCall) {
        checkPermissions();
        setInitialCall(false);
        ble.peripherals = [];
        ConnectedDevice.onReceived = (value) => charHandler(value);
        ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
        ConnectedDevice.onDisconnected = () => {
            alert('Disconnected from device');
            setIsDeviceConnected(false);
            setSsids(undefined);
            setDeviceInfo(undefined);
            setPeripheralId(undefined);
            setRemoteDeviceState(undefined);        
            setSelectedSsid(undefined);
            setWifiPassword(undefined);
        }
    }

    useEffect(() => {
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
     { showWelcome &&
         <View style={[styles.spinnerView, {paddingTop:30, backgroundColor: themePalette.background }]}>
            <AppLogo />
            {h2Centered('WiFi Configuration App')}
            {h2Centered('V1.2.0')}
            <Icon name="wifi-outline" style={[styles.centeredIcon]}></Icon>
            <Text style={[{ color: themePalette.shellTextColor, flex:12, fontSize: 18}]}>The WiFi connection helper will connect to your Green Light Alerting, Kool K9 or SeaWolf Marine device to connect it to a WiFi hotspot</Text>
            <View style={{ flex: 12 }}>
            <WebLink url="https://www.software-logistics.com" label="Software Logistics, LLC"  />
            <WebLink url="https://www.nuviot.com" label="NuvIoT"  />
            <WebLink url="https://app.termly.io/document/terms-of-use-for-saas/90eaf71a-610a-435e-95b1-c94b808f8aca" label="Terms and Conditions"  />
            <WebLink url="https://app.termly.io/document/privacy-policy/fb547f70-fe4e-43d6-9a28-15d403e4c720" label="Privacy Statement"  />          
            </View>
                <TouchableOpacity style={[styles.submitButton, {marginBottom:50}]} onPress={() => setShowWelcome(false)}>
            <Text style={[styles.submitButtonText,]}>Get Started!</Text>
        </TouchableOpacity>
        </View>     
     }
     {
      (isScanning || isBusy) &&
      <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={{ fontSize: 25, marginBottom:30, color: themePalette.shellTextColor }}>{busyMessage}</Text>
        <ActivityIndicator size="large" color={palettes.accent.normal} animating={isScanning || isBusy} />
      </View>
    }
    {
    !isScanning && !remoteDeviceState && devices.length > 0 &&
      <>
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: themePalette.background }}>        
        <Icon size={36}  color={themePalette.accentColor}  onPress={() => setDevices([])} name='chevron-back-outline' />
        <Text style={{ flex:1, fontSize: 28, fontWeight:500,  color: themePalette.accentColor }}>{devices.length} Device{devices.length === 1 ? '' : 's'} Found</Text>
        <Icon size={36} color={themePalette.accentColor}  onPress={() => startScan()} name='refresh-outline' />
       </View>

        <FlatList
          contentContainerStyle={{ alignItems: "stretch" }}
          style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={devices}
          renderItem={({ item }) =>
            <Pressable onPress={() => setDevice(item)} key={item.peripheralId} >
              <View style={[styles.listRow, { padding: 10, marginBottom: 10, height: 60, backgroundColor: themePalette.shell, }]}  >
                <Icon style={{ fontSize: 40, color: palettes.primary.normal }} name='hardware-chip-outline' />
                <View style={{ flex: 3 }} key={item.peripheralId}>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, marginLeft:15, marginTop:8, fontSize: 18, flex: 3 }]}>{item.name}</Text>
                </View>
                <Icon style={{ fontSize: 40, color: palettes.primary.normal }} name='chevron-forward-outline' />
              </View>
            </Pressable>
          }
        />
      </>
    }
    {
       !selectedSsid && ssids && ssids.length > 0 &&
      <>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: themePalette.background }}>        
            <Icon size={36}  color={themePalette.accentColor}  onPress={() => setSsids(undefined)} name='chevron-back-outline' />
            <Text style={{ flex:1, fontSize: 28, fontWeight:500,  color: themePalette.accentColor }}>{ssids.length} WiFi Hotspot{ssids.length === 1 ? '' : 's'} Found</Text>
            <Icon size={36} color={themePalette.accentColor}  onPress={() => wiFiScan()} name='refresh-outline' />
        </View>
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
                        <TextInput secureTextEntry={!showPassword} style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter WiFi Password"
                            value={wifiPassword} onChangeText={e => setWifiPassword(e)} />
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
        <View> 
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15, paddingBottom:15, backgroundColor: themePalette.background }}>        
                <Icon size={36}  color={themePalette.accentColor}  onPress={() => clearDevice()} name='chevron-back-outline' />
                <Text style={{ flex:1, fontSize: 28, fontWeight:500,  color: themePalette.accentColor }}>Device Information</Text>
                <Icon size={36} color={themePalette.accentColor}  onPress={() => wiFiScan()} name='wifi-outline' />
            </View>
            {
                sysConfig && deviceInfo && 
                <View> 
                    {panelDetail('purple', "Name", deviceInfo.deviceName)}
                    {deviceInfo.customer && panelDetail('purple', "Customer", deviceInfo.customer.text)}
                    {deviceInfo.deviceType && panelDetail('purple', "Type", deviceInfo.deviceType.text)}
                    {deviceInfo.deviceFirmware &&  panelDetail('purple', "Firmware", deviceInfo.deviceFirmware.text)}
                    {deviceInfo.deviceFirmwareRevision && panelDetail('purple', "Desired Firmware Rev", deviceInfo.deviceFirmwareRevision.text)}
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
            <View style={{ marginTop: 8, marginBottom:60 }} >
                {sectionHeader('Connectivity')}
                <View style={{ flexDirection: 'row', marginHorizontal: 8 }} >
                {connectionBlock('orange', 'bluetooth-outline', 'Bluetooth', true)}
                {connectionBlock('orange', 'wifi-outline', 'WiFi', remoteDeviceState.wifiStatus == 'Connected')}
                {connectionBlock('orange', 'cellular-outline', 'Cellular', remoteDeviceState.cellularConnected)}
                {connectionBlock('orange', 'cloud', 'Cloud', remoteDeviceState.isCloudConnected)}
                </View>
            </View>
        </View>
    </ScrollView>
    }
    {
      !showWelcome && !isScanning && !remoteDeviceState && devices.length <= 0 &&
      <View style={[styles.centeredContent, { padding: 50, backgroundColor: themePalette.background }]}>
        <Text  style={[{ margin:30, color: themePalette.shellTextColor,  fontSize: 18}]}>Press Find Devices to locate any Green Light Alerting, Kool K9 or SeaWolf Marine devices in the range of your phone.</Text>
        <TouchableOpacity style={[styles.submitButton]} onPress={() => startScan()}>
          <Text style={[styles.submitButtonText,]}> Find Devices</Text>
        </TouchableOpacity>
        <MciIcon name="radar" style={[styles.centeredIcon]}></MciIcon>
      </View>
    }
   </View>
}
