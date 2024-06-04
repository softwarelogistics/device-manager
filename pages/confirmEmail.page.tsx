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
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
    const submitButtonWhiteTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonPrimaryText }]);

    useEffect(() => {
 
        appServices.userServices.getUser();
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
            <View>
                <Text>Please confirm your email address.</Text>
                <MciIcon.Button
                    name="logout"
                    style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin, { backgroundColor: colors.errorColor, borderColor: '#AA0000' }])}
                    color={colors.white}
                    backgroundColor={colors.transparent}
                    onPress={() => logOut()}>
                    <Text style={submitButtonWhiteTextStyle}> Logout </Text>
                </MciIcon.Button>
                <MciIcon.Button
                    name="logout"
                    style={ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonExternalLogin, { backgroundColor: colors.errorColor, borderColor: '#AA0000' }])}
                    color={colors.white}
                    backgroundColor={colors.transparent}
                    onPress={() => resendConfirmationEmail()}>
                    <Text style={submitButtonWhiteTextStyle}> Resend Confirmation Email </Text>
                </MciIcon.Button>
        
            </View>
        </Page>
    )
}