import { Text } from 'react-native';
import styles from '../styles';
import AppServices from '../services/app-services';

export default function AppVersionLabel() {
    const themePalette = AppServices.instance.getAppTheme();
    let version = JSON.stringify(require("../package.json").version).replace('"', '').replace('"', '');

    return (
        <Text style={[styles.label, styles.mt_20, { color: themePalette.shellTextColor }]}>Version: {version}</Text>
    )
}