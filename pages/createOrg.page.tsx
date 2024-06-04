import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import ViewStylesHelper from "../utils/viewStylesHelper";

import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";
import { View, Text, TextStyle } from "react-native";
import { ThemePalette } from "../styles.palette.theme";
import colors from "../styles.colors";
import styles from '../styles';
import palettes from "../styles.palettes";
import EditField from "../mobile-ui-common/edit-field";
import NavButton from "../mobile-ui-common/nav-button";
import IconButton from "../mobile-ui-common/icon-button";


export default function CreateOrgPage({ navigation }: IReactPageServices) {
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const [appUser, setAppUser] = useState<Users.AppUser>();
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
    const submitButtonWhiteTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonPrimaryText }]);
   
    const [selections, setSelections] = useState<Orgs.CreateOrgViewModel>({
        name: '',
        webSite: '',
        namespace: '',
        createGettingStartedData: false
    });

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

    const createOrganization = async () => {
        console.log('createOrganization: selections', selections);
    };

    const setSelectionProperty = (name: string, value: string | undefined) => {
        setSelections((current: Orgs.CreateOrgViewModel) => ({ ...current, [name]: value }));
    };

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

    return (
        <Page>
            <View>
                <EditField onChangeText={e => { handleUserPropertyChange(e, 'name'); }} label="organization name" placeHolder='enter organization name' value={selections.name} />
                <EditField onChangeText={e => { handleUserPropertyChange(e, 'namespace'); }} label="namespace" placeHolder='enter organization namespace' value={selections.namespace} />
                <EditField onChangeText={e => { handleUserPropertyChange(e, 'webSite'); }} label="First Name" placeHolder='enter organization web site' value={selections.webSite} />

                <IconButton iconType="mci" label="Create Organization" icon="content-save" onPress={() => createOrganization()} color={colors.primaryColor}></IconButton>
                <IconButton iconType="mci" label="Logout" icon="logout" onPress={() => logOut()} color={colors.errorColor}></IconButton>
            </View>
        </Page>
    )
}