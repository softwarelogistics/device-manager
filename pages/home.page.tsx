import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, Image, TextInput, TouchableOpacity, TextStyle, ViewStyle, FlatList, Pressable, ActivityIndicator } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

import { IReactPageServices } from "../services/react-page-services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from '../styles';

import colors from "../styles.colors";
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";
import Page from "../mobile-ui-common/page";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import SLIcon from "../mobile-ui-common/sl-icon";


export default function HomePage({ navigation }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());

  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [userInitials, setUserInitials] = useState<string>('?');
  const [instances, setInstances] = useState<Deployment.DeploymentInstanceSummary[]>([]);
  const [user, setUser] = useState<Users.AppUser>();

  const loadInstances = async () => {
    let user = await appServices.userServices.getUser();
    setUser(user);
    console.log('got user');

    let instances = await appServices.deploymentServices.GetInstances();
      setInstances(instances!.model!);
  }

  useEffect(() => {
    if (initialCall) {
      loadInstances();
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
    navigation.navigate('instancePage', { instanceId: instance.id, repoId: instance.deviceRepoId, instanceName: instance.name });
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
        <View style={{ flexDirection: 'row' }} onTouchStart={() => showPage('profilePage')}>
          <Icon.Button backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} name='cog-outline' />
        </View>
      )
    });
  });

  return (
    <Page >
      <StatusBar style="auto" />
      <View style={{ width: "100%" }} >
        <Image style={[{ marginTop: 30, marginBottom: 30, alignSelf: "center" }]} source={require('../assets/app-icon.png')} />
        <Text style={[{ textAlign: 'center', marginBottom: 5, color: themePalette.shellTextColor, fontSize: 24 }]}>{user?.currentOrganization.text} Instances</Text>
        <FlatList
          contentContainerStyle={{ alignItems: "stretch" }}
          style={{ backgroundColor: themePalette.background, width: "100%", flexGrow: 1 }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={instances}
          renderItem={({ item }) =>
            <Pressable onPress={() => showInstance(item)} key={item.id} >
              <View style={[styles.listRow, { padding: 10, marginBottom: 10, height: 60, backgroundColor: themePalette.inputBackgroundColor, }]}  >
                <SLIcon icon={item.icon} />
                <Text style={[{ marginLeft: 3, marginTop: 3, color: themePalette.shellTextColor, fontSize: 24, flex: 3 }]}>{item.name}</Text>
              </View>
            </Pressable>
          }
        />
      </View>
    </Page>
  );
}