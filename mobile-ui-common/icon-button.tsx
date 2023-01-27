import { useEffect, useState } from "react";
import { Image, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import AppServices from "../services/app-services";
import styles from "../styles"
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import ViewStylesHelper from "../utils/viewStylesHelper";
import Icon from "react-native-vector-icons/Ionicons";
import FaIcon from "react-native-vector-icons/FontAwesome5";
import OctIcon from "react-native-vector-icons/Octicons";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../styles.colors";
import fontSizes from "../styles.fontSizes";

export interface IconButtonProperties {
  label: string;
  icon: string;
  iconType: string;  
  color: string;
  onPress: (() => void);
  center?: boolean
}

export default function IconButton(props: IconButtonProperties) {
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

  const profilePagePrimaryButtonStyle = ViewStylesHelper.combineTextStyles([styles.submitButton, { backgroundColor: themePalette.buttonPrimary }]);
  const submitButtonWhiteTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonPrimaryText }]);

  useEffect(() => {
    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
    setSubscription(changed);
    return (() => {
      if (subscription)
        AppServices.themeChangeSubscription.remove(subscription);
    })
  }, []);

  const renderIonIcon = () => {
    return <Icon.Button
          name={props.icon}
          style={profilePagePrimaryButtonStyle}
          color={themePalette.buttonPrimaryText}
          backgroundColor={colors.transparent}
          onPress={() => props.onPress()}>
          <Text style={submitButtonWhiteTextStyle}> {props.label} </Text>
    </Icon.Button>}

  const renderMciIcon = ()  => {
    return <TouchableOpacity style={styles.submitButton} onPress={() => props.onPress()}>
    <MciIcon name={props.icon} style={[{ marginTop:3, color: themePalette.buttonPrimaryText, textAlign: "center", fontSize: fontSizes.iconButtonLarge }]}>
      <Text style={[{ color: themePalette.buttonPrimaryText, textAlign: "center", fontSize: fontSizes.large }, styles.alignVerticalMiddle]}> { props.label }</Text>
    </MciIcon>
    </TouchableOpacity>}

  return (
  <View>
    {props.iconType == 'ion' && renderIonIcon()}
    {props.iconType == 'mci' && renderMciIcon()}              
  </View>
  )

}