import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { ActionSheetIOS, TouchableOpacity, ScrollView, View, Text, TextInput, ActivityIndicator, TextStyle, ViewStyle, Platform, Switch, Alert, ActionSheetIOSOptions } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-ios-kit';

import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { SysConfig } from "../models/blemodels/sysconfig";
import { RemoteDeviceState } from "../models/blemodels/state";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

import ViewStylesHelper from "../utils/viewStylesHelper";
import { ThemePalette } from "../styles.palette.theme";
import colors from "../styles.colors";
import styles from '../styles';
import palettes from "../styles.palettes";
import Page from "../mobile-ui-common/page";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import EditField from "../mobile-ui-common/edit-field";
import { NetworkCallStatusService } from "../services/network-call-status-service";
import { useFocusEffect } from "@react-navigation/native";

export default function ProvisionPage({ navigation, route }: IReactPageServices) {
  
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
    
  const [deviceModels, setDeviceModels] = useState<Devices.DeviceTypeSummary[]>([])
  const [selectedDeviceModel, setSelectedDeviceModel] = useState<Devices.DeviceTypeSummary | undefined>();
  
  const [repos, setRepos] = useState<Devices.DeviceRepoSummary[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Devices.DeviceRepoSummary | undefined>();

  const [wifiConnections, setWiFiConnections] = useState<Deployment.WiFiConnectionProfile[] | undefined>(undefined);
  const [selectedWiFiConnection, setSelectedWiFiConnection] = useState<Deployment.WiFiConnectionProfile | undefined>(undefined);


  const [deviceId, setDeviceId] = useState<string>();
  const [deviceName, setDeviceName] = useState<string>();
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [sysConfig, setSysConfig] = useState<SysConfig>();
  const [busyMessage, setBusyMessage] = useState<String>("Is Busy");
  const [commissioned, setCommissioned] = useState<boolean>(false);

  const [defaultListener, setDefaultListener] = useState<PipelineModules.ListenerConfiguration | undefined>(undefined);
  const [useDefaultListener, setUseDefaultListener] = useState<boolean>(false);

  const themePalette = AppServices.instance.getAppTheme();
  const peripheralId = route.params.id;

  const inputStyleOverride = {
    backgroundColor: themePalette.inputBackgroundColor,
    borderColor: palettes.gray.v80,
    color: themePalette.shellTextColor,
    marginBottom: 20,
    paddingLeft: 4
  };
  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: themePalette.shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400') }]);
  const primaryButtonTextStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, { color: themePalette.buttonPrimaryText }]);

  const loadSysConfigAsync = async (deviceTypes: Devices.DeviceTypeSummary[]) => {

    if (await ble.connectById(peripheralId, CHAR_UUID_SYS_CONFIG)) {
      let sysConfigStr = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
      if (sysConfigStr) {
        let sysConfig = new SysConfig(sysConfigStr);
        console.log(sysConfigStr);
        console.log('ORGID -> ' + sysConfig?.orgId);
        console.log('REPOID -> ' + sysConfig?.repoId);
        console.log('ID -> ' + sysConfig?.id);
        setSysConfig(sysConfig);
      }

      let sysState = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      if (sysState) {
        let state = new RemoteDeviceState(sysState);
        if (state) {
          let deviceModel = deviceTypes.find(dvt => dvt.key == state.deviceModelKey);
          console.log(deviceModel);
          setSelectedDeviceModel(deviceModel);
          console.log('Device Model -> ' + state.deviceModelKey);

        }
      }

      await ble.disconnectById(peripheralId);
    }
  }

  const setIsBusy = (value: boolean) => {
    if (value) {
      NetworkCallStatusService.beginCall(busyMessage);
    }
    else{
      NetworkCallStatusService.endCall();
    }
  }

  const load = async () => {
    setBusyMessage("Loading Repositories");
    let repos = (await AppServices.instance.deviceServices.loadDeviceRepositories()).model!;
    setSelectedRepo(repos.find(rep => rep.id == route.params.repoId));
    repos.unshift({ id: "-1", key: 'select', name: '-select-', isPublic: false, description: '', repositoryType: '' });

    setRepos(repos);
    setBusyMessage("Loading Device Models");
    let deviceTypes = await AppServices.instance.deviceServices.getDeviceTypesForInstance(route.params.instanceId);
    deviceTypes.unshift({ id: "cancel", key: 'cancel', name: 'Cancel', description: '' });
    setDeviceModels(deviceTypes);

    setBusyMessage("Loading System Configuration.");
    loadSysConfigAsync(deviceTypes);

    setBusyMessage("Loading Connection Profiles");
    let result = await AppServices.instance.deploymentServices.LoadWiFiConnectionProfiles(route.params.repoId);
    if(!result) {
      result = [];
    }

    result.unshift({ id: 'cellular', key: 'cellular', name: 'Cellular', ssid: '', password: '', description: '' });
    result.unshift({ id: 'none', key: 'none', name: 'No Connection', ssid: '', password: '', description: '' });
    if(Platform.OS === 'ios') 
      result.unshift({ id: 'cancel', key: 'cancel', name: 'Cancel', ssid: '', password: '', description: '' });

    setWiFiConnections(result);

    setBusyMessage("Loading Server Information");
    let defaultListener = await AppServices.instance.deploymentServices.LoadDefaultListenerForRepo(route.params.repoId);
    if (defaultListener.successful) {
      setDefaultListener(defaultListener.result);       
      console.log(defaultListener.result);
    }

    setIsReady(true);
  }

  const factoryReset = async () => {
    setIsBusy(true);
    if (await ble.connectById(peripheralId)) {
      await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `factoryreset=1`);
      await ble.disconnectById(peripheralId);
      setIsBusy(false);
      await alert('Success resetting device to factory defaults.');
      navigation.replace('homePage');
    }
    else {
      setIsBusy(false);
      alert('Could not reset device.');
      console.warn('could not connect');
    }
  }

  const provisionDevice = async (replace: boolean): Promise<String> => {
    if (!selectedRepo || selectedRepo.id === "-1") {
      alert('Please select a device repository.');
      return "VALIDATION";
    }

    if (!selectedDeviceModel || selectedDeviceModel.id === "-1") {
      alert('Please select a device model.');
      return "VALIDATION";
    }

    if (!deviceName) {
      alert('Device Name is required.');
      return "VALIDATION";
    }

    if (!deviceId) {
      alert('Device Id is required.');
      return "VALIDATION";
    }

    setBusyMessage('Provisioning device on the server.');
    setIsBusy(true);
    let newDevice = await AppServices.instance.deviceServices.createDevice(selectedRepo!.id)
    console.log(deviceName, deviceId);
    newDevice.deviceType = { id: selectedDeviceModel!.id, key: selectedDeviceModel!.key, text: selectedDeviceModel!.name };
    newDevice.deviceConfiguration = { id: selectedDeviceModel!.defaultDeviceConfigId!, key: '', text: selectedDeviceModel!.defaultDeviceConfigName! };
    newDevice.deviceId = deviceId!;
    newDevice.name = deviceName!;

    if (Platform.OS === 'ios')
      newDevice.iosBLEAddress = peripheralId;
    else
      newDevice.macAddress = peripheralId;

    let result = await AppServices.instance.deviceServices.addDevice(newDevice, replace, false);
    if (result.successful) {
      newDevice = result.result;
      if (await ble.connectById(peripheralId)) {
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'deviceid=' + deviceId);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'orgid=' + newDevice.ownerOrganization.id);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'repoid=' + newDevice.deviceRepository.id);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'id=' + newDevice.id);


        if (selectedWiFiConnection && selectedWiFiConnection.key !== 'none') {
          if (selectedWiFiConnection.key == 'cellular') {
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=1');
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=0');
          }
          else {
            let connection = wifiConnections?.find(wifi => wifi.id == selectedWiFiConnection.id);
            if (connection) {
              await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=1');
              await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=0');
              await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${connection.ssid}`);
              await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${connection.password}`);
            }
          }
        }

        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0'));

        if (useDefaultListener && defaultListener) {
          await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${defaultListener.hostName}`);
          let port = defaultListener.listenOnPort ? defaultListener.listenOnPort : defaultListener.connectToPort;
          await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${port}`);
          if (defaultListener.userName) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `uid=${defaultListener.userName}`);
          if (defaultListener.password) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `pwd=${defaultListener.password}`);

          if (defaultListener.listenerType.id == 'mqttbroker' ||
            defaultListener.listenerType.id == 'sharedmqttlistener' ||
            defaultListener.listenerType.id == 'mqttlistener' ||
            defaultListener.listenerType.id == 'mqttclient')
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `srvrtype=mqtt`);
          else if (defaultListener.listenerType.id == 'sharedrest' ||
            defaultListener.listenerType.id == 'rest')
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `srvrtype=rest`);
        }

        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'reboot=1');

        await ble.disconnectById(peripheralId);
      }
      setIsBusy(false);

      return "OK";      
    }
    else {
      setIsBusy(false);
      return result.errors[0].errorCode!;
    }
  }

  const getOptions = (options: string[]) : ActionSheetIOSOptions => {
    return {
      options: options,
      cancelButtonIndex: 0,
      userInterfaceStyle: themePalette.name == 'dark'  ? 'dark': 'light',
    }
  }

  const selectRepo = () =>  {
    ActionSheetIOS.showActionSheetWithOptions(getOptions(repos.map(item => item.name)),
    buttonIndex => {
         if (buttonIndex > 0 ) {
          setSelectedRepo(repos[buttonIndex])          
        }
      })
  };

  const selectDeviceModel = () =>  {
    ActionSheetIOS.showActionSheetWithOptions(getOptions(deviceModels.map(item => item.name)),
    buttonIndex => {
         if (buttonIndex > 0 ) {
          let dm = deviceModels[buttonIndex];
          console.log(deviceModels);
          console.log(dm);          
          setSelectedDeviceModel(dm);

        }
      })
  };

  const selectWiFiConnections= () =>  {
    if(wifiConnections == undefined) return;

    ActionSheetIOS.showActionSheetWithOptions(getOptions(wifiConnections.map(item => item.name)),
    buttonIndex => {
         if (buttonIndex > 0 ) {
          setSelectedWiFiConnection(wifiConnections![buttonIndex]);
        }
      })
  };


  const callProvisionDevice = async () => {
    let result = await provisionDevice(false);
    if (result == "DM1001") {
      Alert.alert(`Device Exists`, `A device with the id ${deviceId} already exists, would you like to replace it?`,
        [{
          text: 'YES', onPress: async () => {
            let result = await provisionDevice(true);
            if (result === 'OK') {
              alert('Success provisioning device.');
              navigation.goBack();
            }
          }
        },
        {
          text: 'NO'
        }]);
    }
    else {
      if (result === 'OK') {
        alert('Success provisioning device.');
        navigation.goBack();
      }
    }

  }

  const init = async () => {
    setIsBusy(true);
    await load();
    setIsBusy(false);    
  }

  const deviceTypeChanged = async (id: string) => {
    console.log(id)
    setSelectedDeviceModel(deviceModels.find(dt => dt.id == id));
  }

  const repoChanged = async (id: string) => {
    let repo = repos.find(rp => rp.id == id);
    setSelectedRepo(repo);
  }

  useFocusEffect(() => {
    init();
    NetworkCallStatusService.reset();
    setInitialCall(false);      
  });

  useEffect(() => {
    return (() => {
    });

  }, []);

  return (
    
    <Page>
      <StatusBar style="auto" />
      {isReady &&
        <ScrollView>
          <View style={[styles.scrollContainer, { backgroundColor: themePalette.background }]}>

            <Text style={inputLabelStyle}>Repositories:</Text>

            {Platform.OS == 'ios' && selectedRepo && <Button style={{ color: themePalette.shellTextColor, margin:20 }} inline  onPress={() => selectRepo()} >{selectedRepo.name}</Button> }
            {Platform.OS == 'ios' && !selectedRepo && <Button style={{ color: themePalette.shellTextColor, margin:20 }} inline onPress={() => selectRepo()} >-select device repository-</Button> }
            {Platform.OS != 'ios' && 
            <Picker selectedValue={selectedRepo?.id} onValueChange={repoChanged}  itemStyle={{color:themePalette.shellTextColor}} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
              {repos.map(itm =>
                <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }}  />
              )}
            </Picker>
            }

            <Text style={inputLabelStyle}>Device Models:</Text>
            {Platform.OS == 'ios' && selectedDeviceModel && <Button style={{ color: themePalette.shellTextColor, margin:20 }} inline  onPress={() => selectDeviceModel()} >{selectedDeviceModel.name}</Button> }
            {Platform.OS == 'ios' && !selectedDeviceModel && <Button style={{ color: themePalette.shellTextColor, margin:20 }} inline onPress={() => selectDeviceModel()} >-select device model-</Button> }
            {Platform.OS != 'ios' &&             
              <Picker selectedValue={selectedDeviceModel?.id} onValueChange={deviceTypeChanged} itemStyle={{color:themePalette.shellTextColor}} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
                {deviceModels.map(itm =>
                  <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }}  />
                )}
              </Picker>
            }

            <EditField label="Device Name" value={deviceName} placeHolder="enter device name" onChangeText={e => setDeviceName(e)} />
            <EditField label="Device Id" value={deviceId} placeHolder="enter device id" onChangeText={e => setDeviceId(e)} />

            <Text style={inputLabelStyle}>WiFi Connection:</Text>
            {Platform.OS == 'ios' && selectedWiFiConnection && <Button style={{ color: themePalette.shellTextColor, margin:20 }} inline onPress={() => selectWiFiConnections()} >{selectedWiFiConnection.name}</Button> }
            {Platform.OS == 'ios' && !selectedWiFiConnection && <Button style={{ color: themePalette.shellTextColor, margin:20 }} inline onPress={() => selectWiFiConnections()} >-select wifi connection-</Button> }
            {Platform.OS != 'ios' && 
            <Picker selectedValue={selectedWiFiConnection} onValueChange={e => setSelectedWiFiConnection(e)} itemStyle={{color:themePalette.shellTextColor}} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
              {wifiConnections?.map(itm =>
                <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }}  />
              )}
            </Picker>
            }

            <View style={styles.flex_toggle_row}>
              <Text style={inputLabelStyle}>Use Default Listener:</Text>
              <Switch onValueChange={e => setUseDefaultListener(e)} value={useDefaultListener}
                thumbColor={(colors.primaryColor)}
                trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
            </View>

            <View style={styles.flex_toggle_row}>
              <Text style={inputLabelStyle}>Commissioned:</Text>
              <Switch onValueChange={e => setCommissioned(e)} value={commissioned}
                thumbColor={(colors.primaryColor)}
                trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
            </View>

            <TouchableOpacity style={[styles.submitButton, { marginTop: 10, backgroundColor: palettes.primary.normal }]} onPress={() => callProvisionDevice()}>
              <Text style={primaryButtonTextStyle}> Provision </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      }
    </Page>
  )
}