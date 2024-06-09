import React, { useEffect, useState } from "react";

import { IReactPageServices } from "../services/react-page-services";
import { Text, View, TouchableOpacity, TextStyle, Switch, } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import AppServices from "../services/app-services";

import styles from "../styles";
import colors from "../styles.colors";
import ViewStylesHelper from "../utils/viewStylesHelper";
import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Page from "../mobile-ui-common/page";
import EditField from "../mobile-ui-common/edit-field";
import { ble, NuvIoTBLE } from "../NuvIoTBLE";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type UserSelections = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export const SettingsPage = ({
  props,
  navigation,
  route,
}: IReactPageServices) => {

  const [simulatedBLD, setSimulatedBLE] = useState<boolean>(ble.simulatedBLE());
  const [user, setUser] = useState<Users.AppUser>();

  const [selections, setSelections] = useState<UserSelections>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const themePalette: ThemePalette = AppServices.instance.getAppTheme();

  const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([ styles.label, { color: themePalette.shellTextColor }, ]);
  const inputSwitchLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([ styles.labelTitle, { color: themePalette.shellTextColor }, ]);
  const inputSubtitleStyle: TextStyle = ViewStylesHelper.combineTextStyles([ styles.subtitleText, { color: themePalette.subtitleColor }, ]);
  
  const setDarkTheme = async () => {
    let nextPalette = ThemePaletteService.getThemePalette("dark");
    await AsyncStorage.setItem("active_theme", "dark");
    AppServices.instance.setAppTheme(nextPalette);
    AppServices.instance.themeChangeSubscription?.emit("changed", "dark");
    setSelectionProperty("colorTheme", "dark");
  };

  const setLightTheme = async () => {
    let nextPalette = ThemePaletteService.getThemePalette("light");
    await AsyncStorage.setItem("active_theme", "light");
    AppServices.instance.setAppTheme(nextPalette);
    AppServices.instance.themeChangeSubscription?.emit("changed", "light");
    setSelectionProperty("colorTheme", "light");
  };

  const simulateChanged = (e: boolean) => {
    if (e) ble.enableSimulator();
    else ble.disableSimulator();

    setSimulatedBLE(e);
  };

  const handleUserPropertyChange = (e: any, name: string) => {
    let value: string =
      e === undefined ||
      e === "-1" ||
      (e._dispatchInstances?.memoizedProps === undefined &&
        (e.target?.value === "undefined" ||
          e.target?.value === "-1" ||
          e.target?.value === ""))
        ? ""
        : e._dispatchInstances?.memoizedProps === undefined
        ? e.target?.value || e
        : e._dispatchInstances.memoizedProps?.testID;

    setSelectionProperty(name, value);
  };

  const save = async () => {
    if (user) {
      user.firstName = selections.firstName;
      user.lastName = selections.lastName;
      user.phoneNumber = selections.phoneNumber;

      await AppServices.instance.userServices.updateUser(user);
      await AppServices.instance.userServices.setUser(user!).then((success) => {
        if (success) {
          navigation.navigate("homePage");
        } else {
          alert("Could not save updates; please contact support.");
        }
      });
    } else {
      alert("Local user parameter not found.");
    }
  };

  const setSelectionProperty = (name: string, value: string | undefined) => {
    setSelections((current: UserSelections) => ({ ...current, [name]: value }));
  };

  useFocusEffect(() => {
    if (!user) {
      (async () => {
        const promisesToKeep: Promise<any>[] = [
          AppServices.instance.userServices.getThemeName(),
        ];
        await Promise.all(promisesToKeep).then(async (responses) => {
          const colorTheme: string = responses[0];
          const simulationEnabled: boolean = responses[1];
          await AppServices.instance.userServices.getUser().then(async (response) => {
            if (response) {
              setUser(response);
              setSelections({
                firstName: response.firstName,
                lastName: response.lastName,
                email: response.email,
                phoneNumber: response.phoneNumber,
              });
            } else {
              alert("Session Expired. Please log in again.");
            }
          });
        });
      })();
    }
  })

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} >
          <Icon.Button size={24} backgroundColor="transparent" underlayColor="transparent" color={themePalette.shellNavColor} onPress={() => save()} name='save' />
        </View>),
    });

    return () => {
    };
  }, [selections]);

  return (
    <Page>
      <KeyboardAwareScrollView style={[styles.scrollContainer,{backgroundColor: themePalette.background }]}>
        <EditField label="Email" editable={false} placeHolder="enter email" value={selections.email} />
        <EditField onChangeText={(e) => { handleUserPropertyChange(e, "firstName"); }} label="First Name" placeHolder="Enter first name" value={selections.firstName} />
        <EditField onChangeText={(e) => { handleUserPropertyChange(e, "lastName"); }} label="Last Name" placeHolder="Enter last name" value={selections.lastName} />
        <EditField onChangeText={(e) => { handleUserPropertyChange(e, "phoneNumber"); }} label="Phone" placeHolder="Enter phone number" value={selections.phoneNumber} />
        <View style={[ styles.flex_toggle_row, { borderRadius: 8, backgroundColor: themePalette.inputBackgroundColor, height: 64, paddingStart: 16, marginRight: 5, 
                      marginTop: 16, display: "flex", justifyContent: "space-between",alignItems: "center", }]} >
          <View>
            <Text style={inputSwitchLabelStyle}>Dark Theme</Text>
            <Text style={inputSubtitleStyle}> {themePalette.name === "dark" ? "Disable Dark theme" : "Enable Dark theme"} </Text>
          </View>
          <View style={{ width: 70, height: 32, justifyContent: "center", alignItems: "center",}} >
            <Switch onValueChange={(e) => { themePalette.name === "light" ? setDarkTheme() : setLightTheme(); }}
              value={themePalette.name === "dark"} trackColor={{ false: colors.gray, true: colors.primaryColor }} 
              thumbColor={themePalette.name === "dark" ? colors.white : colors.gray3} style={{ transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }} />
          </View>
        </View>

        {ble.hasBLE() && (
          <View
            style={[ styles.flex_toggle_row, { borderRadius: 8, backgroundColor: themePalette.inputBackgroundColor, height: 64, paddingStart: 16,
                marginRight: 5, marginTop: 16, marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center", },]}>
            <View>
              <Text style={inputSwitchLabelStyle}>Simulate Devices:</Text>
              <Text style={inputSubtitleStyle}> {simulatedBLD ? "Disable Simulation" : "Enable Simulation"} </Text>
            </View>

            <View style={{ width: 70, height: 32, justifyContent: "center", alignItems: "center", }} >
              <Switch onValueChange={(e) => simulateChanged(e)} value={simulatedBLD} trackColor={{ false: colors.gray, true: colors.primaryColor }} thumbColor={simulatedBLD ? colors.white : colors.gray3}
                style={{ transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }} />
            </View>
          </View>
        )}

        {!ble.hasBLE() && ( <Text style={inputLabelStyle}>No BLE Device - Simulating</Text>)}
  
      </KeyboardAwareScrollView>
    </Page>
  );
};

export default SettingsPage;