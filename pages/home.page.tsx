import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, Image, TextInput, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import Tabbar from "@mindinventory/react-native-tab-bar-interaction";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { IReactPageServices } from "../services/react-page-services";
import { DefaultTheme } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from '../styles';

import ViewStylesHelper from "../utils/viewStylesHelper";
import colors from "../styles.colors";
import fontSizes from "../styles.fontSizes";
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";
import Page from "../mobile-ui-common/page";
import IconButton from "../mobile-ui-common/icon-button";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";

import FaIcon from "react-native-vector-icons/FontAwesome5";
import { Subscription } from "../utils/NuvIoTEventEmitter";


export default function HomePage({ navigation }: IReactPageServices) {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [userInitials, setUserInitials] = useState<string>('?');
  const temporaryNotificationsFormatter: TextStyle = ViewStylesHelper.combineViewStyles([styles.container, { width: '100%', backgroundColor: themePalette.background }]);
  const temporaryHeader: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { width: '100%', textAlign: 'center', color: themePalette.shellTextColor }]);

  const tabs = [
    /*{
      name: 'Home',
      activeIcon: <Icon name="home" color={colors.primaryColor} size={42} style={{ top: 16 }} />,
      inactiveIcon: <Icon name="home" color={themePalette.shellNavColor} size={42} />
    },*/
    {
      name: 'Scan',
      activeIcon: <MciIcon name="radar" color={colors.primaryColor} size={42} style={{ top: 16 }} />,
      inactiveIcon: <MciIcon name="radar" color={themePalette.shellNavColor} size={42} />
    },
    {
      name: 'Profile',
      activeIcon: <FaIcon name="user-alt" color={colors.primaryColor} size={42} style={{ top: 16 }} />,
      inactiveIcon: <FaIcon name="user-alt" color={themePalette.shellNavColor} size={42} />
    },

  ];

  const Tab = createBottomTabNavigator();


  useEffect(() => {
    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);
    return (() => { if (subscription) AppServices.themeChangeSubscription.remove(subscription); });
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


  function reposPage() {
    console.log('repos page.');

    return (
      <View >
        <Image style={styles.logoImage} source={require('../assets/icon.png')} />
        <View style={styles.formGroup} >
          <IconButton color={themePalette.buttonPrimaryText} label="Scan for Devices" icon="radar" iconType="mci" onPress={() => showScanPage()} ></IconButton>
        </View>
      </View>
    );
  };

  const foundDevicesListTab = () => {
    return <View></View>
  };

  const notificationPage = () => {
    return (
      <View style={temporaryNotificationsFormatter}>
        <Image style={styles.logoImage} source={require('../assets/icon.png')} />
        <Text style={temporaryHeader}>Notifications will go here.</Text>
      </View>
    );
  };

  function profilePage() {
    return <View>
      <Image style={styles.logoImage} source={require('../assets/icon.png')} />
      <View style={styles.formGroup}>
        <IconButton color={themePalette.buttonPrimaryText} label="Back" icon="log-in-outline" iconType="ion" onPress={() => setCurrentTab('home')} ></IconButton>
        <IconButton color={themePalette.buttonPrimaryText} label="Switch Organization" icon="podium-outline" iconType="ion" onPress={() => showPage('changeOrgsPage')} ></IconButton>
        <IconButton color={themePalette.buttonPrimaryText} label="Settings" icon="settings-outline" iconType="ion" onPress={() => showPage('accountPage')} ></IconButton>
        <IconButton color={themePalette.buttonPrimaryText} label="Log Out" icon="log-out-outline" iconType="ion" onPress={() => logOut()} ></IconButton>        
      </View>
    </View>
  };

  const renderTabs = () => {
    console.log(currentTab.toLowerCase());
    switch (currentTab.toLowerCase()) {
      case 'list': return foundDevicesListTab();
      case 'notifications': return notificationPage();
      case 'profile': return profilePage();
      case 'home':
      default: return reposPage();
    }
  };

  const tabChanged = (tab: any) => {
    if (tab.name.toLowerCase() !== 'scan') {
      setCurrentTab(tab.name);
    }
    else {
      setCurrentTab('home');
      showScanPage();
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (<View style={{ flexDirection: 'row' }} >
        {false && <MciIcon.Button name='bell' size={fontSizes.iconButtonLarge} backgroundColor={colors.transparent} underlayColor={colors.transparent} color={colors.accentColor} onPress={() => setCurrentTab('notifications')} />}
      </View>),
      headerRight: () => (
        <View onTouchStart={() => setCurrentTab('profile')}>
          <MciIcon name='circle' style={styles.iconButtonCircle} />
          <Text style={[styles.iconButtonCircleOverlay, { fontSize: 18 }]}>{userInitials}</Text>
        </View>),
    });
  });
  return (
    <Page>
      <StatusBar style="auto" />
      {renderTabs()}
    </Page>
  );
}