import { useEffect, useState } from "react";
import { Text, View, TextInput, } from 'react-native';
import AppServices from "../services/app-services";
import styles from "../styles"
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import ViewStylesHelper from "../utils/viewStylesHelper"


export interface EditFieldProps {
    label: string,
    value?: string,
    placeHolder: string,
    secureTextEntry?: boolean,
    editable?: boolean,
    onChangeText?: ((text: string) => void) | undefined;
}

export default function EditField(props:EditFieldProps) {
 const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
 const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);

 useEffect(() => {
    let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()) );
    setSubscription(changed);
    return (() => {if (subscription)AppServices.themeChangeSubscription.remove(subscription);})
  }, []);

  

 return (
    <View>
        <Text style={[styles.label, { color: themePalette.shellTextColor, fontWeight: (themePalette.name === 'dark' ? '700' : '400')  }]} >{props.label}</Text>
        <TextInput autoCapitalize="none" style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.inputBackgroundColor, height:50,  marginRight:5, paddingLeft:5  }} 
                placeholderTextColor={themePalette.shellNavColor}  
                editable={props.editable !== false} placeholder={props.placeHolder} secureTextEntry={props.secureTextEntry} onChangeText={props.onChangeText} value={props.value} />
    </View>
 )};
