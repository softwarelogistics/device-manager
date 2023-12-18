import * as React from 'react';
import { IRadialGaugeProps } from './gauge-props';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle, } from 'react-native';
import { degrees_to_radians, generateEllipsePath } from './gauge-utils';
import { Canvas, Path as SkiaPath, SweepGradient, vec, useValue, runSpring, Shadow, AnimatedProps, } from '@shopify/react-native-skia';
import { transformOriginWorklet } from './transform.origin';
import { gaugeStyles } from './gauge-styles';


const ANGLE_OFFSET = 90;

export const RadialGauge: React.FC<IRadialGaugeProps> = ({ canvasStyle, colors, thickness = 50, sweepAngle,
  emptyColor, fillProgress, steps, renderStep, strokeWidth, renderNeedle, renderLabel,
  springConfig, size, strokeColor, showGaugeCenter, }) => {

  const animatedGaugeFillValue = useValue(0);
  const animatedArrowValue = React.useRef(new Animated.Value(0));
  const startAngle = -ANGLE_OFFSET - sweepAngle / 2;

  React.useEffect(() => {
    Animated.timing(animatedArrowValue.current, {
      toValue: parseInt(`${fillProgress}`, 10) / 100,
      duration: 250, easing: Easing.inOut(Easing.ease), useNativeDriver: false,
    }).start();
    runSpring(animatedGaugeFillValue, { to: fillProgress / 100 }, springConfig ? springConfig : ({} as any));
  }, [fillProgress, animatedGaugeFillValue]);

  const cx = size / 2;
  const cy = size / 2;
  const circleSize = size / 2 - (strokeWidth || 2);

  const getNeedleStyle = (width: number, height: number, pivotOriginalPointY = 0, pivotAnchorOffsetY = 0,
    positionYOffset = 0, positionXOffset = 0) => ({
      position: 'absolute', left: cx - width / 2 - positionXOffset, top: cy - height - positionYOffset,
      width, height, backgroundColor: 'transparent', transform: transformOriginWorklet(
        { x: cx, y: cy - pivotAnchorOffsetY }, { x: cx, y: cy - (height - pivotOriginalPointY) / 2 },
        [{ rotateZ: animatedArrowValue.current.interpolate({ inputRange: [0, 1], outputRange: [`-${sweepAngle / 2}deg`, `${sweepAngle / 2}deg`], }), },]
      ),
    });

  return (
    <View style={gaugeStyles.centered}>
      <Canvas key='canvas1' style={[{ width: size, height: size, }, canvasStyle,]}>
        <SkiaPath key='path1' style="stroke" color={strokeColor ? strokeColor : 'cyan'}
          path={generateEllipsePath([cx, cy], [circleSize - thickness / 2, circleSize - thickness / 2], [startAngle, sweepAngle], 0)}
          {...{ strokeWidth: thickness + (strokeWidth || 0) }}
        />
        <SkiaPath key='path2' style="stroke" color={emptyColor} path={generateEllipsePath(
          [cx, cy], [circleSize - thickness / 2, circleSize - thickness / 2],
          [startAngle, sweepAngle], 0)}
          start={0.001} end={1} {...{ strokeWidth: thickness }} >
        </SkiaPath>
        <SkiaPath key='path3' style="stroke" path={generateEllipsePath([cx, cy], [circleSize - thickness / 2, circleSize - thickness / 2],
          [startAngle, sweepAngle], 0)} end={animatedGaugeFillValue} {...{ strokeWidth: thickness }}>
          <SweepGradient start={60} end={300} c={vec((size + 100) / 2, (size + 100) / 2)} transform={[
            { rotate: Math.PI / 2 }, { translateX: 0 }, { translateY: -(size + 50) },]} colors={colors} />
        </SkiaPath>
      </Canvas>
      {steps &&
        renderStep &&
        steps.map((step, index) =>
          renderStep({
            step, index, radius: circleSize / 2,
            getX: (offset: number, radius = circleSize / 2) =>
              cx + offset + radius * Math.sin(degrees_to_radians(startAngle + ANGLE_OFFSET + (sweepAngle * step) / 100)),
            getY: (offset: number, radius = circleSize / 2) =>
              cy - offset + radius * -Math.cos(degrees_to_radians(startAngle + ANGLE_OFFSET + (sweepAngle * step) / 100)),
            angle: startAngle + ANGLE_OFFSET + (sweepAngle * step) / 100,
          })
        )}
      {renderNeedle && renderNeedle({ getNeedleStyle })}
      {renderLabel && (<View key='label' style={[gaugeStyles.container, gaugeStyles.centered]}>{renderLabel()}</View>)}
      {showGaugeCenter && ( <View key='center1' style={[{ top: cy - 25, left: cx }, gaugeStyles.verticalAxis]} /> )}
      {showGaugeCenter && ( <View key='canter2' style={[{ top: cy, left: cx - 25, }, gaugeStyles.horizontalAxis,]} />)}
    </View>
  );
};

