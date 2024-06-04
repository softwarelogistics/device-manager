import React, { useState, useEffect } from "react";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";
import { View, Text } from "react-native";

import colors from "../styles.colors";
import styles from '../styles';
import ViewStylesHelper from "../utils/viewStylesHelper";
import { ThemePalette } from "../styles.palette.theme";


export default function ConfirmEmailPage({ navigation }: IReactPageServices) {
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const [appUser, setAppUser] = useState<Users.AppUser>();
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
    const submitButtonWhiteTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonPrimaryText }]);

    let loadUser = async () => {
        let user = await appServices.userServices.getUser();
        setAppUser(user);
    }

    let checkEmailConfirmed = async () => {
        let currentUser = await appServices.userServices.loadCurrentUser();
        if (currentUser?.emailConfirmed) {
            console.log('confirmed email');
            if (!currentUser?.currentOrganization)
                navigation.replace('createorg');
            else if (currentUser?.showWelcome)
                navigation.replace('homeWelcome');
            else
                navigation.replace('home');
        }
        else {
            console.log('not confirmed');
        }
    }

    useEffect(() => {
        loadUser();
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

    const resendConfirmationEmail = async () => {
        await appServices.userServices.sendEmailConfirmCode();
    };

    return (
        <Page>
            <View >
                <Text style={[{ margin: 30 }]} >An email was sent to {appUser?.email.toLowerCase()}. Please check your email for a confirmation link to activate your account.  If it doesn't arrive within a few minutes, please check your spam folder.  To resend the message click on Re-Send below.</Text>
                <MciIcon.Button
                    name="refresh"
                    style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin,
                    { backgroundColor: colors.accentColor, borderColor: '#0000AA' }])}
                    color={colors.white}
                    backgroundColor={colors.transparent}
                    onPress={() => checkEmailConfirmed()}>
                    <Text style={submitButtonWhiteTextStyle}> Recheck </Text>
                </MciIcon.Button>

                <MciIcon.Button
                    name="email"
                    style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin,
                    { backgroundColor: colors.primaryColor, borderColor: '#0000AA' }])}
                    color={colors.white}
                    backgroundColor={colors.transparent}
                    onPress={() => resendConfirmationEmail()}>
                    <Text style={submitButtonWhiteTextStyle}> Resend Confirmation Email </Text>
                </MciIcon.Button>

                <MciIcon.Button
                    name="logout"
                    style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin,
                    { backgroundColor: colors.errorColor, borderColor: '#AA0000' }])}
                    color={colors.white}
                    backgroundColor={colors.transparent}
                    onPress={() => logOut()}>
                    <Text style={submitButtonWhiteTextStyle}> Logout </Text>
                </MciIcon.Button>
            </View>
        </Page>
    )
}