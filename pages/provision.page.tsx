import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, TextInput, ActivityIndicator, TextStyle, ViewStyle, Platform, Switch } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Device } from "react-native-ble-plx";

import Icon from "react-native-vector-icons/Ionicons";

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

export default function ProvisionPage({ navigation, route }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());

  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [repos, setRepos] = useState<Devices.DeviceRepoSummary[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<Devices.DeviceTypeSummary[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Devices.DeviceRepoSummary | undefined>();
  const [selectedDeviceModel, setSelectedDeviceModel] = useState<Devices.DeviceTypeSummary | undefined>();
  const [deviceId, setDeviceId] = useState<string>();
  const [deviceName, setDeviceName] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [sysConfig, setSysConfig] = useState<SysConfig>();
  const [commissioned, setCommissioned] = useState<boolean>(false);

  const [selectedWiFiConnection, setSelectedWiFiConnection] = useState<string | undefined>(undefined);
  const [wifiConnections, setWiFiConnections] = useState<Deployment.WiFiConnectionProfile[] | undefined>(undefined);
  const [defaultListener, setDefaultListener] = useState<PipelineModules.ListenerConfiguration | undefined>(undefined);
  const [useDefaultListener, setUseDefaultListener] = useState<boolean>(false);

  const peripheralId = route.params.id;

  const inputStyleOverride = {
    backgroundColor: AppServices.getAppTheme().inputBackgroundColor,
    borderColor: palettes.gray.v80,
    color: AppServices.getAppTheme().shellTextColor,
    marginBottom: 20,
    paddingLeft: 4
  };
  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: AppServices.getAppTheme().shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400') }]);
  const primaryButtonTextStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, { color: themePalette.buttonPrimaryText }]);

  const loadSysConfigAsync = async (deviceTypes: Devices.DeviceTypeSummary[]) => {
    console.log('loading sys config.');
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

  const load = async () => {
    let repos = await appServices.deviceServices.loadDeviceRepositories();
    setSelectedRepo(repos.find(rep => rep.id == route.params.repoId));
    repos.unshift({ id: "-1", key: 'select', name: '-select-', isPublic: false, description: '', repositoryType: '' });
    setRepos(repos);
    let deviceTypes = await appServices.deviceServices.getDeviceTypes();
    deviceTypes.unshift({ id: "-1", key: 'select', name: '-select-', description: '' });
    setDeviceTypes(deviceTypes);
    loadSysConfigAsync(deviceTypes);

    let result = await appServices.deploymentServices.LoadWiFiConnectionProfiles(route.params.repoId);
    console.log(result);
    result.unshift({ id: 'cellular', key: 'cellular', name: 'Cellular', ssid: '', password: '', description: '' });
    result.unshift({ id: 'none', key: 'none', name: 'No Connection', ssid: '', password: '', description: '' });
    setWiFiConnections(result);

    let defaultListener = await appServices.deploymentServices.LoadDefaultListenerForRepo(route.params.repoId);
    if(defaultListener.successful)
      setDefaultListener(defaultListener.result);
    console.log(defaultListener.result.userName, defaultListener.result.password, defaultListener.result.hostName, defaultListener.result.connectToPort, defaultListener.result.listenerType.id);
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

  const provisionDevice = async () => {
    if (!selectedRepo || selectedRepo.id === "-1") {
      alert('Please select a device repository.');
      return;
    }

    if (!selectedDeviceModel || selectedDeviceModel.id === "-1") {
      alert('Please select a device model.');
      return;
    }

    if (!deviceName) {
      alert('Device Name is required.');
      return;
    }

    if (!deviceId) {
      alert('Device Id is required.');
      return;
    }

    setIsBusy(true);
    let newDevice = await appServices.deviceServices.createDevice(selectedRepo!.id)
    console.log(deviceName, deviceId);
    newDevice.deviceType = { id: selectedDeviceModel!.id, key: selectedDeviceModel!.key, text: selectedDeviceModel!.name };
    newDevice.deviceConfiguration = { id: selectedDeviceModel!.defaultDeviceConfigId!, key: '', text: selectedDeviceModel!.defaultDeviceConfigName! };
    newDevice.deviceId = deviceId!;
    newDevice.name = deviceName!;

    if (Platform.OS === 'ios')
      newDevice.iosBLEAddress = peripheralId;
    else
      newDevice.macAddress = peripheralId;

    let result = await appServices.deviceServices.addDevice(newDevice);
    if (result.successful) {
      setIsBusy(true);
      if (await ble.connectById(peripheralId)) {
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'deviceid=' + deviceId);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'orgid=' + newDevice.ownerOrganization.id);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'repoid=' + newDevice.deviceRepository.id);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'id=' + newDevice.id);
        

        if (selectedWiFiConnection && selectedWiFiConnection !== 'cellular' && selectedWiFiConnection !== 'none') {
          let connection = wifiConnections?.find(wifi => wifi.id == selectedWiFiConnection);
          if (connection) {
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${connection.ssid}`);
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${connection.password}`);
          }
        }

        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0'));

        if (useDefaultListener && defaultListener) {
          await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${defaultListener.hostName}`);
          await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${defaultListener.connectToPort}`);
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

      alert('Success provisioning device.');
      navigation.goBack();
    }
    else {
      setIsBusy(false);
      alert(`Could not provision device: ${result.errors[0].message}`);
    }
  }

  const init = async () => {
    appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) })
    appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) })

    setIsBusy(true);
    await load();
    setIsBusy(false);
  }

  const deviceTypeChanged = async (id: string) => {
    console.log(id)
    setSelectedDeviceModel(deviceTypes.find(dt => dt.id == id));
  }

  const repoChanged = async (id: string) => {
    let repo = repos.find(rp => rp.id == id);
    setSelectedRepo(repo);
  }

  useEffect(() => {
    if (initialCall) {
      init();
      setInitialCall(false);
    }

    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);

    return (() => {
      if (subscription) AppServices.themeChangeSubscription.remove(subscription);
    });

  }, []);

  return (
    <Page>
      <ScrollView>
        <StatusBar style="auto" />
        {
          isBusy &&
          <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
            <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Please Wait</Text>
            <ActivityIndicator size="large" color={colors.accentColor} animating={isBusy} />
          </View>
        }
        {!isBusy &&
          <View style={[styles.scrollContainer, { backgroundColor: AppServices.getAppTheme().background }]}>

            <Text style={inputLabelStyle}>Repositories:</Text>
            <Picker selectedValue={selectedRepo?.id} onValueChange={repoChanged} style={{ height: 12 }} itemStyle={{ height: 12 }} >
              {repos.map(itm =>
                <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ height: 12, color: themePalette.shellTextColor, backgroundColor: themePalette.inputBackground }} />
              )}
            </Picker>

            <Text style={inputLabelStyle}>Device Models:</Text>
            <Picker selectedValue={selectedDeviceModel?.id} onValueChange={deviceTypeChanged} >
              {deviceTypes.map(itm =>
                <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.inputBackground, height: 10 }} />
              )}
            </Picker>

            <EditField label="Device Name" placeHolder="enter device name" onChangeText={e => setDeviceName(e)} />
            <EditField label="Device Id" placeHolder="enter device id" onChangeText={e => setDeviceId(e)} />

            <Text style={inputLabelStyle}>WiFi Connection:</Text>
            <Picker selectedValue={selectedWiFiConnection} onValueChange={e => setSelectedWiFiConnection(e)} >
              {wifiConnections?.map(itm =>
                <Picker.Item key={itm.id} label={itm.name} value={itm.id} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.inputBackground, height: 10 }} />
              )}
            </Picker>


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

            <TouchableOpacity style={[styles.submitButton, { marginTop: 10, backgroundColor: palettes.primary.normal }]} onPress={() => provisionDevice()}>
              <Text style={primaryButtonTextStyle}> Save </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.submitButton, { marginTop: 50, backgroundColor: palettes.alert.error }]} onPress={() => factoryReset()}>
              <Text style={primaryButtonTextStyle}> Factory Reset </Text>
            </TouchableOpacity>
          </View>
        }
      </ScrollView>
    </Page>
  )
}