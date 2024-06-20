import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Switch, TouchableOpacity, ActivityIndicator, Platform, TextStyle, ActionSheetIOS, ActionSheetIOSOptions } from "react-native";
import { Button } from 'react-native-ios-kit';
import ProgressSpinner from "../mobile-ui-common/progress-spinner";

import AppServices from "../services/app-services";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { SysConfig } from "../models/blemodels/sysconfig";
import { RemoteDeviceState } from "../models/blemodels/state";
import { IReactPageServices } from "../services/react-page-services";

import Icon from "react-native-vector-icons/Ionicons";

import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import ViewStylesHelper from "../utils/viewStylesHelper";
import styles from '../styles';
import palettes from "../styles.palettes";
import colors from "../styles.colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Picker } from "@react-native-picker/picker";
import Page from "../mobile-ui-common/page";


export const ConnectivityPage = ({ props, navigation, route }: IReactPageServices) => {
  const peripheralId = route.params.peripheralId;

  const [initialCall, setInitialCall] = useState<boolean>(true);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>();
  const [serverUrl, setServerUrl] = useState<string>();
  const [serverUid, setServerUid] = useState<string>();
  const [serverPwd, setServerPwd] = useState<string>();
  const [serverType, setServerType] = useState<string>();
  const [port, setPort] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(true);
  const [wifiSSID, setWiFiSSID] = useState<string>();
  const [wifiPWD, setWiFiPWD] = useState<string>();
  const [commissioned, setCommissioned] = useState<boolean>(false);
  const [useWiFi, setUseWiFi] = useState<boolean>(true);
  const [useCellular, setUseCellular] = useState<boolean>(false);
  const [viewReady, setViewReady] = useState<boolean>(false);
  const [handler, setHandler] = useState<string | undefined>(undefined);

  const [defaultListener, setDefaultListener] = useState<PipelineModules.ListenerConfiguration | undefined>(undefined);
  const [useDefaultListener, setUseDefaultListener] = useState<boolean>(false);

  const [wifiConnections, setWiFiConnections] = useState<Deployment.WiFiConnectionProfile[] | undefined>(undefined);
  const [selectedWiFiConnection, setSelectedWiFiConnection] = useState<Deployment.WiFiConnectionProfile | undefined>(undefined);

  const themePalette = AppServices.instance.getAppTheme();

  const inputStyleOverride = {
    backgroundColor: themePalette.inputBackgroundColor,
    borderColor: palettes.gray.v80,
    color: themePalette.shellTextColor,
    marginBottom: 20,
    paddingLeft: 4
  };

  const inputStyleWithBottomMargin: TextStyle = ViewStylesHelper.combineTextStyles([styles.inputStyle, inputStyleOverride]);
  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: themePalette.shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400') }]);
  const placeholderTextColor: string = themePalette.name === 'dark' ? themePalette.shellNavColor : palettes.gray.v50;

  const writeChar = async () => {
    if (!peripheralId) {
      console.error('PeripheralId not set, can not write.');
      return;
    }

    setIsBusy(true);

    if (await ble.connectById(peripheralId)) {
      if (deviceId) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `deviceid=${deviceId};`);
      if (serverUrl) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${serverUrl};`);
      if (port) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${port};`);
      if (serverUid) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `uid=${serverUid};`);
      if (serverPwd) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `pwd=${serverPwd};`);
      if (serverType) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `srvrtype=${serverType};`);

      if (wifiSSID) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${wifiSSID};`);
      if (wifiPWD) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPWD};`);

      await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=' + (useWiFi ? '1' : '0') + ";");
      await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=' + (useCellular ? '1' : '0') + ";");
      await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0') + ";");
      await ble.disconnectById(peripheralId);

      await getData();
    }
    else {
      console.warn('could not connect');
    }

    setIsBusy(false);
  };

  const getData = async () => {
    setIsBusy(true);
    if (await ble.connectById(peripheralId)) {
      let deviceStateCSV = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
      let deviceState = new RemoteDeviceState(deviceStateCSV!);
      let deviceConfig = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
      let sysconfig = new SysConfig(deviceConfig!);

      setDeviceId(sysconfig.deviceId);
      setServerType(sysconfig.serverType);
      setServerUrl(sysconfig.serverHostName);
      setServerUid(sysconfig.serverUid);
      setServerPwd(sysconfig.serverPwd);
      setCommissioned(sysconfig.commissioned);
      setUseCellular(sysconfig.cellEnabled);
      setUseWiFi(sysconfig.wifiEnabled);
      setWiFiSSID(sysconfig.wifiSSID);
      setPort(sysconfig.port?.toString());

      await ble.disconnectById(peripheralId);
      setViewReady(true);
    }
    else {
      console.warn('could not connect.');
    }

    let result = await AppServices.instance.deploymentServices.LoadWiFiConnectionProfiles(route.params.instanceRepoId);
    result.unshift({ id: 'cellular', key: 'cellular', name: 'Cellular', ssid: '', password: '', description: '' });
    result.unshift({ id: 'none', key: 'none', name: '-please select a connection-', ssid: '', password: '', description: '' });
    if (Platform.OS === 'ios')
      result.unshift({ id: 'cancel', key: 'cancel', name: 'Cancel', ssid: '', password: '', description: '' });

    setWiFiConnections(result);

    let defaultListener = await AppServices.instance.deploymentServices.LoadDefaultListenerForRepo(route.params.instanceRepoId);
    if (defaultListener.successful) {
      setDefaultListener(defaultListener.result);
    }

    setIsBusy(false);
    setIsReady(true);
  }

  const toggleUseDefaultListener = () => {
    setUseDefaultListener(!useDefaultListener);
    if (defaultListener) {
      let port = defaultListener.listenOnPort ? defaultListener.listenOnPort : defaultListener.connectToPort;
      if(defaultListener.hostName) setServerUrl(defaultListener.hostName);
      if (port) setPort(port.toString());
      if (defaultListener.userName) setServerUid(defaultListener.userName);
      if (defaultListener.password) setServerPwd(defaultListener.password);

      if (defaultListener.listenerType.id == 'mqttbroker' ||
        defaultListener.listenerType.id == 'sharedmqttlistener' ||
        defaultListener.listenerType.id == 'mqttlistener' ||
        defaultListener.listenerType.id == 'mqttclient')
        setServerType('mqtt')
      else if (defaultListener.listenerType.id == 'sharedrest' ||
        defaultListener.listenerType.id == 'rest')
        setServerType('mqtt')

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
            setUseWiFi(true);
            setWiFiSSID(wifiConnections![buttonIndex].ssid);
            setWiFiPWD(wifiConnections![buttonIndex].password);
          }
          else {
            setUseWiFi(false);
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
        setUseCellular(true);
        setUseWiFi(false);
        setWiFiSSID('');
        setWiFiPWD('');
      }
      else if (e == 'none') {
        setUseWiFi(false);
        setWiFiSSID('');
        setWiFiPWD('');
      }
      else {
        if (selected)
          setUseWiFi(true);
        setUseCellular(false);
        setWiFiSSID(selected!.ssid);
        setWiFiPWD(selected!.password);
      }
    }


    useEffect(() => {

      switch (handler) {
        case 'save': writeChar();
          setHandler(undefined);
          break;
      }

      navigation.setOptions({
        headerRight: () => (
          <View style={{ flexDirection: 'row' }} >
            <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => setHandler('save')} name='save' />
          </View>),
      });

      return (() => {
        console.log('[ConnectivityPage__UseEffect_Return] ' + peripheralId);
      });
    }, [handler]);

    if (initialCall) {
      setInitialCall(false);

      if (peripheralId) {
        getData();
      }
      else
        throw 'peripheralId not set from calling page, must pass in as a parameter.'
    }

    return (
      <Page style={[styles.container, { backgroundColor: themePalette.background, padding: 20 }]}>
        {isBusy &&      
         <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
          <Text style={[{ color: themePalette.shellTextColor, fontSize: 24, paddingBottom: 20 }]}>Please Wait</Text>
          <ProgressSpinner isBusy={isBusy} />
        </View>
        }
        {isReady && !isBusy &&
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

              <View style={styles.flex_toggle_row}>
                <Text style={inputLabelStyle}>Use Default Listener:</Text>
                <Switch onValueChange={e => toggleUseDefaultListener()} value={useDefaultListener}
                  thumbColor={(colors.primaryColor)}
                  trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
              </View>

              <View style={styles.flex_toggle_row}>
                <Text style={inputLabelStyle}>Commissioned:</Text>
                <Switch onValueChange={e => setCommissioned(e)} value={commissioned}
                  thumbColor={(colors.primaryColor)}
                  trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
              </View>

              <View style={styles.flex_toggle_row}>
                <Text style={inputLabelStyle}>Use WiFi:</Text>
                <Switch onValueChange={e => setUseWiFi(e)} value={useWiFi}
                  thumbColor={(colors.primaryColor)}
                  trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
              </View>

              <View style={styles.flex_toggle_row}>
                <Text style={inputLabelStyle}>Use Cellular:</Text>
                <Switch onValueChange={e => setUseCellular(e)} value={useCellular}
                  thumbColor={(colors.primaryColor)}
                  trackColor={{ false: colors.accentColor, true: colors.accentColor }} />
              </View>

              <Text style={inputLabelStyle}>Device ID:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Device ID" value={deviceId} onChangeText={e => { setDeviceId(e); console.log(deviceId) }} />

              <Text style={inputLabelStyle}>Server Host Name:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Server URL" value={serverUrl} onChangeText={e => setServerUrl(e)} />

              <Text style={inputLabelStyle}>Server Type:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Server Type (mqtt/rest)" value={serverType} onChangeText={e => setServerType(e)} />

              <Text style={inputLabelStyle}>Server User Id:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Server URL" value={serverUid} onChangeText={e => setServerUid(e)} />

              <Text style={inputLabelStyle}>Server Host Password:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="enter server password" value={serverPwd} onChangeText={e => setServerPwd(e)} />

              <Text style={inputLabelStyle}>Server Port Number:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Port Number" value={port} onChangeText={e => setPort(e)} />

              <Text style={inputLabelStyle}>WiFi SSID:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter Wifi SSID" value={wifiSSID} onChangeText={e => setWiFiSSID(e)} />

              <Text style={inputLabelStyle}>WiFi PWD:</Text>
              <TextInput style={inputStyleWithBottomMargin} placeholderTextColor={placeholderTextColor} placeholder="Enter WiFi Password" value={wifiPWD} onChangeText={e => setWiFiPWD(e)} />


            </View>
          </KeyboardAwareScrollView>
        }
      </Page>

    );
  }