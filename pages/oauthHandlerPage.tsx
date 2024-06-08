import { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import AuthenticationHelper from "../utils/authenticationHelper";

import colors from "../styles.colors";
import styles from '../styles';
import Page from "../mobile-ui-common/page";
import IconButton from "../mobile-ui-common/icon-button";
import { environment } from "../settings";

export const OAuthHandlerPage = ({ props, navigation, route }: IReactPageServices) => {
  const [failedAuth, setFailedAuth] = useState<boolean>(false);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const themePalette = AppServices.instance.getAppTheme();

  const checkStartup = async () => {
    let ola = await AsyncStorage.getItem('oauth_launch');
    if (ola == 'true') {
      await AsyncStorage.removeItem('oauth_launch');

      let oAuthUser = await AsyncStorage.getItem('oauth_user');
      let oAuthToken = await AsyncStorage.getItem('oauth_token');
      let initialPath = await AsyncStorage.getItem('oauth_path');

      console.log(`[OAuthHandlerPage__CheckStartup] - User Id: ${oAuthUser}, Token: ${oAuthToken}, Path: ${initialPath}`);

      await AsyncStorage.removeItem('oauth_launch');
      await AsyncStorage.removeItem('oauth_user');
      await AsyncStorage.removeItem('oauth_token');
      await AsyncStorage.removeItem('oauth_path');
      finalizeLogin(oAuthUser!, oAuthToken!, initialPath!);
    }
    else {
      setTimeout(() => checkStartup(), 1000);
      console.log(`[OAuthHandlerPage__CheckStartup] - Not Ready`);
    }
  }

  const finalizeLogin = async (userId: string, authToken: string, path: string) => {
    let appInstanceId = await AsyncStorage.getItem('appInstanceId')
    if(appInstanceId == null || appInstanceId == '') {
      appInstanceId = AuthenticationHelper.newUuid();
      await AsyncStorage.setItem('appInstanceId', appInstanceId);
      console.log('[OAuthHandlerPage__FinalizeLogin] - AppInstanceId not found. Created new one.', appInstanceId)
    }
    else
      console.log('[OAuthHandlerPage__FinalizeLogin] - AppInstanceId found.', appInstanceId)
   
    const request = {
      GrantType: "single-use-token",
      UserId: userId,
      SingleUseToken: authToken,
      DeviceId: environment.deviceId,
      ClientType: environment.clientType,
      AppId: environment.appId,
      AppInstanceId: appInstanceId,
    };

    console.log('[OAuthHandlerPage__FinalizeLogin] - Single Use Token', request);

    let loginResponse = await AuthenticationHelper.login(request)  
    if (loginResponse.isSuccess) {
      console.log('[OAuthHandlerPage__FinalizeLogin] - Login success. Loading current user.');
      await AppServices.instance.userServices.loadCurrentUser();
      console.log('[OAuthHandlerPage__FinalizeLogin] - Login success. Loaded current user.');
    
      console.log(`[OAuthHandlerPage__FinalizeLogin] - Navigation to initial page: ${path }`);
      navigation.replace(path);
    }
    else {
      console.log('Failed logging in with single use token.');

      setFailedAuth(true);
      if (loginResponse.errorMessage) {
        alert(loginResponse.errorMessage);
      }
      else {
        console.log(loginResponse.error);
      }
    }
  };

  const logOut = async () => {
    await AsyncStorage.setItem("isLoggedIn", "false");

    await AsyncStorage.removeItem("jwt");
    await AsyncStorage.removeItem("refreshtoken");
    await AsyncStorage.removeItem("refreshtokenExpires");
    await AsyncStorage.removeItem("jwtExpires");
    await AsyncStorage.removeItem("userInitials");
    await AsyncStorage.removeItem("app_user");
    navigation.replace('authPage');
  };

  useEffect(() => {
    if (initialCall) {
      AsyncStorage.removeItem('oauth_launch');
      AsyncStorage.removeItem('oauth_user');
      AsyncStorage.removeItem('oauth_token');
      AsyncStorage.removeItem('oauth_path');

      setInitialCall(false);

      setTimeout(() => {
        checkStartup();
      }, 1000);


      return () => {    
      }
    }
  }, []);

  return (
    <Page>
      <StatusBar style="auto" />
      <View style={styles.scrollContainer}>
        {failedAuth &&
          <View>
            <Text></Text>
            <IconButton iconType="mci" label="Logout" icon="logout" onPress={() => logOut()} color={colors.errorColor}></IconButton>
          </View>
        }
        {!failedAuth &&
          <View>
            <Text style={{ color: themePalette.shellTextColor }}>Please Wait</Text>
            <IconButton iconType="mci" label="Logout" icon="logout" onPress={() => logOut()} color={colors.errorColor}></IconButton>
          </View>
        }
      </View>
    </Page>
  )
};

export default OAuthHandlerPage;