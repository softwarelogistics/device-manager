import { ActivityIndicator } from "react-native";
import colors from "../styles.colors";

export default function ProgressSpinner(props:any) {


    return (
    <ActivityIndicator color={colors.primaryColor} size="large" animating={props.isBusy} />
    )
}