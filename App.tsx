import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppServices from './services/app-services';

import SettingsPage from './pages/settings.page';
import AuthPage from './pages/auth.page';
import { BlePropertiesPage } from './pages/bleproperties.page';
import ChangeOrgPage from './pages/changeOrgs.page';
import { DeviceOptionsPage } from './pages/deviceOptions.page';
import { ConnectivityPage } from './pages/connectivity.page';
import { LiveDevicePage } from './pages/liveDevice.page';
import DfuPage from './pages/dfu.page';
import HomePage from './pages/home.page';
import ProvisionPage from './pages/provision.page';
import RegisterPage from './pages/register.page';
import ScanPage from './pages/scan.page';
import { SensorsPage } from './pages/sensors.page';
import SplashPage from './pages/splash.page';
import { TempSensorPage } from './pages/tempSensor.page';
import { useEffect, useState } from 'react';

import { OAuthHandlerPage } from './pages/oauthHandlerPage';
import { Subscription } from './utils/NuvIoTEventEmitter';
import { ThemePalette, ThemePaletteService } from './styles.palette.theme';
import { InstancePage } from './pages/instance.page';
import { UserOptionsPage } from './pages/userOptionsPage';
import { DeviceProfilePage } from './pages/deviceProfilePage';
import { WelcomePage } from './pages/welcomePage';
import { AboutPage } from './pages/about.page';
import AssociatePage from './pages/associatePage';
import { DeviceAdvancedPage } from './pages/device-advanced';
import { ConsolePage } from './pages/console.page';
import { SeaWolfHomePage } from './pages/seawolfHome.page';
import { CanMonitorPage } from './pages/canmonitor.page';
import CreateOrgPage from './pages/createOrg.page';
import ConfirmEmailPage from './pages/confirmEmail.page';
import AcceptInvitePage from './pages/acceptInvite.page';
import colors from './styles.colors';
import palettes from './styles.palettes';

const Stack = createNativeStackNavigator();

const App = () => {
  const [navigationTheme, setNavigationTheme] = useState<any>();
  const [initialPage, setInitialPage] = useState<string>('splashPage');
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

  const [loadMessage, setLoadMessage] = useState<string>('Loading...');
  const url = Linking.useURL();
  const linking = {
    prefixes: ['exp://', 'nuviot://', 'exp://127.0.0.1:19000/--/'],
    config: {
      screens: {
        Home: 'oauthHandlerPage',
      },
    },
  };

  const handleThemeChange = () => {
    let current = AppServices.instance.getAppTheme();

    const navTheme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        card: current.shell,
        text: current.shellTextColor,
        primary: 'blue',
      }
    };

    setNavigationTheme(navTheme);
  }
  
  const parseSchemeUrl = async (url:string) => {
    const { hostname, path, queryParams } = Linking.parse(url);
    console.log(`[App_parseSchemeUrl] start up with url: ${hostname}, path: ${path} and data: ${JSON.stringify(queryParams)}`);

    if (queryParams && queryParams.userid && queryParams.token) {
      let userId = queryParams.userid.toString();
      let token = queryParams.token.toString();
      let startupPage = path ?? 'home';

      startupPage = startupPage.replace('--/','')

      console.log(`[App_parseSchemeUrl] success: userId=${userId}; token=${token}; startupPage = '${startupPage}'; hostname = '${hostname};`)
      await AsyncStorage.setItem('oauth_user', userId);
      await AsyncStorage.setItem('oauth_token', token);
      await AsyncStorage.setItem('oauth_path', startupPage!);
      await AsyncStorage.setItem('oauth_launch', 'true');
      setInitialPage('oauthHandlerPage');
    }
  }

  const initialLoad = async () => {
    let themeName = (await AsyncStorage.getItem("active_theme")) ?? "light";
    let theme = ThemePaletteService.getThemePalette(themeName);
    AppServices.instance.setAppTheme(theme);

    const navTheme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        card: theme.shell,
        text: theme.shellTextColor
      }
    };

    setNavigationTheme(navTheme);
    setInitialCall(false);
  }

  useEffect(() => {
    setLoadMessage('Loading...' + new Date().toLocaleTimeString());
    if (url) {
      parseSchemeUrl(url)
    }

    if (initialCall) {
      initialLoad();
    }
    
    return (() => {  })
  },[url]);
  
  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <Stack.Navigator initialRouteName={initialPage} screenOptions={{ headerBackTitleVisible: false,  headerTintColor: palettes.primary.white, headerStyle: { backgroundColor: colors.primaryBlue } }}>
        <Stack.Screen name="splashPage" component={SplashPage} options={{ title: 'Welcome' }} />
        <Stack.Screen name="oauthHandlerPage" component={OAuthHandlerPage} options={{ title: 'Third Party Login' }} />
        <Stack.Screen name="authPage" component={AuthPage} options={{ title: ' ' }} />
   
        <Stack.Screen name="registerPage" component={RegisterPage} options={{ title: ' ' }} />
  
        <Stack.Screen name="userOptionsPage" component={UserOptionsPage} options={{ title: 'Menu' }} />
        <Stack.Screen name="settingsPage" component={SettingsPage} options={{ title: 'Settings' }} />
        <Stack.Screen name="aboutPage" component={AboutPage} options={{ title: 'About' }} />
   
        <Stack.Screen name="createorg" component={CreateOrgPage} options={{ title: 'Create New Organization' }} />
        <Stack.Screen name="changeOrgsPage" component={ChangeOrgPage} options={{ title: 'Organizations' }} />
        <Stack.Screen name="confirmemail" component={ConfirmEmailPage} options={{ title: 'Confirm Email' }} />
        <Stack.Screen name="acceptInvite" component={AcceptInvitePage} options={{ title: 'Accept Invitation' }} />
   

        <Stack.Screen name="home" component={HomePage} options={{ title: 'Home' }} />
        <Stack.Screen name="homePage" component={HomePage} options={{ title: 'Home' }} />
        <Stack.Screen name="seaWolfHomePage" component={SeaWolfHomePage} options={{ title: 'SeaWolf Home' }} />
        <Stack.Screen name="welcome" component={WelcomePage} options={{ title: 'Welcome' }} />
        <Stack.Screen name="homeWelcome" component={WelcomePage} options={{ title: 'Welcome' }} />
      
        <Stack.Screen name="deviceOptionsPage" component={DeviceOptionsPage} options={{ title: 'Configure Device' }} />
        <Stack.Screen name="liveDevicePage" component={LiveDevicePage} options={{ title: 'Device Info' }} />
        <Stack.Screen name="deviceProfilePage" component={DeviceProfilePage} options={{ title: 'Device Profile' }} />
        <Stack.Screen name="provisionPage" component={ProvisionPage} options={{ title: 'Provision' }} />
  
        <Stack.Screen name="scanPage" component={ScanPage} options={{ title: 'Scan for Devices' }} />
        <Stack.Screen name="associatePage" component={AssociatePage} options={{ title: 'Associate Existing Device' }} />
       
        <Stack.Screen name="instancePage" component={InstancePage} options={{ title: 'Devices' }} />
       
        <Stack.Screen name="dfuPage" component={DfuPage} options={{ title: 'Update Firmware' }} />
        <Stack.Screen name="sensorsPage" component={SensorsPage} options={{ title: 'Sensors' }} />
        <Stack.Screen name="connectivityPage" component={ConnectivityPage} options={{ title: 'Device Connectivity' }} />
        <Stack.Screen name="tempSensorsPage" component={TempSensorPage} options={{ title: 'Sensors' }} />
        <Stack.Screen name="advancedPage" component={DeviceAdvancedPage} options={{ title: 'Advanced' }} />
   
        <Stack.Screen name="consolePage" component={ConsolePage} options={{ title: 'Console' }} />
        <Stack.Screen name="canMonitorPage" component={CanMonitorPage} options={{ title: 'Can Monitor' }} />
   
        <Stack.Screen name="blePropertiesPage" component={BlePropertiesPage} options={{ title: 'Device Properties' }} />
   
      </Stack.Navigator>
    </NavigationContainer> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {Stack};

export default App;