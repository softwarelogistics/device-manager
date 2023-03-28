import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';


import Icon from "react-native-vector-icons/Ionicons";
import Page from "../mobile-ui-common/page";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import styles from '../styles';
import colors from "../styles.colors";


export const InstancePage = ({ navigation, props, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [devices, setDevices]= useState<Devices.DeviceSummary[] | undefined>(undefined);

  const [isBusy, setIsBusy] = useState<boolean>(true);

  const instanceId = route.params.instanceId;
  const deviceRepoId = route.params.repoId;

  const loadDevices = async () => {
    let result = await appServices.deviceServices.getDevicesForRepoAsync(deviceRepoId)
    setDevices(result.model);
  }

  
  const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

  const myListEmpty = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={styles.item}> No Instances have been Created. </Text>
      </View>
    );
  };

  const addDevice = () => {
    navigation.navigate('scanPage');
  }

  const showDevice= (deviceSummary: Devices.DeviceSummary) => {
    navigation.navigate('deviceProfilePage', { id: deviceSummary.id, repoId: deviceRepoId });
  }

  useEffect(() => {
    if (initialCall) {
      appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) });
      appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) });

      setThemePalette(AppServices.getAppTheme());

      console.log(themePalette.shellNavColor);

      loadDevices();
      setInitialCall(false);
    }

    
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={addDevice} name='add-outline' />
        </View>),
    });

    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);
    return (() => {
      if (subscription) AppServices.themeChangeSubscription.remove(subscription);

    });
    
  }, []);



  return (
    <Page>
      <StatusBar style="auto" />
      {
        isBusy &&
        <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
          <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Please Wait</Text>
          <ActivityIndicator size="large" color={colors.accentColor} animating={isBusy} />
        </View>
      }
      {!isBusy &&
        <FlatList
          contentContainerStyle={{ alignItems: "stretch" }}
          style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={devices}
          renderItem={({ item }) =>
            <Pressable onPress={() => showDevice(item)} key={item.id} >
              <View style={[{ flexDirection:'column', padding: 10, marginBottom: 10, height: 60, backgroundColor: themePalette.shell, }]}  >
                <Text style={[{ marginLeft: 10, color: themePalette.shellTextColor, fontSize: 18, marginBottom:5}]}>{item.deviceName}</Text>
                <View style={{flexDirection:'row', marginLeft: 10 }} key={item.id}>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize:16, flex: 3 }]}>ID: {item.deviceId}</Text>
                  <Text numberOfLines={1} style={[{ color: themePalette.shellTextColor, fontSize:16, flex: 3 }]}>Type: {item.deviceType}</Text>
                </View>
              </View>
            </Pressable>
          }
        />
      }
    </Page>
  )
}