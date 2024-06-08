import React, { useState, useEffect } from "react";
import styles from '../styles';
import * as Linking from 'expo-linking';
import { Image, Text, View } from 'react-native';
import { IReactPageServices } from "../services/react-page-services";
import AuthenticationHelper from '../utils/authenticationHelper';
import AppServices from "../services/app-services";
import Constants from 'expo-constants'
import NavButton from "../mobile-ui-common/nav-button";
import { logoAuthImageStyle } from "../mobile-ui-common/control-styles";
import EditField from "../mobile-ui-common/edit-field";
import ProgressSpinner from "../mobile-ui-common/progress-spinner";
import Page from "../mobile-ui-common/page";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HttpClient } from "../core/utils";
import IconButton from '../mobile-ui-common/icon-button';

export const AuthPage = ({ navigation, props, route }: IReactPageServices) => {
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

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

  let themePalette  = AppServices.instance.getAppTheme();

  const login = async (email: string, password: string) => {

    setIsBusy(true);

    let loginResponse = await AuthenticationHelper.passwordLogin(email, password);
    if (loginResponse.isSuccess) {
      console.log(loginResponse);
      let user = await AppServices.instance.userServices.loadCurrentUser();
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

  useEffect(() => {

    return (() => {
    })
  }, []);

  const closeView = () => {
    if (isSignInEmail)
      setIsSignInEmail(false);
    else
      navigation.replace("splashPage");
  }

  const loginExternal = async (provider: string) => {
    setIsBusy(true);
    let url = `${HttpClient.getWebUrl()}/mobile/login/oauth/${provider}?mobile_app_scheme=nuviot`;

    if (Constants.expoConfig?.hostUri) {
      let hostName = Constants.expoConfig?.hostUri?.split(':')[0] as string;
      let localIp = hostName.replace('.', '-').replace('.', '-').replace('.', '-').replace('.', '-');

      url = `${HttpClient.getWebUrl()}/mobile/login/oauth/${provider}?expo_dev_ip_addr=${localIp}&mobile_app_scheme=nuviot`;
    }

    console.log('[AuthPage__loginExternal] - OAuth Flow: ' + url);
    await Linking.openURL(url).finally(() => setIsBusy(false));
    console.log('[AuthPage__loginExternal] - Opened Browser, Nav to OAuth Page to Wait for Callback.');
    navigation.replace('oauthHandlerPage');
  };

  const register = async () => {
    navigation.replace('registerPage');
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  });

  return (
    <Page>
      <View style={{ marginTop: 40, padding: 16, width: "100%", height: "100%", backgroundColor: themePalette.background }} >

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

            <View style={styles.formGroup}>
              <Text style={[styles.header, { color: themePalette.shellTextColor }]}>Login with Email</Text>
              <EditField onChangeText={e => setEmail(e)} label='Email' placeHolder="please enter email" />
              <EditField onChangeText={e => setPassword(e)} label='Password' secureTextEntry={true} placeHolder="password" />

              {false && <Text style={styles.authForgotPasswordLink}>Forgot Password?</Text>}

              {/* <StatusBar style="auto"  /> */}
              <IconButton color={themePalette.buttonPrimaryText} label="Log In" icon="login" iconType="mci" onPress={() => login(email, password)} ></IconButton>
              <IconButton color={themePalette.buttonPrimaryText} label="Cancel" icon="arrow-collapse-left" iconType="mci" onPress={() => setIsSignInEmail(false)} ></IconButton>
            </View>
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

            <IconButton color={themePalette.buttonPrimaryText} label="Cancel" icon="arrow-collapse-left" iconType="mci" onPress={() => closeView()} ></IconButton>

          </View>
        }
      </View>
    </Page>
  );
}

export default AuthPage