import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity, ScrollView, View, Text, TextInput, TextStyle, ViewStyle, ActivityIndicator, Platform, ActionSheetIOSOptions, ActionSheetIOS } from "react-native";
import { Button } from 'react-native-ios-kit';
import { Picker } from '@react-native-picker/picker';

import AppServices from "../services/app-services";

import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { IOValues } from "../models/blemodels/iovalues";

import styles from '../styles';
import ViewStylesHelper from "../utils/viewStylesHelper";
import palettes from "../styles.palettes";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import { useFocusEffect } from "@react-navigation/native";
import ProgressSpinner from "../mobile-ui-common/progress-spinner";
import Page from "../mobile-ui-common/page";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";
import { useInterval } from "usehooks-ts";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

interface SelectableOption {
  label: string;
  value: string;
}
export const SensorsPage = ({ props, navigation, route }: IReactPageServices) => {
  const [connectionState, setConnectionState] = useState<number>(IDLE);
  const [pageVisible, setPageVisible] = useState<boolean>(false)
  const [portName, setPortName] = useState('');
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [initialLoad, setInitialCall] = useState<boolean>(true)
  const [scaler, setScaler] = useState<string>("0");
  const [calibration, setCalibration] = useState<string>('0');
  const [zero, setZero] = useState("0");

  const [hasAnyPort, setHasAnyPort] = useState(false);
  const [isAdcPortSelected, setIsAdcPortSelected] = useState(false);
  const [isDigitalPortSelected, setIsDigitalPortSelected] = useState(false);

  const [ioValues, setIOValues] = useState<IOValues | undefined>(undefined);

  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

  const peripheralId = route.params.peripheralId;
  const repoId = route.params.repoId;
  const deviceId = route.params.deviceId;
  const themePalette = AppServices.instance.getAppTheme();

  //console.log(peripheralId, repoId, deviceId);

  const [selectedPort, setPort] = useState<SelectableOption | undefined>(undefined);
  const ports: SelectableOption[] = [
    { label: '-select port-', value: '-1' },
    { label: 'Analog Port 1', value: 'adc1' },
    { label: 'Analog Port 2', value: 'adc2' },
    { label: 'Analog Port 3', value: 'adc3' },
    { label: 'Analog Port 4', value: 'adc4' },
    { label: 'Analog Port 5', value: 'adc5' },
    { label: 'Analog Port 6', value: 'adc6' },
    { label: 'Analog Port 7', value: 'adc7' },
    { label: 'Analog Port 8', value: 'adc8' },
    { label: 'Digital Port 1', value: 'io1' },
    { label: 'Digital Port 2', value: 'io2' },
    { label: 'Digital Port 3', value: 'io3' },
    { label: 'Digital Port 4', value: 'io4' },
    { label: 'Digital Port 5', value: 'io5' },
    { label: 'Digital Port 6', value: 'io6' },
    { label: 'Digital Port 7', value: 'io7' },
    { label: 'Digital Port 8', value: 'io8' },
    { label: 'Relay 1', value: 'rly1' },
    { label: 'Relay 2', value: 'rly2' },
    { label: 'Relay 3', value: 'rly3' },
    { label: 'Relay 4', value: 'rly4' },
    { label: 'Relay 5', value: 'rly5' },
    { label: 'Relay 6', value: 'rly6' },
    { label: 'Relay 7', value: 'rly7' },
    { label: 'Relay 8', value: 'rly8' },
  ];

  const [analogDeviceType, setAnalogDeviceType] = useState<SelectableOption | undefined>(undefined);
  const adcPortType: SelectableOption[] = [
    { label: 'None', value: '0' },
    { label: 'ADC', value: '1' },
    { label: 'CT', value: '2' },
    { label: 'Switch', value: '3' },
    { label: 'Thermistor', value: '4' },
    { label: 'Volts', value: '5' },
    { label: 'Other', value: '6' },
  ];

  const [digitalDeviceType, setDigitalDeviceType] = useState<SelectableOption | undefined>(undefined);
  const ioPortType: SelectableOption[] = [
    { label: 'None', value: '0' },
    { label: 'Input', value: '1' },
    { label: 'Output', value: '2' },
    { label: 'Pulse Counter', value: '3' },
    { label: 'DS18B', value: '4' },
    { label: 'DHT11', value: '5' },
    { label: 'DHT22 - Temperature and Humidity', value: '6' },
    { label: 'DHT22 - Humidity', value: '7' },
    { label: 'MX711', value: '8' },
    { label: 'Other', value: '9' },
  ];

  const inputStyleOverride = {
    backgroundColor: themePalette.inputBackgroundColor,
    borderColor: palettes.gray.v80,
    color: themePalette.shellTextColor,
    marginBottom: 20,
    paddingLeft: 4
  };
  const inputStyleWithBottomMargin: TextStyle = ViewStylesHelper.combineTextStyles([styles.inputStyle, inputStyleOverride]);
  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: themePalette.shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400') }]);
  const primaryButtonTextStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, { color: themePalette.buttonPrimaryText }]);

  const charHandler = (value: any) => {
//    console.log('char handler->' + value.characteristic + ' - ' + value.value);

    if (value.characteristic == CHAR_UUID_IO_VALUE) {
      let io = new IOValues(value.value);
      setIOValues(io);
    }
  }

  const writeChar = async () => {
    let setCmd = `setioconfig=${selectedPort?.value},${portName},${isDigitalPortSelected ? digitalDeviceType?.value : analogDeviceType?.value},${scaler},${calibration},${zero}`;
    console.log('write char is called.' + connectionState);
    console.log('write char is called.' + setCmd);

    await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=${selectedPort?.value};`);
    await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, setCmd);
    await ConnectedDevice.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
  }

  const readConfig = async (port: string) => {
    console.log('read char is called.' + connectionState + " port " + port);

    await ConnectedDevice.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=${port};`);
    let str = await ConnectedDevice.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
    console.log(`[SensorPage__ReadConfig] - ${port} - Value: ${str}`);
    if (str) {
      let parts = str.split(',');
      if (parts.length > 5) {
        setPortName(parts[1]);
        setAnalogDeviceType(adcPortType.find(prt => prt.value == parts[2]));
        setDigitalDeviceType(ioPortType.find(prt => prt.value == parts[2]));
        setScaler(parts[3]);
        setCalibration(parts[4]);
        setZero(parts[5]);
      }
    }
  }

  const portChanged = async (port: string) => {
    setPort(ports.find(prt => prt.value == port));

    setIsAdcPortSelected(port.startsWith('adc'));
    setIsDigitalPortSelected(port.startsWith('io'));
    setHasAnyPort(port != '-1');
    if (port != '-1') {
      await readConfig(port);
    }
  }

  const resetConfig = () => {
    setPortName(selectedPort!.label);
    setAnalogDeviceType(adcPortType.find(prt => prt.value == '0'));
    setDigitalDeviceType(ioPortType.find(prt => prt.value == '0'));
    setScaler('1');
    setZero('0');
    setCalibration('1');
  }

  const restartDevice = async () => {
    if (connectionState == CONNECTED) {
      await ConnectedDevice.writeNoResponseCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `reboot=1`);
      await ConnectedDevice.disconnect();
      setConnectionState(DISCONNECTED);
    }
  }

  const selectPort = () => {
    if (!ports) return;

    ActionSheetIOS.showActionSheetWithOptions(getOptions(ports.map(item => item.label)),
      buttonIndex => {
        if (buttonIndex > 0) {
          setPort(ports[buttonIndex]);
          portChanged(ports[buttonIndex].value);
        }
      })
  }

  const getOptions = (options: string[]): ActionSheetIOSOptions => {
    return {
      options: options,
      cancelButtonIndex: 0,
      userInterfaceStyle: themePalette.name == 'dark' ? 'dark' : 'light',
    }
  }

  const selectADCDeviceType = () => {
    if (!ports) return;

    ActionSheetIOS.showActionSheetWithOptions(getOptions(adcPortType.map(item => item.label)),
      buttonIndex => {
        if (buttonIndex > 0) {
          setPort(ports[buttonIndex]);
        }
      })
  }

  const selectIODeviceType = () => {
    if (!ports) return;

    ActionSheetIOS.showActionSheetWithOptions(getOptions(ioPortType.map(item => item.label)),
      buttonIndex => {
        if (buttonIndex > 0) {
          setPort(ports[buttonIndex]);
        }
      })
  }

  useInterval(async () => {
    if(peripheralId && !isDeviceConnected){
      await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_IO_VALUE], 1);
      }}, pageVisible ? 6000 : null  
  )
  
  useEffect(() => {
    console.log('[Sensors__useEffect] ' + peripheralId);
    ConnectedDevice.onReceived = (value) => charHandler(value);
    ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
    ConnectedDevice.onDisconnected = () => setIsDeviceConnected(false);

    if(initialLoad){
      ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_IO_VALUE], 1);
      setInitialCall(false);
    }

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={writeChar} name='save' />
        </View>),
    });

  const focusSubscription = navigation.addListener('focus', () => {
      setPageVisible(true);      
      if (ble.simulatedBLE()) {
        setIsDeviceConnected(true);
        return;
      }
      console.log("[SensorPage__Focus]");
  });

  const blurSubscription = navigation.addListener('beforeRemove', async () => {
      await ConnectedDevice.disconnect();

      setPageVisible(false);
      AppServices.instance.wssService.close();
      console.log("[SensorPage__Blur]");
    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });    
  }, []);

  return (
    <Page>
      <ScrollView style={[styles.scrollContainer, { backgroundColor: themePalette.background }]}>
        {
          !isDeviceConnected &&
           <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
            <Text style={{ fontSize: 25, color: themePalette.shellTextColor }}>Connecting to BLE</Text>
            <ProgressSpinner />
          </View>
        }
        {
          isDeviceConnected &&
          <View >
            <StatusBar style="auto" />
            <Text style={inputLabelStyle}>Port:</Text>
            {Platform.OS == 'ios' && selectedPort && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectPort()} >{selectedPort.label}</Button>}
            {Platform.OS == 'ios' && !selectedPort && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectPort()} >-select port-</Button>}
            {Platform.OS != 'ios' &&
              <Picker selectedValue={selectedPort?.value} onValueChange={portChanged} >
                {ports.map(itm => <Picker.Item key={itm.value} label={itm.label} value={itm.value} color={themePalette.accentColor} />)}
              </Picker>
            }

            {
              isAdcPortSelected &&
              <View>
                <Text style={inputLabelStyle}>ADC Type:</Text>
                {Platform.OS == 'ios' && analogDeviceType && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectADCDeviceType()} >{analogDeviceType.label}</Button>}
                {Platform.OS == 'ios' && !analogDeviceType && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectADCDeviceType()} >-select device type-</Button>}
                {Platform.OS != 'ios' &&
                  <Picker selectedValue={analogDeviceType?.value} onValueChange={(value) => setAnalogDeviceType(adcPortType.find(prt => prt.value == value))} >
                    {adcPortType.map(itm => <Picker.Item key={itm.value} label={itm.label} value={itm.value} color={themePalette.accentColor} />)}
                  </Picker>
                }
              </View>
            }

            {
              isDigitalPortSelected &&
              <View>
                <Text style={inputLabelStyle}>Digitial Port Type:</Text>
                {Platform.OS == 'ios' && analogDeviceType && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectIODeviceType()} >{analogDeviceType.label}</Button>}
                {Platform.OS == 'ios' && !analogDeviceType && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => selectIODeviceType()} >-select device type-</Button>}
                {Platform.OS != 'ios' &&
                  <Picker selectedValue={digitalDeviceType?.value} onValueChange={(value) => setDigitalDeviceType(ioPortType.find(prt => prt.value == value))} >
                    {ioPortType.map(itm => <Picker.Item key={itm.value} label={itm.label} value={itm.value} color={themePalette.accentColor} />)}
                  </Picker>
                }
              </View>
            }

            {
              hasAnyPort &&
              <View>
                <Text style={inputLabelStyle}>Port Name:</Text>
                <TextInput style={inputStyleWithBottomMargin} placeholder="name" value={portName} onChangeText={e => setPortName(e)} />
                <Text style={inputLabelStyle}>Raw Scaler:</Text>
                <TextInput style={inputStyleWithBottomMargin} placeholder="scaler" value={scaler} onChangeText={e => setScaler(e)} />
                <Text style={inputLabelStyle}>Zero Value:</Text>
                <TextInput style={inputStyleWithBottomMargin} placeholder="zero" value={zero} onChangeText={e => setZero(e)} />
                <Text style={inputLabelStyle}>Calibration:</Text>
                <TextInput style={inputStyleWithBottomMargin} placeholder="calibration" value={calibration} onChangeText={e => setCalibration(e)} />

                <View style={{ flexDirection: "column" }}>
                  <TouchableOpacity style={[styles.submitButton, { backgroundColor: palettes.accent1.normal }]} onPress={() => writeChar()}><Text style={primaryButtonTextStyle}> Write </Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.submitButton, { backgroundColor: palettes.alert.warning }]} onPress={() => resetConfig()}><Text style={primaryButtonTextStyle}> Reset </Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.submitButton, { backgroundColor: palettes.alert.error }]} onPress={() => restartDevice()}><Text style={primaryButtonTextStyle}> Restart </Text></TouchableOpacity>
                </View>
              </View>
            }
          </View>
        }
      </ScrollView>
    </Page>
  );
}