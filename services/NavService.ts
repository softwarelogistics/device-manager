import AsyncStorage from "@react-native-async-storage/async-storage";

export class NavService {
    _navigator: any
    
    setTopLevelNavigator(navigatorRef: any) {
        this._navigator = navigatorRef;
    }

    constructor() {}

    redirectToLogin = async () => {
        await AsyncStorage.setItem("isLoggedIn", "false");

        await AsyncStorage.removeItem("jwt");
        await AsyncStorage.removeItem("refreshtoken");
        await AsyncStorage.removeItem("refreshtokenExpires");
        await AsyncStorage.removeItem("jwtExpires");
        this.replace('authPage');    
    }

    navigate = (route: string, params: any | undefined = undefined) => {
        this._navigator.navigate(route, params);
    }

    replace = (route: string) => {
        this._navigator.replace(route);
    }

    goBack = () => {
        this._navigator.goBack()
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