import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContext } from "@react-navigation/native";
import React from "react";

export class NavService {

    constructor() {
        console.log('NavService constructor');
    }

    redirectToLogin = async () => {

    }

    navigate = (route: string) => {
        const navigation = React.useContext(NavigationContext);
        navigation!.navigate(route);
    }

    replace = (route: string) => {
        const navigation = React.useContext(NavigationContext);
        navigation!.replace(route);
    }

    goBack = () => {
        const navigation = React.useContext(NavigationContext);
        navigation!.goBack()
    }

    logout = async () => {
        await AsyncStorage.setItem("isLoggedIn", "false");

        await AsyncStorage.removeItem("jwt");
        await AsyncStorage.removeItem("refreshtoken");
        await AsyncStorage.removeItem("refreshtokenExpires");
        await AsyncStorage.removeItem("jwtExpires");
        this.replace('authPage');    
    }
}