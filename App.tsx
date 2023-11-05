import * as React from 'react';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppServices from './services/app-services';

import AccountPage from './pages/account.page';
import AuthPage from './pages/auth.page';
import { BlePropertiesPage } from './pages/bleproperties.page';
import ChangeOrgPage from './pages/changeOrgs.page';
import { ConfigureDevicePage } from './pages/configureDevice.page';
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
import { DevicesPage } from './pages/devices.page';
import { InstancePage } from './pages/instance.page';
import { ProfilePage } from './pages/profilePage';
import { DeviceProfilePage } from './pages/deviceProfilePage';
import { WelcomePage } from './pages/welcomePage';
import { AboutPage } from './pages/about.page';
import AssociatePage from './pages/associatePage';
import { DeviceAdvancedPage } from './pages/device-advanced';
import { ConsolePage } from './pages/console.page';

const Stack = createNativeStackNavigator();

const App = () => {
  const [navigationTheme, setNavigationTheme] = React.useState<any>();
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [initialPage, setInitialPage] = useState<string>('splashPage');
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [launchUrl, setLaunchUrl] = useState<string|undefined>(undefined);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
  
  const url = Linking.useURL();  
  if(launchUrl != url){
    if(url) {
      setLaunchUrl(url);
    }
    else 
      console.log('no url passed in');
  }

  const linking = {
    prefixes: ['exp://', 'nuviot://', 'exp://127.0.0.1:19000/--/'],
    config: {
      screens: {
        Home: 'oauthHandlerPage',
      },
    },
  };

  const handleThemeChange = () => {
    let current = AppServices.getAppTheme();
    setThemePalette(current)

    const navTheme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        card: current.shell,
        text: current.shellTextColor
      }
    };

    setNavigationTheme(navTheme);
  }

  const parseSchemeUrl = async (url:string) => {
    const { hostname, path, queryParams } = Linking.parse(url);
    console.log(`app startup with url: ${hostname}, path: ${path} and data: ${JSON.stringify(queryParams)}`);

    if (queryParams && queryParams.userid && queryParams.token) {
      
      await AsyncStorage.setItem('oauth_user', queryParams.userid.toString());
      await AsyncStorage.setItem('oauth_token', queryParams.token.toString());
      await AsyncStorage.setItem('oauth_path', hostname!);
      await AsyncStorage.setItem('oauth_launch', 'true');
      setInitialPage('oauthHandlerPage');
    }
  }

  const initialLoad = async () => {
    let themeName = (await AsyncStorage.getItem("active_theme")) ?? "light";
    let theme = ThemePaletteService.getThemePalette(themeName);
    AppServices.setAppTheme(theme);

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
    if (url) {
      parseSchemeUrl(url)
    }
    
    if (initialCall) {
      initialLoad();
    }

    let changed = AppServices.themeChangeSubscription.addListener('changed', () => handleThemeChange())
    setSubscription(changed);

    return (() => { if (subscription) AppServices.themeChangeSubscription.remove(subscription); })
  },[url]);

  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <Stack.Navigator initialRouteName={initialPage} screenOptions={{ headerBackTitleVisible: false }}>
        <Stack.Screen name="accountPage" component={AccountPage} options={{ title: 'Settings' }} />
        <Stack.Screen name="oauthHandlerPage" component={OAuthHandlerPage} options={{ title: 'Third Party Login' }} />
        <Stack.Screen name="authPage" component={AuthPage} options={{ title: ' ' }} />
        <Stack.Screen name="blePropertiesPage" component={BlePropertiesPage} options={{ title: 'Device Properties' }} />
        <Stack.Screen name="changeOrgsPage" component={ChangeOrgPage} options={{ title: 'Organizations' }} />
        <Stack.Screen name="configureDevice" component={ConfigureDevicePage} options={{ title: 'Configure Device' }} />
        <Stack.Screen name="liveDevicePage" component={LiveDevicePage} options={{ title: 'Device Info' }} />
        <Stack.Screen name="deviceProfilePage" component={DeviceProfilePage} options={{ title: 'Device Profile' }} />
        <Stack.Screen name="dfuPage" component={DfuPage} options={{ title: 'Update Firmware' }} />
        <Stack.Screen name="homePage" component={HomePage} options={{ title: 'Home' }} />
        <Stack.Screen name="welcome" component={WelcomePage} options={{ title: 'Welcome' }} />
        <Stack.Screen name="provisionPage" component={ProvisionPage} options={{ title: 'Provision' }} />
        <Stack.Screen name="registerPage" component={RegisterPage} options={{ title: ' ' }} />
        <Stack.Screen name="scanPage" component={ScanPage} options={{ title: 'Scan for Devices' }} />
        <Stack.Screen name="associatePage" component={AssociatePage} options={{ title: 'Associate Existing Device' }} />
        <Stack.Screen name="sensorsPage" component={SensorsPage} options={{ title: 'Sensors' }} />
        <Stack.Screen name="settingsPage" component={ConnectivityPage} options={{ title: 'Configure Device: Connectivity' }} />
        <Stack.Screen name="splashPage" component={SplashPage} options={{ title: 'Welcome' }} />
        <Stack.Screen name="tempSensorsPage" component={TempSensorPage} options={{ title: 'Sensors' }} />
        <Stack.Screen name="instancePage" component={InstancePage} options={{ title: 'Devices' }} />
        <Stack.Screen name="devicesPage" component={DevicesPage} options={{ title: 'Devices' }} />
        <Stack.Screen name="profilePage" component={ProfilePage} options={{ title: 'Profile' }} />
        <Stack.Screen name="aboutPage" component={AboutPage} options={{ title: 'About' }} />
        <Stack.Screen name="advancedPage" component={DeviceAdvancedPage} options={{ title: 'Advanced' }} />
        <Stack.Screen name="consolePage" component={ConsolePage} options={{ title: 'Console' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
