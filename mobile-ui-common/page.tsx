import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import AppServices from "../services/app-services";
import styles from "../styles";
import { ThemePalette } from "../styles.palette.theme";
import ProgressSpinner from "../mobile-ui-common/progress-spinner";
import { useNavigation } from "@react-navigation/native";
import { HttpClient } from "../core/utils";
import { NetworkCallStatusService } from "../services/network-call-status-service";
import StdButton from "./std-button";

export default function Page(props: any) {
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
    const [isBusy, setIsBusy] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        
    (async () => {
      //  let palette = await appServices.userServices.getThemePalette();
      //  setThemePalette(palette);
      })();
        
        let themeChangedSubscription = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
        let logoutSubscription = HttpClient.logoutSubscription.addListener('logout', () => { setIsAuthenticated(false) });
        let busySubscription = NetworkCallStatusService.busySubscription.addListener('busy', () => setIsBusy(true));
        let idleSubscription = NetworkCallStatusService.busySubscription.addListener('idle', () => setIsBusy(false));

        return (() => {
            AppServices.themeChangeSubscription.remove(themeChangedSubscription);
            HttpClient.logoutSubscription.remove(logoutSubscription);
            NetworkCallStatusService.busySubscription.remove(busySubscription);
            NetworkCallStatusService.busySubscription.remove(idleSubscription);
        })
    }, []);

    const login = () => {
        console.log('[Page__login] - Navigate to Login Page.');
        navigation.replace('authPage')
    };

    return (
        <View style={[styles.container, { width: '100%', backgroundColor: themePalette.background }]}>
            {
                isAuthenticated && !isBusy &&
                <View style={[styles.container, { width: '100%', backgroundColor: themePalette.background }]}>
                    {props.children}
                </View>
            }
            {!isAuthenticated && !isBusy &&
                <View style={styles.formGroup}>
                    <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />                    
                    <Text style={[styles.spinnerText, { color: themePalette.shellTextColor }]}>Sorry, you have been logged out due to inactivity.</Text>
                    <StdButton onPress={login} label="Login"></StdButton>
                </View>
            }
            {isBusy &&
                <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
                    <Text style={[styles.spinnerText, { color: themePalette.shellTextColor }]}>Please Wait</Text>
                    <ProgressSpinner isBusy={isBusy} />
                </View>
            }
        </View>
    )
}