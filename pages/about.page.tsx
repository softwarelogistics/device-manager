import React, { useEffect, useState } from 'react';
import { IReactPageServices } from '../services/react-page-services';
import Page from '../mobile-ui-common/page';
import { Text,View, TouchableOpacity, ActivityIndicator, TextStyle, Switch, } from 'react-native';
import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import styles from '../styles';
import AppServices from '../services/app-services';
import { CommonSettings } from '../settings';

export const AboutPage = ({ props, navigation, route }: IReactPageServices) => {
    const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        if (initialCall) {
          appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) })
          appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) })
          setInitialCall(false);
        }
    });

    return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
        <Text>Environment: {CommonSettings.environment}</Text>
    </Page>;
}