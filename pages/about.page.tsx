import React, { useEffect, useState } from 'react';
import { IReactPageServices } from '../services/react-page-services';
import Page from '../mobile-ui-common/page';
import { Text,View, TouchableOpacity, ActivityIndicator, TextStyle, Switch, } from 'react-native';
import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";
import styles from '../styles';
import { CommonSettings } from '../settings';

export const AboutPage = ({ props, navigation, route }: IReactPageServices) => {
    const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
    const [initialCall, setInitialCall] = useState<boolean>(true);

    useEffect(() => {
        if (initialCall) {
          setInitialCall(false);
        }
    });

    return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
        <Text>Environment: {CommonSettings.environment}</Text>
    </Page>;
}