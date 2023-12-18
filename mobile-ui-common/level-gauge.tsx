import { useEffect, useRef, useState } from "react";
import { Animated, View, Text,  Easing } from 'react-native';
import { Canvas,  useValue, runSpring, Rect, Shadow, useCanvasRef, Line, } from '@shopify/react-native-skia';
import { ILevelGaugeProps } from './gauge-props';
import { ThemePalette } from "../styles.palette.theme";
import AppServices from "../services/app-services";

import styles from "../styles"
import { gaugeStyles } from './gauge-styles';

export const LevelGauge: React.FC<ILevelGaugeProps> = ({
  canvasStyle,
  colors,
  thickness = 50,
  sweepAngle,
  emptyColor,
  fillProgress,
  steps,
  renderStep,
  strokeWidth,
  renderLabel,
  springConfig,
  width,
  height,
  level,
  strokeColor,
  showGaugeCenter,
}) => {


  const ANGLE_OFFSET = 90;

  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);

  const ref = useCanvasRef();

  const animatedGaugeFillValue = useValue(0);

  const animatedArrowValue = useRef(new Animated.Value(0));
  ;

  useEffect(() => {

    console.log('LevelGauge useEffect');
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
      <Canvas style={{ flex: 1 }}  >
        <Rect x={0} y={0} width={width} height={height} color="lightblue" />
        <Rect x={0} y={height-((level / 100.0) * height)} width={width} height={level / 100.0 * height} color="green" />
        { steps && steps.map((step, index) =>  {
            return  <Line p1={{ x: 0, y: index * (height / steps.length) }} p2={{ x: width, y: index * (height / steps.length) }} key={index} strokeWidth={1} color="black" />
            }
        )          
        }
      </Canvas>
  )
}


