import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AsyncStorage from "@react-native-async-storage/async-storage";
import AppServices from './services/app-services';

import { useEffect, useState } from 'react';

import { ThemePalette, ThemePaletteService } from './styles.palette.theme';

import colors from './styles.colors';
import palettes from './styles.palettes';
import { WiFiSetupPage } from './pages/wifiSetuppage';

const Stack = createNativeStackNavigator();

const WiFiOnlyApp = () => {
  const [navigationTheme, setNavigationTheme] = useState<any>();
  const [initialPage, setInitialPage] = useState<string>('wifi');
  const [initialCall, setInitialCall] = useState<boolean>(true);

  

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
    return (() => {  })
  });
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="wifi" screenOptions={{ headerBackTitleVisible: false,  headerTintColor: palettes.primary.white, headerStyle: { backgroundColor: colors.primaryBlue } }}>
        <Stack.Screen name="wifi" component={WiFiSetupPage} options={{ title: 'Set WiFi' }} />
     
   
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

export default WiFiOnlyApp;