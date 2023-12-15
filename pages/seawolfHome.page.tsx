import { useState } from "react";
import { View, Text, Image, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import IconButton from "../mobile-ui-common/icon-button";
import AppServices from "../services/app-services";
import styles from '../styles';
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import Page from "../mobile-ui-common/page";
import { Gauge, IProps as GaugeProps } from "../mobile-ui-common/gauge";
import { LevelGauge } from "../mobile-ui-common/level-gauge";
// @ts-ignore
import NeedleImage from '../assets/needle.png';
// @ts-ignore
import SimpleNeedleImage from '../assets/simple-needle.png';

const AnimatedImage = Animated.createAnimatedComponent(Image);

export const SeaWolfHomePage = ({ navigation, props, route }: IReactPageServices) => {
    const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
    const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
    const [label, setLabel] = useState<string | undefined>("RPM");
    const [stepMarker, setStepMarker] = useState(18);
    const [marker, setMarker] = useState(80);

    const showStep = true;
    const Label = () => (
        <View>
            <Text style={{ color: themePalette.accentColor, fontSize: 20 }}>{label}</Text>
        </View>
    );


    const Step: GaugeProps['renderStep'] = ({
        step,
        angle,
        getX,
        getY,
        radius,
    }) => (
        <>
            <View
                style={[
                    {
                        width: step % 25 === 0 ? 4 : 1,
                        marginLeft: -2,
                        height: 20,
                        borderRadius: 2,
                        position: 'absolute',
                        left: getX(0, radius + stepMarker),
                        top: getY(10, radius + stepMarker),
                        backgroundColor: 'lightgray',
                        transform: [{ rotateZ: `${angle}deg` }],
                    },
                ]}
            />
            <Text
                style={[
                    {
                        position: 'absolute',
                        fontSize: 32,
                        left: getX(-10, radius + marker),
                        top: getY(10, radius + marker),
                        color: 'rgba(0,0,0,0.6)',
                        transform: [{ rotateZ: `${angle}deg` }],
                    },
                ]}
            >
                {step % 10 === 0 ? `${step}` : ''}
            </Text>
        </>
    );

    const Needle: GaugeProps['renderNeedle'] = ({ getNeedleStyle }) => (
        <>
            <AnimatedImage
                style={[getNeedleStyle(300 / 3, 300 / 3)]}
                source={SimpleNeedleImage}
            />
        </>
    );

    const SimpleNeedle: GaugeProps['renderNeedle'] = ({ getNeedleStyle }) => (
        <>
            <Animated.View style={[getNeedleStyle(80, 80, 14.5, 0, -7.6)]}>
                <AnimatedImage
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                    source={SimpleNeedleImage}
                />
            </Animated.View>
        </>
    );

    return (<Page>
        <View>
            <LevelGauge
                key='one'
                emptyColor="#C1C1C1"
                colors={['green', 'yellow', 'red']}
                sweepAngle={270}
                strokeWidth={5}
                fillProgress={33}
                renderNeedle={Needle}
                steps={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                renderStep={showStep ? Step : undefined}
                renderLabel={Label}
                size={400}
                thickness={60}>

            </LevelGauge>

            <Gauge
                key='two'
                emptyColor="#C1C1C1"
                colors={['green', 'yellow', 'red']}
                sweepAngle={270}
                strokeWidth={5}
                fillProgress={80}
                renderNeedle={Needle}
                steps={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                renderStep={showStep ? Step : undefined}
                renderLabel={Label}
                size={400}
                thickness={60}
            ></Gauge>
        </View>
    </Page>

    )
}