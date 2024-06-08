import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";
import { View, Text } from "react-native";

import colors from "../styles.colors";
import IconButton from "../mobile-ui-common/icon-button";
import { useFocusEffect } from "@react-navigation/native";


export default function ConfirmEmailPage({ navigation }: IReactPageServices) {
    const themePalette = AppServices.instance.getAppTheme();

    const [appUser, setAppUser] = useState<Users.AppUser>();

    let loadUser = async () => {
        let user = await AppServices.instance.userServices.getUser();
        setAppUser(user);
    }

    let checkEmailConfirmed = async () => {
        let currentUser = await AppServices.instance.userServices.loadCurrentUser();
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

    useFocusEffect(() => {
        loadUser();
    })

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
        await AppServices.instance.userServices.sendEmailConfirmCode();
    };

    return (
        <Page>
            <View >
                <Text style={[{ margin: 30 }]} >An email was sent to {appUser?.email.toLowerCase()}. Please check your email for a confirmation link to activate your account.  If it doesn't arrive within a few minutes, please check your spam folder.  To resend the message click on Re-Send below.</Text>
                <IconButton iconType="mci" label="Recheck" icon="refresh" onPress={() => checkEmailConfirmed()} color={colors.primaryColor}></IconButton>
                <IconButton iconType="mci" label="Resend Confirmation Email" icon="email" onPress={() => resendConfirmationEmail()} color={colors.primaryColor}></IconButton>
                <IconButton iconType="mci" label="Logout" icon="logout" onPress={() => logOut()} color={colors.primaryColor}></IconButton>
            </View>
        </Page>
    )
}