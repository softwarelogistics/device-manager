import { SpringConfig } from '@shopify/react-native-skia/lib/typescript/src/animation/types';
import { Animated, Text, Easing, StyleProp, StyleSheet, View, ViewStyle,} from 'react-native';

export type GetAxisValue = (offset: number, radius?: number) => number;

export type GetNeedleStyle = (width: number, height: number, pivotOriginalPointY?: number, pivotAnchorOffsetY?: number,
  positionYOffset?: number, positionXOffset?: number) => {
    position: string; left: number; top: number; width: number; height: number; backgroundColor: string; transform: any[];
  };


export interface ILevelGaugeProps {
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
     * Method to render the label center of the gauge
     */
    renderLabel: () => React.ReactNode;
    width: number;
    height: number;
    /**
     * Percentage full of the level
     *
     * @type {number}
     * @memberof ILevelGaugeProps
     */
    level: number;
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

  export interface IRadialGaugeProps {
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
  