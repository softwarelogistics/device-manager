import { useEffect, useState } from "react";
import { View } from "react-native";
import AppServices from "../services/app-services";
import styles from "../styles";
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import ThemeSwitcher from "./theme-switcher";

export default function Page(props:any) {
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
    const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

    useEffect(() => {
      let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
      setSubscription(changed);
      return (() => { if (subscription) AppServices.themeChangeSubscription.remove(subscription);})
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: themePalette.background }]}>
            {props.children}
            <ThemeSwitcher></ThemeSwitcher>
        </View>
    )
}