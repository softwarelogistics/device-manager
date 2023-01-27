
import { useEffect, useState } from "react";
import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native';
import { AppState } from 'react-native';
import { finalize, retry } from "rxjs";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import AuthenticationHelper from "../utils/authenticationHelper";

import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";

import ViewStylesHelper from "../utils/viewStylesHelper";
import { ThemePalette } from "../styles.palette.theme";
import colors from "../styles.colors";
import styles from '../styles';

export const OAuthHandlerPage = ({ props, navigation, route }: IReactPageServices) => {

  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [theme, setTheme] = useState<string>('');

  const [isBusy, setIsBusy] = useState<boolean>(true);
  const [allDone, setAllDone] = useState<boolean>(false);
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);

  const submitButtonWhiteTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonPrimaryText }]);

  const checkStartup = async () => {
    console.log('checking startup' + retryAttempt);
    let ola = await AsyncStorage.getItem('oauth_launch');
    if (ola == 'true') {
      console.log('found expected values')
      let oAuthUser = await AsyncStorage.getItem('oauth_user');
      let oAuthToken = await AsyncStorage.getItem('oauth_token');
      let initialPath = await AsyncStorage.getItem('oauth_path');
      console.log(oAuthUser, oAuthToken, initialPath);
      await AsyncStorage.removeItem('oauth_launch');
      await AsyncStorage.removeItem('oauth_user');
      await AsyncStorage.removeItem('oauth_token');
      await AsyncStorage.removeItem('oauth_path');
      window.setTimeout(() => finalizeLogin(oAuthUser!, oAuthToken!, initialPath!));
    }
    else {
      if (retryAttempt < 100) {
        setTimeout(checkStartup, 100);
        setRetryAttempt(retryAttempt + 1);
      }
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
      console.log('loginResponse', loginResponse);

      if (loginResponse.isSuccess) {
        let path = loginResponse.navigationTarget!;
        navigation.replace(path);
      }
      else {
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
    setAllDone(true);
    navigation.replace('authPage');
  };

  useEffect(() => {
    if (initialCall) {
      AsyncStorage.removeItem('oauth_launch');
      AsyncStorage.removeItem('oauth_user');
      AsyncStorage.removeItem('oauth_token');
      AsyncStorage.removeItem('oauth_path');

      checkStartup();

      setInitialCall(false);
    }
  });

  return (
    <View style={styles.scrollContainer}>
      <MciIcon.Button
        name="logout"
        style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin, { backgroundColor: colors.errorColor, borderColor: '#AA0000' }])}
        color={colors.white}
        backgroundColor={colors.transparent}
        onPress={() => logOut()}>
        <Text style={submitButtonWhiteTextStyle}> Log Out </Text>
      </MciIcon.Button>
    </View>
  )
};

export default OAuthHandlerPage;