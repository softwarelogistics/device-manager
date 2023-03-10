import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, Image, TextInput, TouchableOpacity, TextStyle, ViewStyle, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { IReactPageServices } from "../services/react-page-services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from '../styles';

import ViewStylesHelper from "../utils/viewStylesHelper";
import colors from "../styles.colors";
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";
import Page from "../mobile-ui-common/page";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";

import FaIcon from "react-native-vector-icons/FontAwesome5";
import { Subscription } from "../utils/NuvIoTEventEmitter";


export default function HomePage({ navigation }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());

  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [userInitials, setUserInitials] = useState<string>('?');
  const [instances, setInstances] = useState<Deployment.DeploymentInstanceSummary[]>([]);
  const [isBusy, setIsBusy] = useState<boolean>(true);


  const loadInstances = async () => {
    let instances = await appServices.deploymentServices.GetInstances();
    console.log(instances);
    setInstances(instances.model);
  }

  useEffect(() => {
    if (initialCall) {
      loadInstances();

      appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) });
      appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) });

    }

    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);
    return (() => {
      if (subscription) AppServices.themeChangeSubscription.remove(subscription);

    });
  }, []);

  const showScanPage = () => {
    navigation.navigate('scanPage');
  };

  const showPage = (pageName: string) => {
    navigation.navigate(pageName);
  };

  const logOut = async () => {
    await AsyncStorage.setItem("isLoggedIn", "false");

    await AsyncStorage.removeItem("jwt");
    await AsyncStorage.removeItem("refreshtoken");
    await AsyncStorage.removeItem("refreshtokenExpires");
    await AsyncStorage.removeItem("jwtExpires");
    navigation.replace('authPage');
  };

  const showInstance = (instance: Deployment.DeploymentInstanceSummary) => {
    navigation.navigate('instancePage', { instanceId: instance.id, repoId: instance.deviceRepoId });    
  }

  const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

  const myListEmpty = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={styles.item}> No Instances have been Created. </Text>
      </View>
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View onTouchStart={() => showPage('profilePage')}>
          <MciIcon name='circle' style={styles.iconButtonCircle} />
          <Text style={[styles.iconButtonCircleOverlay, { fontSize: 18 }]}>{userInitials}</Text>
        </View>),
    });
  });

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
          data={instances}
          renderItem={({ item }) =>
            <Pressable onPress={() => showInstance(item)} key={item.id} >
              <View style={[styles.listRow, { padding: 10, marginBottom: 10, height: 60, backgroundColor: themePalette.shell, }]}  >
                <Text style={[{ marginLeft: 10, color: themePalette.shellTextColor, fontSize: 18, flex: 3 }]}>{item.name}</Text>
              </View>
            </Pressable>
          }
        />
      }
    </Page>
  );
}