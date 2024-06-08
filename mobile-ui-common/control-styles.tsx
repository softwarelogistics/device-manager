import { ImageStyle } from "react-native";
import AppServices from "../services/app-services";
import styles from "../styles";
import ViewStylesHelper from "../utils/viewStylesHelper";

const themePalette = AppServices.instance.getAppTheme();

export const primaryButton = ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonSecondary]);
export const secondaryButton = ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonPrimary]);

export const logoAuthImageStyle: ImageStyle = ViewStylesHelper.combineImageStyles([styles.logoImage, styles.mt_10]);
export const submitButtonEmailStyle = ViewStylesHelper.combineViewStyles([styles.submitButton, styles.buttonSecondary, styles.mb_00]);
export const submitButtonEmailTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack]);
export const submitButtonExternalLoginTextStyle = ViewStylesHelper.combineTextStyles([submitButtonEmailTextStyle, { color: themePalette.buttonTertiaryText }]);
export const providersFlexView = ViewStylesHelper.combineViewStyles([styles.pt_10, styles.flexView_wrap_row]);
export const callToActionView = ViewStylesHelper.combineTextStyles([styles.pt_10, styles.mt_20]);