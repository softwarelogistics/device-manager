import { View, Text } from "react-native"
import Icon from "react-native-vector-icons/Ionicons";

import styles from '../styles';
import { barGreyChevronRightLabelStyle, barGreyChevronRightStyle, chevronBarColorTick, chevronBarVerticalStyle, headerStyle } from "../compound.styles";
import ProgressSpinner from "./progress-spinner";
import AppServices from "../services/app-services";

const themePalette = AppServices.instance.getAppTheme();

export const panelDetail = (color: string, label: string, value: string | null | undefined) => {
    return (
        <View style={[styles.flex_toggle_row, chevronBarVerticalStyle, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
            <View style={[chevronBarColorTick, { backgroundColor: color, borderBottomLeftRadius: 6, borderTopLeftRadius: 6 }]}>
                <Text> </Text>
            </View>
            <View style={[barGreyChevronRightStyle, { flexDirection: 'row', alignItems: 'center', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]}>
                <Text style={[barGreyChevronRightLabelStyle, { flex: 1, textAlignVertical: 'center', fontSize: 16 }]}>{label}:</Text>
                <Text style={{ flex: 2, textAlign: 'right', textAlignVertical: 'center', marginRight: 5, fontSize: 16 }}>{value}</Text>
            </View>
        </View>
    )
}

export const sectionHeader = (sectionHeader: string) => {
    return (<View>
        <Text style={headerStyle}>{sectionHeader}</Text>
    </View>)
}

export const connectionBlock = (color: string, icon: string, label: string, status: boolean) => {
    return <View style={[{ flex: 1, margin: 2, justifyContent: 'center', }]}>
        {status &&
            <View style={{ height: 110, backgroundColor: color, borderRadius: 8 }}>
                <Text style={{ textAlign: "center", color: 'white' }}>{label}</Text>
                <View >
                    <Icon style={{ textAlign: 'center', }} size={48} color="white" name={icon} />
                </View>
                <Text style={{ textAlign: "center", textAlignVertical: "bottom", color: 'white' }}>Connected</Text>
            </View>
        }
        {!status &&
            <View style={{ height: 110, backgroundColor: '#e0e0e0', borderRadius: 8 }}>
                <Text style={{ textAlign: "center", color: 'black' }}>{label}</Text>
                <View >
                    <Icon style={{ textAlign: 'center', }} size={48} color="gray" name={icon} />
                </View>
                <Text style={{ textAlign: "center", textAlignVertical: "bottom", fontWeight: '500', color: 'black' }}>Not Connected</Text>
            </View>
        }
    </View>
}

export const busyBlock = (busyMessage: string = "Please Wait") => {
    return <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={[{ color: themePalette.shellTextColor, fontSize: 24, paddingBottom: 20 }]}>{busyMessage}</Text>
        <ProgressSpinner />
    </View>
}
