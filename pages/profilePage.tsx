import { useState } from "react";
import { View, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import IconButton from "../mobile-ui-common/icon-button";
import AppServices from "../services/app-services";
import styles from '../styles';
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import Page from "../mobile-ui-common/page";

export const ProfilePage = ({ navigation, props, route }: IReactPageServices) => {
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
    
    const showPage = (pageName: string) => {
        navigation.navigate(pageName);
    };

    const logOut = async () => {
        await AsyncStorage.setItem("isLoggedIn", "false");
    
        await AsyncStorage.removeItem("jwt");
        await AsyncStorage.removeItem("refreshtoken");
        await AsyncStorage.removeItem("refreshtokenExpires");
        await AsyncStorage.removeItem("jwtExpires");
        navigation.popToTop();
        navigation.replace('authPage');
      };
    
    return (<Page>
      <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />
      <View style={styles.formGroup}>
        <IconButton color={themePalette.buttonPrimaryText} label="Switch Organization" icon="podium-outline" iconType="ion" onPress={() => showPage('changeOrgsPage')} ></IconButton>
        <IconButton color={themePalette.buttonPrimaryText} label="Settings" icon="settings-outline" iconType="ion" onPress={() => showPage('accountPage')} ></IconButton>
        <IconButton color={themePalette.buttonPrimaryText} label="Log Out" icon="log-out-outline" iconType="ion" onPress={() => logOut()} ></IconButton>        
        <IconButton color={themePalette.buttonPrimaryText} label="About" icon="log-out-outline" iconType="ion" onPress={() => showPage('aboutPage')} ></IconButton>        
      </View>
    </Page>
    )
}