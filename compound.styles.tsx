import { TextStyle, ViewStyle } from "react-native";
import ViewStylesHelper from "./utils/viewStylesHelper";
import AppServices from "./services/app-services";
import fontSizes from "./styles.fontSizes";
import palettes from "./styles.palettes";
import styles from "./styles";

export const themePalette = AppServices.instance.getAppTheme();

export const headerStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellTextColor, fontSize: 24, fontWeight: '700', textAlign: 'left' }]);
export const chevronBarVerticalStyle: ViewStyle = ViewStylesHelper.combineViewStyles([{ height: 39 }]);
export const chevronBarColorTick: ViewStyle = ViewStylesHelper.combineViewStyles([chevronBarVerticalStyle, { width: 8 }]);
export const barGreyChevronRightStyle: TextStyle = ViewStylesHelper.combineTextStyles([chevronBarVerticalStyle, { backgroundColor: palettes.gray.v20, fontSize: 18, paddingLeft: 4, paddingRight: 4, width: '98%', textAlignVertical: 'center' }]);
export const barGreyChevronRightLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ fontWeight: '700' }]);
export const labelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);
export const contentStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.mediumSmall, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);
export const inputSwitchLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([ styles.labelTitle, { color: themePalette.shellTextColor }, ]);
export const inputSubtitleStyle: TextStyle = ViewStylesHelper.combineTextStyles([ styles.subtitleText, { color: themePalette.subtitleColor }, ]);