
import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import styles from '../styles';
import * as Linking from 'expo-linking';
import { StyleSheet, Image, Text, PermissionsAndroid, ActivityIndicator, View, TextInput, TouchableOpacity, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { IReactPageServices } from "../services/react-page-services";
import ViewStylesHelper from "../utils/viewStylesHelper";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../styles.colors";
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";

export const RegisterPage = ({ navigation, props, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);

  const [isBusy, setIsBusy] = useState(false);
  const [externalProviders, setExternalProviders] = useState<string[]>(['GitHub', 'Microsoft', 'Google', 'LinkedIn', 'Twitter']);
  const [hostname, setHostname] = useState<string | undefined>('192-168-254-15');

  const login = async () => {
    navigation.replace('authPage');
  }

  const loginExternal = async (provider: string) => {
    const url = `https://www.nuviot.com/mobile/login/oauth/${provider}?expo_dev_ip_addr=${hostname}&mobile_app_scheme=nuviot`;
    setIsBusy(true);
    await Linking.openURL(url).finally(() => setIsBusy(false));
  };

  const logoAuthImageStyle: ImageStyle = ViewStylesHelper.combineImageStyles([styles.logoImage, styles.mt_10]);
  const submitButtonExternalLoginStyle = ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin, { backgroundColor: themePalette.buttonTertiary, borderColor: themePalette.buttonTertiaryBorderColor }]);
  const submitButtonExternalLoginTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonTertiaryText }]);
  const providersFlexView = ViewStylesHelper.combineViewStyles([styles.pt_10, styles.flexView_wrap_row]);
  const callToActionView = ViewStylesHelper.combineTextStyles([styles.pt_10, styles.mt_20]);

  useEffect(() => {
    (async () => {
      setIsBusy(true);
      await appServices.userServices.getThemePalette()
        .then(response => {
          setThemePalette(response);
        })
        .finally(() => setIsBusy(false));
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themePalette.background }]}>
      {
        !isBusy &&
        <View>
          <Icon.Button size={30} name="close" color={colors.black} backgroundColor={colors.transparent} onPress={() => navigation.navigate('splashPage')}></Icon.Button>
        </View>
      }
      <Image style={logoAuthImageStyle} source={require('../assets/icon.png')} />
      {
        !isBusy && externalProviders &&
        <View style={styles.formGroup}>
          <View style={providersFlexView}>
            {
              externalProviders && externalProviders.map((provider: string, i: number) => {
                // @ts-ignore
                return <Icon.Button
                  key={`button-${i}`}
                  name={`logo-${provider === 'Microsoft' ? 'windows' : provider.toLocaleLowerCase()}`}
                  style={submitButtonExternalLoginStyle}
                  color={themePalette.shellTextColor}
                  backgroundColor={colors.transparent}
                  onPress={() => loginExternal(provider)}>
                  <Text style={submitButtonExternalLoginTextStyle}> Sign in with {provider} </Text>
                </Icon.Button>
              })
            }
          </View>
        </View>
      }
      {
        isBusy &&
        <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
          <Text style={styles.spinnerText}>Please Wait</Text>
          <ActivityIndicator color={colors.primaryColor} size="large" animating={isBusy} />
        </View>
      }
      {
        !isBusy && <View style={styles.authCallToActionView}>
          <View style={callToActionView} onTouchStart={() => login()}>
            <Text style={[styles.authActionHeaders, { color: themePalette.shellTextColor }]}>Already have an Account? <Text style={styles.authActionLink}>Sign in.</Text></Text>
          </View>
        </View>
      }
    </View>
  );
}

export default RegisterPage