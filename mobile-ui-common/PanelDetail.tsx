import { View, Text, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/Ionicons";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import styles from '../styles';
import { barGreyChevronRightLabelStyle, barGreyChevronRightStyle, chevronBarColorTick, chevronBarVerticalStyle, headerStyle, labelStyle, h1Style, h2Style, h1CenteredStyle, h2CenteredStyle } from "../compound.styles";
import ProgressSpinner from "./progress-spinner";
import AppServices from "../services/app-services";
import { IOValues } from "../models/blemodels/iovalues";

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

export const h1 = (sectionHeader: string) => {
    return (<View>
        <Text style={h1Style}>{sectionHeader}</Text>
    </View>)
}

export const h2 = (sectionHeader: string) => {
    return (<View>
        <Text style={h2Style}>{sectionHeader}</Text>
    </View>)
}


export const h1Centered = (sectionHeader: string) => {
    return (<View>
        <Text style={h1CenteredStyle}>{sectionHeader}</Text>
    </View>)
}

export const h2Centered = (sectionHeader: string) => {
    return (<View>
        <Text style={h2CenteredStyle}>{sectionHeader}</Text>
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

export const wiFiIcon = (level: number) => {
    if (level > -40) {
        return <MciIcon name="wifi-strength-4" style={[styles.signalStrengthIcon]}></MciIcon>
    } else if (level > -60) {
        return <MciIcon name="wifi-strength-3" style={[styles.signalStrengthIcon]}></MciIcon>
    } else if (level > -80) {
        return <MciIcon name="wifi-strength-2" style={[styles.signalStrengthIcon]}></MciIcon>
    } else {
        return <MciIcon name="wifi-strength-1" style={[styles.signalStrengthIcon]}></MciIcon>
    }

 <MciIcon name="radar" style={[styles.centeredIcon]}></MciIcon>
       
}

export const busyBlock = (busyMessage: string = "Please Wait") => {
    return <View style={[styles.spinnerView, { height:200, backgroundColor: themePalette.background, paddingTop:150 }]}>
        <Text style={[{ color: themePalette.shellTextColor, height:60, fontSize: 24, paddingBottom: 20 }]}>{busyMessage}</Text>
        <ProgressSpinner style={[{marginTop:40}]} />
    </View>
}

export const sensorBlock = (idx: number, value: any, icon: string) => {
    return (
      <View style={[{ flex: 1, width: 100, backgroundColor: value ? 'green' : '#d0d0d0', margin: 5, justifyContent: 'center', borderRadius: 8 }]}>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: value ? 'white' : 'black' }}>Sensor {idx + 1}</Text>
        <View >
          <Icon style={{ textAlign: 'center', color: value ? 'white' : '#a0a0a0' }} size={64} name={icon} />
        </View>
        <Text style={{ textAlign: "center", textAlignVertical: "center", color: value ? 'white' : '#d0d0d0' }}>{value ?? '-'}</Text>
      </View>)
  }

  export const sensorRows = (sensorValues: IOValues) => {
        return <View style={{ marginTop: 20 }}>
        {sectionHeader('Live Sensor Data')}
        <Text style={labelStyle}>ADC Sensors</Text>
        <ScrollView horizontal={true}>
        {sensorBlock(0, sensorValues.adcValues[0], 'radio-outline')}
        {sensorBlock(1, sensorValues.adcValues[1], 'radio-outline')}
        {sensorBlock(2, sensorValues.adcValues[2], 'radio-outline')}
        {sensorBlock(3, sensorValues.adcValues[3], 'radio-outline')}
        {sensorBlock(4, sensorValues.adcValues[4], 'radio-outline')}
        {sensorBlock(5, sensorValues.adcValues[5], 'radio-outline')}
        {sensorBlock(6, sensorValues.adcValues[6], 'radio-outline')}
        {sensorBlock(7, sensorValues.adcValues[7], 'radio-outline')}
        </ScrollView>
        <Text style={labelStyle}>IO Sensors</Text>
        <ScrollView horizontal={true}>
        {sensorBlock(0, sensorValues.ioValues[0], 'radio-outline')}
        {sensorBlock(1, sensorValues.ioValues[1], 'radio-outline')}
        {sensorBlock(2, sensorValues.ioValues[2], 'radio-outline')}
        {sensorBlock(3, sensorValues.ioValues[3], 'radio-outline')}
        {sensorBlock(4, sensorValues.ioValues[4], 'radio-outline')}
        {sensorBlock(5, sensorValues.ioValues[5], 'radio-outline')}
        {sensorBlock(6, sensorValues.ioValues[6], 'radio-outline')}
        {sensorBlock(7, sensorValues.ioValues[7], 'radio-outline')}
        </ScrollView>
    </View>
  }