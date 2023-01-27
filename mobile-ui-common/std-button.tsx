import { useEffect, useState } from "react";
import { Image, Text, ActivityIndicator, View, TextInput, TouchableOpacity, ImageStyle, Button } from 'react-native';
import AppServices from "../services/app-services";
import styles from "../styles"
import { ThemePalette } from "../styles.palette.theme";
import ViewStylesHelper from "../utils/viewStylesHelper"
import { primaryButton } from "./control-styles";


export default function StdButton(props:any) {
 const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
 const [initialCall, setInitialCall] = useState<boolean>(true);

 return (
     <TouchableOpacity style={primaryButton} onPress={() => props.onPress()}>
        <Text style={styles.submitButtonText}> {props.label} </Text>
    </TouchableOpacity>        
  );
}