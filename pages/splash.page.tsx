import React, { useEffect } from "react";
import { IReactPageServices } from "../services/react-page-services";
import { View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppServices from "../services/app-services";
import Page from "../mobile-ui-common/page";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import IconButton from "../mobile-ui-common/icon-button";
import WebLink from "../mobile-ui-common/web-link";
import { AppLogo } from "../mobile-ui-common/AppLogo";
import AppVersionLabel from "../mobile-ui-common/AppVersion";
import Paragraph from "../mobile-ui-common/paragraph";
import { StaticContent } from "../services/content";

export default function SplashPage({ navigation }: IReactPageServices) {
  
  const checkStartup = async () => {
    console.log('checking startup');
    if ((await AsyncStorage.getItem("isLoggedIn")) == "true") {
      let user = await AppServices.instance.userServices.getUser();
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
      let palette = await AppServices.instance.userServices.getThemePalette();
      AppServices.instance.setAppTheme(palette);
    }
  }

  const themePalette = AppServices.instance.getAppTheme();

  React.useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

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

  useFocusEffect(() => {
    AppServices.instance.navService.setTopLevelNavigator(navigation);
  })

  useFocusEffect(() => {
    checkStartup();   
  });

  return (
    <Page>
        <AppLogo/>        
        <Paragraph content={StaticContent.appDescription}></Paragraph>
        <IconButton color={themePalette.buttonPrimaryText} label={StaticContent.login} icon="login" iconType="mci" onPress={() => login()} ></IconButton>
        
        <WebLink url="https://www.software-logistics.com" label="Software Logistics, LLC"  />
        <WebLink url="https://www.nuviot.com" label="NuvIoT"  />
        <WebLink url="https://app.termly.io/document/terms-of-use-for-saas/90eaf71a-610a-435e-95b1-c94b808f8aca" label="Terms and Conditions"  />
        <WebLink url="https://app.termly.io/document/privacy-policy/fb547f70-fe4e-43d6-9a28-15d403e4c720" label="Privacy Statement"  />      

        <AppVersionLabel/>
    </Page>
  );
}