import { Image} from 'react-native';
import styles from '../styles';

export function AppLogo() {
    return (
        <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />
    )
}