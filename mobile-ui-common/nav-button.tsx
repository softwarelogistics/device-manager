import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity } from 'react-native';
import AppServices from "../services/app-services";
import styles from "../styles"
import ViewStylesHelper from "../utils/viewStylesHelper";

export default function NavButton(props: any) {
  const themePalette = AppServices.instance.getAppTheme();

  return (
    <TouchableOpacity style={ViewStylesHelper.combineViewStyles([ styles.buttonExternalLogin, { backgroundColor: themePalette.buttonTertiary, borderColor: themePalette.buttonTertiaryBorderColor }])}
      onPress={() => props.onPress(props.label)}>
      <Image source={props.imageUrl} style={styles.buttonExternalLoginLogo} />
      <Text style={{marginLeft:10, marginTop:8, fontSize:24, color: themePalette.buttonTertiaryText }} > 
        {props.label}
      </Text>
    </TouchableOpacity>
  );
}