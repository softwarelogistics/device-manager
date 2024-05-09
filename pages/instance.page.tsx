import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';

import Icon from "react-native-vector-icons/Ionicons";
import Page from "../mobile-ui-common/page";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import { Button } from 'react-native-ios-kit';
import { ActionSheetIOS, ActivityIndicator, FlatList, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import SLIcon from "../mobile-ui-common/sl-icon";
import styles from "../styles";


export const InstancePage = ({ navigation, props, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [deviceModelFilter, setDeviceModelFilter] = useState<Core.EntityHeader | undefined>(undefined);

  const [allDevices, setAllDevices] = useState<Devices.DeviceSummary[] | undefined>(undefined);
  const [devices, setDevices] = useState<Devices.DeviceSummary[] | undefined>(undefined);

  const [deviceModels, setDeviceModels] = useState<Core.EntityHeader[]>([]);

  const instanceId = route.params.instanceId;
  const deviceRepoId = route.params.repoId;
  const instanceName = route.params.instanceName

  const loadDevices = async () => {
    let result = await appServices.deviceServices.getDevicesForRepoAsync(deviceRepoId)
    let uniqueDeviceModels: Core.EntityHeader[] = [];

    for (let device of result.model!) {
      if (uniqueDeviceModels.filter(mod => mod.id == device.deviceTypeId).length == 0) {
        uniqueDeviceModels.push({ id: device.deviceTypeId, text: device.deviceType })
      }
    }

    uniqueDeviceModels = uniqueDeviceModels.sort((a, b) => a.text > b.text ? 1 : -1);

    uniqueDeviceModels.unshift({ id: 'all', text: 'All Device Models' });
    setDeviceModelFilter(uniqueDeviceModels[0]);

    let devices = result.model!.sort((a, b) => a.deviceName > b.deviceName ? 1 : -1);

    setDevices(devices);
    setAllDevices(devices);

    setDeviceModels(uniqueDeviceModels);
  }

  const addDevice = () => {
    navigation.navigate('scanPage', { repoId: deviceRepoId, instanceId: instanceId });
  }

  const showDevice = (deviceSummary: Devices.DeviceSummary) => {
    if(deviceSummary.deviceTypeId == 'D37B01208A6B4C4D8953C53435F1AD59' && false){
      navigation.navigate('seaWolfHomePage', { id: deviceSummary.id, repoId: deviceRepoId });
    }
    else {
      navigation.navigate('deviceProfilePage', { id: deviceSummary.id, repoId: deviceRepoId });
    }
  }

  const deviceTypeChanged = async (id: string) => {
    setDeviceModelFilter(deviceModels.find(itm => itm.id == id));

    if (id === 'all')
      setDevices(allDevices);
    else {
      let deviceModels = allDevices?.filter(dev => dev.deviceTypeId == id);
      setDevices(deviceModels);
    }
  }

  const deviceModelFilterSelected = async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: deviceModels.map(item => item.text),
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex > 1 ) {
          deviceTypeChanged(deviceModels[buttonIndex].id);    
        }
      })
  };

  useEffect(() => {
    let palette = AppServices.getAppTheme()
    setThemePalette(palette);

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'column' }} >
          <Icon.Button backgroundColor="transparent" underlayColor="transparent" color={palette.shellNavColor} onPress={() => addDevice()} name='add-outline' />
        </View>
      ),
    });

    if (initialCall) {
      loadDevices();
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
      <StatusBar style="auto" />
      <View style={{ width: "100%", height:"100%", flexDirection: 'column'}}>
        <Text style={[{ margin: 3, color:themePalette.shellTextColor, fontSize: 24 }]}>{instanceName}</Text>
            {Platform.OS == 'ios' && deviceModelFilter && <Button style={{ color: themePalette.shellTextColor, margin:20 }} inline  onPress={() => deviceModelFilterSelected()} >{deviceModelFilter.text}</Button> }
            {Platform.OS == 'ios' && !deviceModelFilter && <Button title='-all-' onPress={() => deviceModelFilterSelected()} /> }
            {Platform.OS != 'ios' &&             
        <Picker selectedValue={deviceModelFilter?.id} onValueChange={deviceTypeChanged} itemStyle={{color:themePalette.shellTextColor, fontSize:20}} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
          {deviceModels.map(itm => <Picker.Item key={itm.id} label={itm.text} value={itm.id} style={{ fontSize:20, color: themePalette.shellTextColor, backgroundColor: themePalette.background }} />)}
        </Picker>
}
          <ScrollView  >
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: themePalette.background, width: "100%", height:"100%" }}>
              {devices && devices.map((item, key) => {
                return <Pressable onPress={() => showDevice(item)} key={item.id} >
                  <View style={[{ flex: 1, flexDirection: 'row', padding: 10, height: 90, width: 180, borderWidth: 1, backgroundColor: themePalette.inputBackgroundColor, borderRadius: 8, margin: 5, borderColor: themePalette.border }]}  >
                    <SLIcon icon={item.icon} />
                    <Text style={[{ margin: 3, color: themePalette.shellTextColor, fontSize: 16, width: 130 }]}>{item.deviceName}</Text>
                  </View>
                </Pressable>
              })
              }

            </View>
          </ScrollView>
      </View>
    </Page>
  )
}