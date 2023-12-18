import { Animated, Text, Easing, StyleProp, StyleSheet, View, ViewStyle,} from 'react-native';

import styles from "../styles"
import { ThemePalette } from "../styles.palette.theme";

export const gaugeStyles = StyleSheet.create({
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

