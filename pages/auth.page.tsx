import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import styles from '../styles';
import * as Linking from 'expo-linking';
import { Image, Text, View } from 'react-native';
import { IReactPageServices } from "../services/react-page-services";
import AuthenticationHelper from '../utils/authenticationHelper';
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";
import Constants from 'expo-constants'
import NavButton from "../mobile-ui-common/nav-button";
import { callToActionView, logoAuthImageStyle } from "../mobile-ui-common/control-styles";
import EditField from "../mobile-ui-common/edit-field";
import StdButton from "../mobile-ui-common/std-button";
import ThemeSwitcher from "../mobile-ui-common/theme-switcher";
import ProgressSpinner from "../mobile-ui-common/progress-spinner";
import Page from "../mobile-ui-common/page";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import Icon from "react-native-vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HttpClient } from "../core/utils";

export const AuthPage = ({ navigation, props, route }: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isSignInEmail, setIsSignInEmail] = useState<boolean>(false);
  const [externalProviders] = useState<any>([{ name: 'GitHub', logo: require('../assets/loginicons/github.png') },
  { name: 'Microsoft', logo: require('../assets/loginicons/microsoft.png') },
  { name: 'Google', logo: require('../assets/loginicons/google.png') },
  { name: 'LinkedIn', logo: require('../assets/loginicons/linkedin.png') },
  { name: 'Twitter', logo: require('../assets/loginicons/twitter.png') }]);
  //const [externalProviders, setExternalProviders] = useState<string[]>([]);

  useEffect(() => {
    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);
    return (() => {
      if (subscription)
        AppServices.themeChangeSubscription.remove(subscription);
    })
  }, []);

  const login = async (email: string, password: string) => {

    setIsBusy(true);

    let loginResponse = await AuthenticationHelper.passwordLogin(email, password);
    if (loginResponse.isSuccess) {
      console.log(loginResponse);
      let user = await appServices.userServices.loadCurrentUser();
      console.log(user);
      setIsBusy(false);
      if (user != null) {
        navigation.replace(loginResponse.navigationTarget);
      }
    }
    else {
      setIsBusy(false);
      if (loginResponse.errorMessage) {
        alert(loginResponse.errorMessage);
      }
      else {
        console.log(loginResponse.error);
      }
    }
  };

  const closeView = () => {
    if(isSignInEmail) 
      setIsSignInEmail(false);
    else 
      navigation.replace("splashPage");
  }

  const loginExternal = async (provider: string) => {
    setIsBusy(true);
    let url = `${HttpClient.getWebUrl()}/mobile/login/oauth/${provider}?mobile_app_scheme=nuviot`;
    if (Constants.manifest?.hostUri) {
      let hostName = Constants.manifest?.hostUri?.split(':')[0] as string;
      let localIp = hostName.replace('.', '-').replace('.', '-').replace('.', '-').replace('.', '-');

      url = `${HttpClient.getWebUrl()}/mobile/login/oauth/${provider}?expo_dev_ip_addr=${localIp}&mobile_app_scheme=nuviot`;      
    }

    console.log('login now with: ' + url);

    await Linking.openURL(url).finally(() => setIsBusy(false));    
    console.log('i am back and replacing');
    navigation.replace('oauthHandlerPage');
  };

  const register = async () => {
    navigation.replace('registerPage');
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <Page>
      <Icon.Button size={36} style={{marginTop:60}} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={closeView} name='close-outline' />

      <Image style={logoAuthImageStyle} source={require('../assets/app-icon.png')} />
      {
        isBusy &&
        <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
          <Text style={[styles.spinnerText, { color: themePalette.shellTextColor }]}>Please Wait</Text>
          <ProgressSpinner isBusy={isBusy} />
        </View>
      }
      {
        !isBusy && isSignInEmail &&
        <KeyboardAwareScrollView style={styles.formGroup}>

          <Text style={[styles.header, { color: themePalette.shellTextColor }]}>Login with Email</Text>
          <EditField onChangeText={e => setEmail(e)} label='Email' placeHolder="please enter email" />
          <EditField onChangeText={e => setPassword(e)} label='Password' secureTextEntry={true} placeHolder="password" />

          {false && <Text style={styles.authForgotPasswordLink}>Forgot Password?</Text>}

          <StatusBar style="auto"  />
          <StdButton label="Login" onPress={() => login(email, password)} />
        </KeyboardAwareScrollView>
      }
      {
        !isBusy && !isSignInEmail && externalProviders &&
        <View style={styles.formGroup}>
          {
            externalProviders && externalProviders.map((provider: any, i: number) => {
              return (<NavButton key={i} label={provider.name} imageUrl={provider.logo} onPress={() => loginExternal(provider.name)}></NavButton>)
            })
          }
          {
            externalProviders.length > 0 &&
            <Text style={[styles.header, styles.mt_20, { color: themePalette.shellTextColor }]}>OR</Text>
          }
          <NavButton label="Sign in with Email" imageUrl={require('../assets/loginicons/email.png')} onPress={() => setIsSignInEmail(true)}></NavButton>
          
        </View>
      }
    </Page>
  );
}

export default AuthPage