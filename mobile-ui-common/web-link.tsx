import { Text, View, TextInput, Linking } from 'react-native';
import styles from '../styles';
import AppServices from '../services/app-services';

export interface WebLinkProps {
    url: string;
    label: string; 
}

export default function WebLink(props: WebLinkProps) {
    const themePalette = AppServices.instance.getAppTheme();

    return  (
        <Text style={[styles.link, styles.mt_20, { color: themePalette.accentColor }]} onPress={() => Linking.openURL(props.url)}>{props.label}</Text>      
    )

}