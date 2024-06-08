import { useEffect, useState } from "react";
import { View, Image, Text, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import IconButton from "../mobile-ui-common/icon-button";
import AppServices from "../services/app-services";
import styles from '../styles';
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";

export const WelcomePage = ({ navigation, props, route }: IReactPageServices) => {  
  let themePalette = AppServices.instance.getAppTheme()

  const showPage = (pageName: string) => {
    console.log('here ');
 //   navigation.replace(pageName);
    AppServices.instance.navService.replace(pageName);
  };

  const navigateToPage = (pageName: string) => {
    AppServices.instance.navService.navigate(pageName);
  };

  useEffect(() => {    
  }, []);

  const logOut = async () => {
  };

  console.log('here');

  return (
    <Page>
      <ScrollView>
        <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />
        <View style={styles.formGroup}>
        <Text style={[{ textAlign: 'center', marginBottom: 5, marginTop:20, color: themePalette.shellTextColor, fontSize: 16 }]}>
            The NuVIoT device manager is a companion applications that can be used to provision and configure devices connected 
            to NuVIoT application instances.</Text>
          <IconButton color={themePalette.buttonPrimaryText} label="Home" icon="home" iconType="ion" onPress={() => showPage('homePage')} ></IconButton>
          <IconButton color={themePalette.buttonPrimaryText} label="Switch Organization" icon="podium-outline" iconType="ion" onPress={() => navigateToPage('changeOrgsPage')} ></IconButton>
          <IconButton color={themePalette.buttonPrimaryText} label="Settings" icon="settings-outline" iconType="ion" onPress={() => navigateToPage('accountPage')} ></IconButton>
          <IconButton color={themePalette.buttonPrimaryText} label="Log Out" icon="log-out-outline" iconType="ion" onPress={() => logOut()} ></IconButton>
        </View>
      </ScrollView>
    </Page>
  )
}