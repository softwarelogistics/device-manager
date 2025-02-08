import React, { useState, useEffect } from "react";
import { ActionSheetIOS, TouchableOpacity, ScrollView, View, Text, TextInput, ActivityIndicator, TextStyle, ViewStyle, Platform, Switch, Alert, ActionSheetIOSOptions } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-ios-kit';

import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { SysConfig } from "../models/blemodels/sysconfig";
import { RemoteDeviceState } from "../models/blemodels/state";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

import colors from "../styles.colors";
import styles from '../styles';
import palettes from "../styles.palettes";
import Page from "../mobile-ui-common/page";
import EditField from "../mobile-ui-common/edit-field";
import { NetworkCallStatusService } from "../services/network-call-status-service";
import { LogWriter, showError } from "../mobile-ui-common/logger";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import { inputLabelStyle, primaryButtonTextStyle } from "../compound.styles";
import { busyBlock } from "../mobile-ui-common/PanelDetail";

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
  const [busyMessage, setBusyMessage] = useState<String>("Is Busy");
  const [commissioned, setCommissioned] = useState<boolean>(false);

  const [defaultListener, setDefaultListener] = useState<PipelineModules.ListenerConfiguration | undefined>(undefined);
  const [useDefaultListener, setUseDefaultListener] = useState<boolean>(false);

  const themePalette = AppServices.instance.getAppTheme();
  const peripheralId = route.params.id;
  const repoId = route.params.repoId;
  const instanceId = route.params.instanceId;
  const customerId = route.params.customerId;
  const customerLocationId = route.params.customerLocationId;


  const loadSysConfigAsync = async (deviceTypes: Devices.DeviceTypeSummary[]) => {

    if (await ConnectedDevice.connect(peripheralId)) {
      let sysConfigStr = await ConnectedDevice.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
      if (sysConfigStr) {
        let sysConfig = new SysConfig(sysConfigStr);
        await LogWriter.log('[Provision__loadSysConfigAsync]', `DvcID  => ${sysConfig.deviceId}`)
        await LogWriter.log('[Provision__loadSysConfigAsync]', `OrgID  => ${sysConfig.orgId}`)
        await LogWriter.log('[Provision__loadSysConfigAsync]', `RepoID => ${sysConfig.repoId}`)
        await LogWriter.log('[Provision__loadSysConfigAsync]', `Id     => ${sysConfig.id}`)      
      }

      let sysState = await ConnectedDevice.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      if (sysState) {
        let state = new RemoteDeviceState(sysState);
        if (state) {
          let deviceModel = deviceTypes.find(dvt => dvt.key == state.deviceModelKey);
          setSelectedDeviceModel(deviceModel);
          await LogWriter.log('[Provision__loadSysConfigAsync]', `DvcMod => ${state.deviceModelKey}`)
        }
      }

      await ConnectedDevice.disconnect();
    }
    else {
      showError('Connection Error', 'Could not connect to device to get system configuration.');
    }
  }

  const setIsBusy = (value: boolean) => {
    if (value) {
      NetworkCallStatusService.beginCall(busyMessage);
    }
    else {
      NetworkCallStatusService.endCall();
    }
  }

  const load = async () => {
    setBusyMessage("Loading Repositories");
    let repos = (await AppServices.instance.deviceServices.loadDeviceRepositories()).model!;
    setSelectedRepo(repos.find(rep => rep.id == route.params.repoId));
    repos.unshift({ id: "-1", key: 'select', name: '-select-', isPublic: false, icon:'', description: '', repositoryType: '' });

    setRepos(repos);
    setBusyMessage("Loading Device Models");

    let deviceTypes = await AppServices.instance.deviceServices.getDeviceTypesForInstance(route.params.instanceId);
    deviceTypes.unshift({ id: "cancel", key: 'cancel', name: '-select-', description: '' });
    setDeviceModels(deviceTypes);

    setBusyMessage("Loading System Configuration.");
    loadSysConfigAsync(deviceTypes);

    setBusyMessage("Loading Connection Profiles");
    let result = await AppServices.instance.deploymentServices.LoadWiFiConnectionProfiles(route.params.repoId);
    if (!result) {
      result = [];
    }

    result.unshift({ id: 'cellular', key: 'cellular', name: 'Cellular', ssid: '', password: '', description: '' });
    result.unshift({ id: 'none', key: 'none', name: 'No Connection', ssid: '', password: '', description: '' });
    if (Platform.OS === 'ios')
      result.unshift({ id: 'cancel', key: 'cancel', name: 'Cancel', ssid: '', password: '', description: '' });

    setWiFiConnections(result);

    setBusyMessage("Loading Server Information");
    let defaultListener = await AppServices.instance.deploymentServices.LoadDefaultListenerForRepo(route.params.repoId);
    if (defaultListener.successful) {
      setDefaultListener(defaultListener.result);
    }

    setIsReady(true);
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

    if(customerId) {      
      let customer = await AppServices.instance.businessService.getCustomer(customerId);
      newDevice.customer = {id: customer.model.id, key: customer.model.key, text: customer.model.name};
      if(customerLocationId){
        let location = customer.model.locations.find(loc=>loc.id == customerLocationId);
        if(location) {
          newDevice.customerLocation = {id: location.id, text: location.name };
        }
      }
    }

    if (Platform.OS === 'ios')
      newDevice.iosBLEAddress = peripheralId;
    else
      newDevice.macAddress = peripheralId;

    let result = await AppServices.instance.deviceServices.addDevice(newDevice, replace, false);
    if (result.successful) {
      newDevice = result.result;
      if (await ConnectedDevice.connect(peripheralId)) {
        await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `deviceid=${deviceId};`);
        await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `orgid=${newDevice.ownerOrganization.id};`);
        await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `repoid=${newDevice.deviceRepository.id};`);
        await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `id=${newDevice.id};`);

        if (selectedWiFiConnection && selectedWiFiConnection.key !== 'none') {
          if (selectedWiFiConnection.key == 'cellular') {
            await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=1;');
            await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=0;');
          }
          else {
            let connection = wifiConnections?.find(wifi => wifi.id == selectedWiFiConnection.id);
            if (connection) {
              await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=1;');
              await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=0;');
              await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${connection.ssid};`);
              await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${connection.password};`);
            }
          }
        }
        else {

        }

        await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1;' : '0;'));

        if (useDefaultListener && defaultListener) {
          await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${defaultListener.hostName};`);
          let port = defaultListener.listenOnPort ? defaultListener.listenOnPort : defaultListener.connectToPort;
          await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${port};`);
          if (defaultListener.userName) await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `uid=${defaultListener.userName};`);
          if (defaultListener.password) await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `pwd=${defaultListener.password};`);

          if (defaultListener.listenerType.id == 'mqttbroker' ||
            defaultListener.listenerType.id == 'sharedmqttlistener' ||
            defaultListener.listenerType.id == 'mqttlistener' ||
            defaultListener.listenerType.id == 'mqttclient')
            await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `srvrtype=mqtt;`);
          else if (defaultListener.listenerType.id == 'sharedrest' ||
            defaultListener.listenerType.id == 'rest')
            await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `srvrtype=rest;`);
        }

        await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'reboot=1;');
        await ConnectedDevice.disconnect();
      }
      setIsBusy(false);

      return "OK";
    }
    else {
      setIsBusy(false);
      return result.errors[0].errorCode!;
    }
  }

  const getOptions = (options: string[]): ActionSheetIOSOptions => {
    return {
      options: options,
      cancelButtonIndex: 0,
      userInterfaceStyle: themePalette.name == 'dark' ? 'dark' : 'light',
    }
  }

  const selectRepo = () => {
    ActionSheetIOS.showActionSheetWithOptions(getOptions(repos.map(item => item.name)),
      buttonIndex => {
        if (buttonIndex > 0) {
          setSelectedRepo(repos[buttonIndex])
        }
      })
  };

  const selectDeviceModel = () => {
    ActionSheetIOS.showActionSheetWithOptions(getOptions(deviceModels.map(item => item.name)),
      buttonIndex => {
        if (buttonIndex > 0) {
          let dm = deviceModels[buttonIndex];
          setSelectedDeviceModel(dm);
        }
      })
  };

  const selectWiFiConnections = () => {
    if (wifiConnections == undefined) return;

    ActionSheetIOS.showActionSheetWithOptions(getOptions(wifiConnections.map(item => item.name)),
      buttonIndex => {
        if (buttonIndex > 0) {
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

  const wifiConnectionChanged = async (id: string) => {
    let connection = wifiConnections?.find(wifi => wifi.id == id);
    setSelectedWiFiConnection(connection);
  }

  const deviceTypeChanged = async (id: string) => {
    setSelectedDeviceModel(deviceModels.find(dt => dt.id == id));
  }

  const repoChanged = async (id: string) => {
    let repo = repos.find(rp => rp.id == id);
    setSelectedRepo(repo);
  }

  useEffect(() => {
    console.log(customerId, customerLocationId);
    if (initialCall) {
      init();
      NetworkCallStatusService.reset();
      setInitialCall(false);
    }

    return (() => {
    });

  }, []);

  return (
    <Page>
        <ScrollView>
          {!isReady && busyBlock() }
          {isReady &&
          <View style={[styles.scrollContainer, { backgroundColor: themePalette.background }]}>

            <Text style={inputLabelStyle}>Repositories:</Text>

            {Platform.OS == 'ios' && selectedRepo && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectRepo()} >{selectedRepo.name}</Button>}
            {Platform.OS == 'ios' && !selectedRepo && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectRepo()} >-select device repository-</Button>}
            {Platform.OS != 'ios' &&
              <Picker selectedValue={selectedRepo?.id} onValueChange={repoChanged} itemStyle={{ color: themePalette.shellTextColor }} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
                {repos.map(itm =>
                  <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }} />
                )}
              </Picker>
            }

            <Text style={inputLabelStyle}>Device Models:</Text>
            {Platform.OS == 'ios' && selectedDeviceModel && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectDeviceModel()} >{selectedDeviceModel.name}</Button>}
            {Platform.OS == 'ios' && !selectedDeviceModel && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectDeviceModel()} >-select device model-</Button>}
            {Platform.OS != 'ios' &&
              <Picker selectedValue={selectedDeviceModel?.id} onValueChange={deviceTypeChanged} itemStyle={{ color: themePalette.shellTextColor }} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
                {deviceModels.map(itm =>
                  <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }} />
                )}
              </Picker>
            }

            <EditField label="Device Name" value={deviceName} placeHolder="enter device name" onChangeText={e => setDeviceName(e)} />
            <EditField label="Device Id" value={deviceId} placeHolder="enter device id" onChangeText={e => setDeviceId(e)} />

            <Text style={inputLabelStyle}>WiFi Connection:</Text>
            {Platform.OS == 'ios' && selectedWiFiConnection && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectWiFiConnections()} >{selectedWiFiConnection.name}</Button>}
            {Platform.OS == 'ios' && !selectedWiFiConnection && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectWiFiConnections()} >-select wifi connection-</Button>}
            {Platform.OS != 'ios' &&
              <Picker selectedValue={selectedWiFiConnection?.id} onValueChange={wifiConnectionChanged} itemStyle={{ color: themePalette.shellTextColor }} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
                {wifiConnections?.map(itm =>
                  <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }} />
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
        }
        </ScrollView>
    </Page>
  )
}