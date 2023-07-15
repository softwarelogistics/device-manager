import React, { useEffect, useState } from 'react';
import { IReactPageServices } from '../services/react-page-services';
import Page from '../mobile-ui-common/page';
import { Text, View, Image, TouchableOpacity, ActivityIndicator, TextStyle, Switch, Linking, } from 'react-native';
import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import styles from '../styles';
import { CommonSettings } from '../settings';
import AppServices from '../services/app-services';
import { Subscription } from "../utils/NuvIoTEventEmitter";

export const AboutPage = ({ props, navigation, route }: IReactPageServices) => {
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

  let version = JSON.stringify(require("../package.json").version).replaceAll('"', '');

  useEffect(() => {
    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);
    var palette = AppServices.getAppTheme()
    setThemePalette(palette);

    if (initialCall) {
      setInitialCall(false);
    }
    return (() => {

      if (subscription)
        AppServices.themeChangeSubscription.remove(subscription);
    });
  }, []);


  return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
    <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />

    <Text style={[ styles.label,{ color: themePalette.shellTextColor, fontSize: 18 }]}>Version: {version}</Text>
    <Text style={[ styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://www.nuviot.com')}> NuvIoT</Text>
    <Text style={[ styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://app.termly.io/document/terms-of-use-for-saas/90eaf71a-610a-435e-95b1-c94b808f8aca')}> Terms and Conditions</Text>
    <Text style={[ styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://app.termly.io/document/privacy-policy/fb547f70-fe4e-43d6-9a28-15d403e4c720')}> Privacy Statement</Text>
    <Text style={[ styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL('https://www.software-logistics.com')}> Software Logistics, LLC</Text>
    

  </Page>;
}