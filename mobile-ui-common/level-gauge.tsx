import * as React from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { degrees_to_radians, generateEllipsePath } from './gauge-utils';
import {
  Canvas,
  Path as SkiaPath,
  SweepGradient,
  vec,
  useValue,
  runSpring,
  Shadow,
  AnimatedProps,
} from '@shopify/react-native-skia';
import { transformOriginWorklet } from './transform.origin';
import { SpringConfig } from '@shopify/react-native-skia/lib/typescript/src/animation/types';

type GetAxisValue = (offset: number, radius?: number) => number;

type GetNeedleStyle = (
    width: number,
    height: number,
    pivotOriginalPointY?: number,
    pivotAnchorOffsetY?: number,
    positionYOffset?: number,
    positionXOffset?: number
  ) => {
    position: string;
    left: number;
    top: number;
    width: number;
    height: number;
    backgroundColor: string;
    transform: any[];
  };
  
export interface IProps {
    /**
     * The external stroke width of the gauge
     */
    strokeColor?: string;
  
    /**
     * The external stroke width of the gauge
     */
    strokeWidth?: number;
    /**
     * Gauge thickness
     */
    thickness?: number;
    /**
     * Colors filling the gauge progress
     */
    colors: string[];
    /**
     * Steps as string array to display steps on the gauge
     */
    steps?: number[];
    /**
     * Color to display the empty part of the gauge
     */
    emptyColor: string;
    /**
     * Render step function
     */
    renderStep?: (props: {
      // Returns the x position of the step, by default offset can be 0
      getX: GetAxisValue;
      // Returns the y position of the step, by default offset can be 0
      getY: GetAxisValue;
      // Returns the step value
      step: number;
      // Return the step index
      index: number;
      // Return gauge radius, can be useful to do some calculations
      radius: number;
      // Return the angle of the step in degrees
      angle: number;
    }) => JSX.Element;
    /**
     * The progress value of the gauge.
     */
    fillProgress: number;
    /**
     * Gauge's sweep angle, default is 250 ( how wide is the gauge )
     */
    sweepAngle: number;
    /**
     * Render prop for needle component, default is null
     */
    renderNeedle?: (params: {
      getNeedleStyle: GetNeedleStyle;
    }) => React.ReactNode;
    /**
     * Method to render the label center of the gauge
     */
    renderLabel: () => React.ReactNode;
    /**
     * Size given to the component
     */
    size: number;
    /**
     * Spring config for fill progress animation
     */
    springConfig?: SpringConfig;
    
    /**
     * Custom Canvas style
     */
    canvasStyle?: StyleProp<ViewStyle>;
    /**
     * Needle base offset
     */
    showGaugeCenter?: boolean;
  }

export const LevelGauge: React.FC<IProps> = ({
    canvasStyle,
    colors,
    thickness = 50,
    sweepAngle,
    emptyColor,
    fillProgress,
    steps,
    renderStep,
    strokeWidth,
    renderNeedle,
    renderLabel,
    springConfig,
    size,
    strokeColor,
    showGaugeCenter,
  }) => {

    
const ANGLE_OFFSET = 90;


const animatedGaugeFillValue = useValue(0);

const animatedArrowValue = React.useRef(new Animated.Value(0));
  // Circle center x
  const cx = size / 2;

  // Circle center y
  const cy = size / 2;

  // Circle size without stroke
  const circleSize = size / 2 - (strokeWidth || 2);

  const startAngle = -ANGLE_OFFSET - sweepAngle / 2;

  React.useEffect(() => {
    Animated.timing(animatedArrowValue.current, {
      toValue: parseInt(`${fillProgress}`, 10) / 100,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    runSpring(
        animatedGaugeFillValue,
        { to: fillProgress / 100 },
        springConfig ? springConfig : ({} as any)
      );
  }, [fillProgress, animatedGaugeFillValue]);


    return (
        <View style={styles.centered}>
           <Canvas 
            </View>
    )
     
  }

  
const styles = StyleSheet.create({
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    horizontalAxis: {
      height: 1,
      width: 50,
      position: 'absolute',
      backgroundColor: 'red',
    },
    verticalAxis: {
      height: 50,
      width: 1,
      position: 'absolute',
      backgroundColor: 'red',
    },
    container: { position: 'absolute', zIndex: 99 },
  });