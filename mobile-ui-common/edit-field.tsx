import { Text, View, TextInput, } from 'react-native';
import AppServices from "../services/app-services";
import styles from "../styles"
import colors from "../styles.colors";
import palettes from "../styles.palettes";

export interface EditFieldProps {
    label: string,
    value?: string,
    placeHolder: string,
    secureTextEntry?: boolean,
    editable?: boolean,
    onChangeText?: ((text: string) => void) | undefined;
}

export default function EditField(props:EditFieldProps) {
 const themePalette = AppServices.instance.getAppTheme();
 return (
    <View>
        <Text style={[styles.label, { marginBottom: 8, color: themePalette.name === 'dark' ? themePalette.shellTextColor : palettes.gray.v95 , fontWeight: (themePalette.name === 'dark' ? '700' : '400')  }]} >{props.label}</Text>
        <TextInput autoCapitalize="none" style={{ color: themePalette.shellTextColor, fontSize:16, backgroundColor: themePalette.inputBackgroundColor, height:55, paddingStart:16, marginRight:5, marginBottom:16,  borderRadius: 8, borderStyle: 'solid',  borderWidth: 1,borderColor: colors.borderLightColor    }} 
                placeholderTextColor={themePalette.placeHolderText}  
                editable={props.editable !== false} placeholder={props.placeHolder} secureTextEntry={props.secureTextEntry} onChangeText={props.onChangeText} value={props.value} />
    </View>
 )};
