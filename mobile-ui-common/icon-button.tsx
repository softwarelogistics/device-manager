import { useEffect } from "react";
import { Text, TouchableOpacity, View } from 'react-native';
import AppServices from "../services/app-services";
import styles from "../styles"
import ViewStylesHelper from "../utils/viewStylesHelper";
import Icon from "react-native-vector-icons/Ionicons";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../styles.colors";
import fontSizes from "../styles.fontSizes";

export interface IconButtonProperties {
  label: string;
  icon: string;
  iconType: string;  
  color?: string;
  onPress: (() => void);
  center?: boolean
}

export default function IconButton(props: IconButtonProperties) {
  const themePalette = AppServices.instance.getAppTheme();

  const profilePagePrimaryButtonStyle = ViewStylesHelper.combineTextStyles([styles.submitButton, { backgroundColor: themePalette.buttonPrimary }]);
  const submitButtonWhiteTextStyle = ViewStylesHelper.combineTextStyles([styles.submitButtonText, styles.submitButtonTextBlack, { color: themePalette.buttonPrimaryText }]);

  if(!props.color)
    props.color = themePalette.buttonPrimaryText;

  useEffect(() => {
    
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