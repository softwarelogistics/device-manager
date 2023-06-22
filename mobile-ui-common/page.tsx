import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import AppServices from "../services/app-services";
import styles from "../styles";
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import ProgressSpinner from "../mobile-ui-common/progress-spinner";
import ThemeSwitcher from "./theme-switcher";
import { useNavigation } from "@react-navigation/native";
import { HttpClient } from "../core/utils";
import { NetworkCallStatusService } from "../services/network-call-status-service";
import { IReactPageServices } from "../services/react-page-services";

export default function Page(props: any) {
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
    const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
    const [logoutSubscription, setLogoutSubscription] = useState<Subscription | undefined>(undefined);
    const [busySubscription, setBusySubscription] = useState<Subscription | undefined>(undefined);
    const [isBusy, setIsBusy] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
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
        console.log('we should nav.');
        navigation.replace('authPage')
    };

    return (
        <View style={[styles.container,  {width:'100%', backgroundColor: themePalette.background }]}>
            {
                isAuthenticated && !isBusy &&
                <View style={[styles.container,  {width:'100%',  backgroundColor: themePalette.background }]}>
                    {props.children}
                </View>
            }
            {
                !isAuthenticated && !isBusy &&
                <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
                    <Button onPress={login} title="Login"></Button>
                    <Text style={[styles.spinnerText, { color: themePalette.shellTextColor }]}>Sorry, you have been logged out</Text>                    
                    <Text style={[styles.spinnerText, { color: themePalette.shellTextColor, backgroundColor: 'green' }]}>Sorry, you have been logged out</Text>                    
                </View>
            }
            {
                isBusy &&
                <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
                    <Text style={[styles.spinnerText, { color: themePalette.shellTextColor }]}>Please Wait</Text>
                    <ProgressSpinner isBusy={isBusy} />
                </View>
            }            
        </View>
    )
}