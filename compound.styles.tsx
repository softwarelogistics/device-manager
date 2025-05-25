import { TextStyle, ViewStyle } from "react-native";
import ViewStylesHelper from "./utils/viewStylesHelper";
import AppServices from "./services/app-services";
import fontSizes from "./styles.fontSizes";
import palettes from "./styles.palettes";
import styles from "./styles";
import colors from "./styles.colors";

export const themePalette = AppServices.instance.getAppTheme();

export const chevronBarVerticalStyle: ViewStyle = ViewStylesHelper.combineViewStyles([{ height: 39 }]);

export const barGreyChevronRightLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([{ fontWeight: '700' }]);
export const barGreyChevronRightStyle: TextStyle = ViewStylesHelper.combineTextStyles([chevronBarVerticalStyle, { backgroundColor: palettes.gray.v20, fontSize: 18, paddingLeft: 4, paddingRight: 4, width: '98%', textAlignVertical: 'center' }]);
export const headerStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellTextColor, fontSize: 24, fontWeight: '700', textAlign: 'left' }]);

export const h1Style: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellTextColor, fontSize: 32, fontWeight: '700', textAlign: 'left' }]);
export const h2Style: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellTextColor, fontSize: 24, fontWeight: '700', textAlign: 'left' }]);
export const h1CenteredStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellTextColor, fontSize: 32, fontWeight: '700', textAlign: 'center' }]);
export const h2CenteredStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.header, { color: themePalette.shellTextColor, fontSize: 24, fontWeight: '700', textAlign: 'center' }]);


export const chevronBarColorTick: ViewStyle = ViewStylesHelper.combineViewStyles([chevronBarVerticalStyle, { width: 8 }]);

export const contentStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.mediumSmall, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);

export const inputLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, { color: themePalette.shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400') }]);
export const inputSubtitleStyle: TextStyle = ViewStylesHelper.combineTextStyles([ styles.subtitleText, { color: themePalette.subtitleColor }, ]);
export const inputSwitchLabelStyle: TextStyle = ViewStylesHelper.combineTextStyles([ styles.labelTitle, { color: themePalette.shellTextColor }, ]);

export const inputStyleOverride = { backgroundColor: themePalette.inputBackgroundColor, borderColor: palettes.gray.v80, color: themePalette.shellTextColor, marginBottom: 20, paddingLeft: 4 };

export const inputStyleWithBottomMargin: TextStyle = ViewStylesHelper.combineTextStyles([styles.inputStyle, inputStyleOverride]);
export const placeholderTextColor: string = themePalette.name === 'dark' ? themePalette.shellNavColor : palettes.gray.v50;

export const labelStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.medium, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);

export const primaryButtonStyle: ViewStyle = ViewStylesHelper.combineViewStyles([styles.submitButton, { backgroundColor: themePalette.buttonPrimary }]);
export const primaryButtonTextStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, { color: themePalette.buttonPrimaryText }]);


export const currentOrganizationHeaderNameStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.alignCenter, { color: colors.white, marginTop: 0, paddingTop: 0, fontSize: 18, fontWeight: '700', top: 30 }]);
export const selectOrganizationCircleStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.iconButtonCircle, { color: colors.transparent, fontSize: 48, marginTop: 0, paddingTop: 0 }]);
export const selectOrganizationTextStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.alignVerticalMiddle, { color: themePalette.shellTextColor, marginLeft: -14, marginTop: 14, paddingTop: 0, fontSize: 18, fontWeight: '700' }]);