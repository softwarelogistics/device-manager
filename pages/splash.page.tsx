
import React, { useEffect, useState } from "react";
import { IReactPageServices } from "../services/react-page-services";
import { StatusBar } from 'expo-status-bar';
import { Image, View, Text, Linking } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from '../styles';
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";
import StdButton from "../mobile-ui-common/std-button";
import Page from "../mobile-ui-common/page";

export default function SplashPage({ navigation }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());

  const checkStartup = async () => {
    if ((await AsyncStorage.getItem("isLoggedIn")) == "true") {
      navigation.replace('seaWolfHomePage')
      console.log('showing home page.');
    }
    else {
      let palette = await appServices.userServices.getThemePalette();
      setThemePalette(palette);
      console.log('got theme', palette);
    }
  }

  let version = JSON.stringify(require("../package.json").version)
  console.log(version);
  version = version.replace('"', '').replace('"','');

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const login = async () => {
    navigation.replace('authPage');
  }

  const register = async () => {
    navigation.replace('registerPage');
  }

  useEffect(() => {
    (async () => {
      await checkStartup();
    })();
  });

  return (
    <Page >
      <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />
      <View style={styles.formGroup}>
        <StatusBar style="auto" />

        <Text style={[styles.label, styles.mt_20, { color: themePalette.shellTextColor, marginBottom:20 }]}>The Device Manager Application is used to Provision and Configure hardware devices that work with the NuvIoT ecosystem.</Text>
        <StdButton style={[styles.mt_20, {marginTop:20}]}  onPress={login} label="Login" />
        
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://www.nuviot.com')}> NuvIoT</Text>
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://app.termly.io/document/terms-of-use-for-saas/90eaf71a-610a-435e-95b1-c94b808f8aca')}> Terms and Conditions</Text>
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://app.termly.io/document/privacy-policy/fb547f70-fe4e-43d6-9a28-15d403e4c720')}> Privacy Statement</Text>
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://www.software-logistics.com')}> Software Logistics, LLC</Text>
        <Text style={[styles.label, styles.mt_20, { color: themePalette.shellTextColor, fontSize: 18 }]}>Version: {version}</Text>

      </View>
    </Page>
  );
}