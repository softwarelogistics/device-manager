import { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import AuthenticationHelper from "../utils/authenticationHelper";

import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";

import ViewStylesHelper from "../utils/viewStylesHelper";
import { ThemePalette } from "../styles.palette.theme";
import colors from "../styles.colors";
import styles from '../styles';
import Page from "../mobile-ui-common/page";

export const OAuthHandlerPage = ({ props, navigation, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());

  const [timer, setTimer] = useState<NodeJS.Timer | null>(null)
  const [failedAuth, setFailedAuth] = useState<boolean>(false);
  const [initialCall, setInitialCall] = useState<boolean>(true);

  const submitButtonWhiteTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonPrimaryText }]);

  const checkStartup = async () => {
    console.log('check startup called.');
    let ola = await AsyncStorage.getItem('oauth_launch');
    if (ola == 'true') {
      console.log('ola is true, calling next chunk of code.');
      await AsyncStorage.removeItem('oauth_launch');
      clearTimeout(timer!);
      setTimer(null)
      let oAuthUser = await AsyncStorage.getItem('oauth_user');
      let oAuthToken = await AsyncStorage.getItem('oauth_token');
      let initialPath = await AsyncStorage.getItem('oauth_path');
      await AsyncStorage.removeItem('oauth_launch');
      await AsyncStorage.removeItem('oauth_user');
      await AsyncStorage.removeItem('oauth_token');
      await AsyncStorage.removeItem('oauth_path');
      finalizeLogin(oAuthUser!, oAuthToken!, initialPath!);
    }
  }

  const finalizeLogin = async (userId: string, authToken: string, path: string) => {
    let appInstanceId = await AsyncStorage.getItem('appInstanceId')
    appInstanceId = appInstanceId || AuthenticationHelper.newUuid();

    if (path && (path.endsWith('home') || path.endsWith('welcome'))) {
      const request = {
        "GrantType": "single-use-token",
        "UserId": userId,
        "SingleUseToken": authToken,
        "AppId": "nuviot-devicemgr",
        "AppInstanceId": appInstanceId,
      };

      console.log('attempting external login with request', request);

      let loginResponse = await AuthenticationHelper.login(request)
      await appServices.userServices.loadCurrentUser();
      if (loginResponse.isSuccess) {
        console.log('GTG - Navigate home.');
        let path = loginResponse.navigationTarget!;
        navigation.replace(path);
      }
      else {
        setFailedAuth(true);
        if (loginResponse.errorMessage) {
          alert(loginResponse.errorMessage);
        }
        else {
          console.log(loginResponse.error);
        }
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
    console.log('use effect called')
~
    // navigation.reset({
    //   index: 0,
    //   routes: [{name: 'oauthHandlerPage'}],
    // });

    console.log('navigation was reset.')

    let changedSubscription = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    if (initialCall) {
      AsyncStorage.removeItem('oauth_launch');
      AsyncStorage.removeItem('oauth_user');
      AsyncStorage.removeItem('oauth_token');
      AsyncStorage.removeItem('oauth_path');

      setInitialCall(false);

      let timer = setInterval(() => {
        checkStartup();
      }, 1000);

      setTimer(timer);

      return () => {
        clearTimeout(timer);
        AppServices.themeChangeSubscription.remove(changedSubscription);
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

          <MciIcon.Button
            name="logout"
            style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin, { backgroundColor: colors.errorColor, borderColor: '#AA0000' }])}
            color={colors.white}
            backgroundColor={colors.transparent}
            onPress={() => logOut()}>
            <Text style={submitButtonWhiteTextStyle}> Log Out </Text>
          </MciIcon.Button>
        </View>
      }
      {!failedAuth && 
      <View>
        <Text style={{color:themePalette.shellTextColor}}>Please Wait</Text>
        <MciIcon.Button
        name="logout"
        style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin, { backgroundColor: colors.errorColor, borderColor: '#AA0000' }])}
        color={colors.white}
        backgroundColor={colors.transparent}
        onPress={() => logOut()}>
        <Text style={submitButtonWhiteTextStyle}> Try Again </Text>
      </MciIcon.Button>
      </View>
      }
    </View>
    </Page>
  )
};

export default OAuthHandlerPage;