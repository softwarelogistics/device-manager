
import React, { useEffect, useState } from "react";
import { IReactPageServices } from "../services/react-page-services";
import { StatusBar } from 'expo-status-bar';
import { Image, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import ViewStylesHelper from "../utils/viewStylesHelper";
import styles from '../styles';
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";
import StdButton from "../mobile-ui-common/std-button";
import ThemeSwitcher from "../mobile-ui-common/theme-switcher";
import Page from "../mobile-ui-common/page";

export default function SplashPage({ navigation }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());

  const checkStartup = async () => {
    if ((await AsyncStorage.getItem("isLoggedIn")) == "true") {
      navigation.replace('homePage')
      console.log('showing home page.');
    }
    else {
      await appServices.userServices.getThemePalette()
        .then(response => {
          setThemePalette(response);
        });
    }
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  const login = async () => {
    navigation.replace('authPage');
  }

  const register = async () => {
    navigation.replace('registerPage');
  }

  useEffect(() => {
    (async () => {
      //await checkStartup();
    })();
  });

  const primaryButton = ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonSecondary]);
  const secondaryButton = ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonPrimary]);

  return (
    <Page >
      <Image style={styles.logoImage} source={require('../assets/icon.png')} />
      <View style={styles.formGroup}>
        <StatusBar style="auto" />
        <StdButton onPress={login} label="Login"/>
      </View>
    </Page>
  );
}