import { Image, Text, ActivityIndicator, View, TextInput, TouchableOpacity, ImageStyle, Button } from 'react-native';
import AppServices from "../services/app-services";
import styles from "../styles"
import { primaryButton, secondaryButton } from "./control-styles";

export default function StdButton(props: any) {
  const themePalette = AppServices.instance.getAppTheme();

  return (
    <TouchableOpacity style={secondaryButton} onPress={() => props.onPress()}>
      <Text style={styles.submitButtonText}> {props.label} </Text>
    </TouchableOpacity>
  );
}