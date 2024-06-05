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
import palettes from "../styles.palettes";
import { CommonActions } from "@react-navigation/native";
import IconButton from "../mobile-ui-common/icon-button";

export default function SplashPage({ navigation }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
  const [currentTheme, setCurrentTheme] = useState('light')

  const checkStartup = async () => {
    if ((await AsyncStorage.getItem("isLoggedIn")) == "true") {
      let user = await appServices.userServices.getUser();
      if(!user!.emailConfirmed)
        navigation.replace('confirmemail')
      else if(!user!.currentOrganization)
        navigation.replace('createorg')
      else if(!user!.showWelcome)
        navigation.replace('homeWelcome')
      else
        navigation.replace('home')
    }
    else {
      let palette = await appServices.userServices.getThemePalette();
      setThemePalette(palette);
    }
  }

  let version = JSON.stringify(require("../package.json").version)

  version = version.replace('"', '').replace('"','');
  console.log(`[SplashPage__checkStartup] version ${version}`);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const login = async () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'authPage' },
        ],
      })
    );
  }

  const register = async () => {
    navigation.replace('registerPage');
  }

  useEffect(() => {
    AsyncStorage.getItem("active_theme").then((value) => {
      if(!value)
        value = 'light';

      setCurrentTheme(value);
   
    }).catch((error) => {
      console.error("Error retrieving AsyncStorage value:", error);
    });

    checkStartup();   
  }, []);

  return (
    <Page>
      <View style={{padding: 16, width: "100%", height: "100%", backgroundColor:  currentTheme  === 'dark' ?  palettes.darkBackground : palettes.lightBackground }}>
        <StatusBar style="auto" />
        <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />

        <Text style={[styles.labelTitle, styles.mt_20, { color:  currentTheme  === 'dark' ? palettes.primary.white : palettes.primary.black, marginBottom:20 }]}>The Device Manager Application is used to Provision and Configure hardware devices that work with the NuvIoT ecosystem.</Text>
        <IconButton color={themePalette.buttonPrimaryText} label="Log In" icon="login" iconType="mci" onPress={() => login()} ></IconButton>
        
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://www.nuviot.com')}> NuvIoT</Text>
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://app.termly.io/document/terms-of-use-for-saas/90eaf71a-610a-435e-95b1-c94b808f8aca')}> Terms and Conditions</Text>
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://app.termly.io/document/privacy-policy/fb547f70-fe4e-43d6-9a28-15d403e4c720')}> Privacy Statement</Text>
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://www.software-logistics.com')}> Software Logistics, LLC</Text>
        <Text style={[styles.label, styles.mt_20, { color:  currentTheme  === 'dark' ? palettes.primary.white : palettes.primary.black, fontSize: 18 }]}>Version: {version}</Text>

      </View>
    </Page>
  );
}