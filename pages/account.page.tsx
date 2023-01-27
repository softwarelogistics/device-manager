import React, { useEffect, useState } from 'react';

import { IReactPageServices } from '../services/react-page-services';
import { Text,View, TouchableOpacity, ActivityIndicator, TextStyle, Switch, } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

import AppServices from '../services/app-services';


import styles from '../styles';
import colors from '../styles.colors';
import fontSizes from '../styles.fontSizes';
import ViewStylesHelper from '../utils/viewStylesHelper';
import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import palettes from '../styles.palettes';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Page from '../mobile-ui-common/page';
import EditField from '../mobile-ui-common/edit-field';
import { Subscription } from '../utils/NuvIoTEventEmitter';
import { ble, NuvIoTBLE } from '../NuvIoTBLE';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserSelections = {
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
};

export const AccountPage = ({ props, navigation, route }: IReactPageServices) => {

  const [appServices, setAppServices] = useState<AppServices>(new AppServices());
  const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  const [previousColorTheme, setPreviousColorTheme] = useState<string>();
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState(false);
  const [simulatedBLD, setSimulatedBLE] = useState<boolean>(ble.simulatedBLE());
  const [user, setUser] = useState<Users.AppUser>();

  const [selections, setSelections] = useState<UserSelections>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: themePalette.shellTextColor }]);
  const switchTrackColorSetting: any = { false: colors.accentColor, true: colors.accentColor};

  const  setDarkTheme = async () => {
    let nextPalette = ThemePaletteService.getThemePalette('dark')
    await AsyncStorage.setItem('active_theme', 'dark');
    AppServices.setAppTheme(nextPalette);
    AppServices.themeChangeSubscription?.emit('changed', 'dark');
    setSelectionProperty('colorTheme', 'dark');
  }

  const setLightTheme = async () => {
    let nextPalette = ThemePaletteService.getThemePalette('light')
    await AsyncStorage.setItem('active_theme', 'light');
    AppServices.setAppTheme(nextPalette);
    AppServices.themeChangeSubscription?.emit('changed', 'light');
    setSelectionProperty('colorTheme', 'light');
  }

  const simulateChanged = (e: boolean) => {
    if(e)
      ble.enableSimulator();
    else
      ble.disableSimulator();

    setSimulatedBLE(e);
  
    console.log("SIMULATED BLE" + ble.simulatedBLE() + "  " + e);
  }

  const handleUserPropertyChange = (e: any, name: string) => {
    console.log(`handleUserPropertyChange: ${name}: e`, e);    

    let value: string = (e === undefined || e === '-1') || e._dispatchInstances?.memoizedProps === undefined && (e.target?.value === 'undefined' || e.target?.value === '-1' || e.target?.value === '')
      ? ''
      : e._dispatchInstances?.memoizedProps === undefined
        ? (e.target?.value || e)
        : e._dispatchInstances.memoizedProps?.testID;

    console.log('handleUserPropertyChange: value', value);

    setSelectionProperty(name, value);
  };

  const save = async () => {
    if (user) {
      user.firstName = selections.firstName;
      user.lastName = selections.lastName;
      user.phoneNumber = selections.phoneNumber;
      
      await appServices.userServices.updateUser(user);
      await appServices.userServices.setUser(user!)
        .then(success => {
          setIsBusy(false);
          if (success) {
            navigation.navigate('homePage');
          }
          else {
            alert('Could not save updates; please contact support.');
          }
        });
    }
    else {
      alert('Local user parameter not found.');
    }
  };

  const setSelectionProperty = (name: string, value: string | undefined) => {
    setSelections((current: UserSelections) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    if (initialCall) {
      appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) })
      appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) })
      setInitialCall(false);
    }

    setThemePalette(AppServices.getAppTheme());
  
    if (!user) {
      (async () => {
        const promisesToKeep: Promise<any>[] = [
          appServices.userServices.getThemeName(),
          
        ];
        await Promise.all(promisesToKeep)
          .then(async responses => {
            const colorTheme: string = responses[0];
            setPreviousColorTheme(colorTheme);

            const simulationEnabled: boolean = responses[1];
            await appServices.userServices.getUser()
              .then(async response => {
                if (response) {
                  setThemePalette(response.themePalette);
                  setUser(response);
                  setSelections({
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    phoneNumber: response.phoneNumber,                    
                  });
                }
                else {
                  alert('Session Expired. Please log in again.');
                }
              })

          });
      })();
    }

    console.log('userEffect: selections', selections);
    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()) );
    setSubscription(changed);
    return (() => {if (subscription)AppServices.themeChangeSubscription.remove(subscription);})


  }, [selections]);

  return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
    {
      !isBusy &&
      <KeyboardAwareScrollView style={styles.scrollContainer} >
        <EditField label="Email" editable={false} placeHolder='enter first name' value={selections.email}  />
        <EditField onChangeText={e => { handleUserPropertyChange(e, 'firstName');}} label="First Name" placeHolder='enter first name' value={selections.firstName}  />
        <EditField onChangeText={e => { handleUserPropertyChange(e, 'lastName');}} label="Last Name" placeHolder='enter last name' value={selections.lastName}  />
        <EditField onChangeText={e => { handleUserPropertyChange(e, 'phoneNumber');}} label="Phone" placeHolder='enter phone number' value={selections.phoneNumber}  />

        <Text style={inputLabelStyle}>Color Theme</Text>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity testID='light' style={[styles.submitButton, { minWidth: '48%', height: 40, paddingVertical: (fontSizes.medium / 2), backgroundColor: colors.white, borderColor: colors.black, borderWidth: 1 }]} 
                onPress={e => setLightTheme()}>
            {
              themePalette.name === 'light'
                ? <Icon name="checkmark-circle" style={{ textAlign: 'center', fontSize: fontSizes.medium, color: 'green' }}><Text style={{ color: 'black' }}> Light Mode </Text></Icon>
                : <Text style={{ textAlign: 'center', fontSize: fontSizes.medium }}> Light Mode </Text>
            }
          </TouchableOpacity>
          <TouchableOpacity testID='dark' style={[styles.submitButton, { minWidth: '48%', height: 40, paddingVertical: (fontSizes.medium / 2), backgroundColor: colors.black, borderColor: colors.black, borderWidth: 1 }]} 
                onPress={e => setDarkTheme()}>
            {
              themePalette.name === 'dark'
                ? <Icon name="checkmark-circle" style={{ textAlign: 'center', fontSize: fontSizes.medium, color: 'green' }}><Text style={{ color: colors.white }}> Dark Mode </Text></Icon>
                : <Text style={{ textAlign: 'center', fontSize: fontSizes.medium, color: colors.white }}> Dark Mode </Text>
            }
          </TouchableOpacity>
        </View>
    
        {ble.hasBLE() && <View style={[styles.flex_toggle_row, { marginTop: 20 }]}>
          <Text style={inputLabelStyle}>Simulate Devices:</Text>
           <Switch onValueChange={e => simulateChanged(e)} value={simulatedBLD}
            trackColor={switchTrackColorSetting}
            thumbColor={colors.primaryColor}></Switch>
        </View>}

        {!ble.hasBLE() &&  
          <Text style={inputLabelStyle}>No BLE Device - Simulating</Text>
        }

        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: themePalette.buttonPrimary }]} onPress={e => save()}>
            <Icon name="save" color={themePalette.shellTextColor} style={{ textAlign: 'center', fontSize: fontSizes.large, color: themePalette.buttonPrimaryText }}>
              <Text> Save </Text>
            </Icon>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    }
    {
      isBusy &&
      <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={[styles.spinnerText, { color: themePalette.shellTextColor }]}>Please Wait</Text>
        <ActivityIndicator color={colors.primaryColor} size="large" animating={isBusy} />
      </View>
    }

  </Page>;
}

export default AccountPage;