import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, TextInput, ActivityIndicator, TextStyle, ViewStyle } from "react-native";
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
import fontSizes from "../styles.fontSizes";
import Page from "../mobile-ui-common/page";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import EditField from "../mobile-ui-common/edit-field";
import StdButton from "../mobile-ui-common/std-button";

export default function ProvisionPage({ navigation, route }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());

  const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [repos, setRepos] = useState<Devices.DeviceRepoSummary[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<Devices.DeviceTypeSummary[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Devices.DeviceRepoSummary | undefined>();
  const [selectedDeviceType, setSelectedDeviceType] = useState<Devices.DeviceTypeSummary | undefined>();
  const [deviceId, setDeviceId] = useState<string>();
  const [deviceName, setDeviceName] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);


  const [sysConfig, setSysConfig] = useState<SysConfig>();

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

  const loadReposAsync = async () => {
    console.log('loading repos.');
    let repos = await appServices.deviceServices.loadDeviceRepositories();
    repos.unshift({ id: "-1", key: 'select', name: '-select-', isPublic: false, description: '', repositoryType: '' });
    setRepos(repos);
    let deviceTypes = await appServices.deviceServices.getDeviceTypes();
    deviceTypes.unshift({ id: "-1", key: 'select', name: '-select-', description: '' });
    setDeviceTypes(deviceTypes);
  }

  const loadSysConfigAsync = async () => {
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
      await ble.disconnectById(peripheralId);
    }
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

    if (!selectedDeviceType || selectedDeviceType.id === "-1") {
      alert('Please select a device type.');
      return;
    }

    if (!deviceName) {
      alert('Device name is required.');
    }

    if (!deviceId) {
      alert('Device id is required.');
    }

    setIsBusy(true);
    let newDevice = await appServices.deviceServices.createDevice(selectedRepo!.id)
    console.log(deviceName, deviceId);
    newDevice.deviceType = { id: selectedDeviceType!.id, key: selectedDeviceType!.key, text: selectedDeviceType!.name };
    newDevice.deviceConfiguration = { id: selectedDeviceType!.defaultDeviceConfigId!, key: '', text: selectedDeviceType!.defaultDeviceConfigName! };
    newDevice.deviceId = deviceId!;
    newDevice.name = deviceName!;
    newDevice.macAddress = peripheralId;

    let result = await appServices.deviceServices.addDevice(newDevice);
    if (result.successful) {
      setIsBusy(true);
      if (await ble.connectById(peripheralId)) {
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'deviceid=' + deviceId);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'orgid=' + newDevice.ownerOrganization.id);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'repoid=' + newDevice.deviceRepository.id);
        await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'id=' + newDevice.id);
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

    await loadReposAsync();
    setIsBusy(true);
    await loadSysConfigAsync();
    setIsBusy(false);
  }

  const deviceTypeChanged = async (id: string) => {
    console.log(id)
    setSelectedDeviceType(deviceTypes.find(dt => dt.id == id));
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
    isBusy ?
      <View style={[styles.spinnerView, { backgroundColor: AppServices.getAppTheme().background }]}>
        <Text style={{ color: AppServices.getAppTheme().shellTextColor, fontSize: 25 }}>Please Wait</Text>
        <ActivityIndicator size="large" color={colors.accentColor} animating={isBusy} />
      </View>
      :
      <View style={[styles.scrollContainer, { backgroundColor: AppServices.getAppTheme().background }]}>
        <StatusBar style="auto" />
        <Text style={inputLabelStyle}>Repositories:</Text>
        <View>
          <Picker selectedValue={selectedRepo?.id} onValueChange={repoChanged} >
            {repos.map(itm => <Picker.Item key={itm.id} label={itm.name} value={itm.id} color="black" style={{ backgroundColor: 'white' }} />)}
          </Picker>
        </View>

        <Text style={inputLabelStyle}>Device Types:</Text>
        <Picker selectedValue={selectedDeviceType?.id} onValueChange={deviceTypeChanged} >
          {deviceTypes.map(itm => <Picker.Item key={itm.id} label={itm.name} value={itm.id} color="black" style={{ backgroundColor: 'white' }} />)}
        </Picker>

        <EditField label="Device Name" placeHolder="enter device name" onChangeText={e => setDeviceName(e)} />
        <EditField label="Device Id" placeHolder="enter device id" onChangeText={e => setDeviceId(e)} />

        <TouchableOpacity style={[styles.submitButton, { marginTop: 10, backgroundColor: palettes.primary.normal }]} onPress={() => provisionDevice()}>
          <Text style={primaryButtonTextStyle}> Save </Text>
        </TouchableOpacity>


        <TouchableOpacity style={[styles.submitButton, { marginTop: 50, backgroundColor: palettes.alert.error }]} onPress={() => factoryReset()}>
          <Text style={primaryButtonTextStyle}> Factory Reset </Text>
        </TouchableOpacity>

      </View>
  );
}