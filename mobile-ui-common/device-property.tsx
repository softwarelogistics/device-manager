import { Text, View, TextInput, Platform, ActionSheetIOS, ActionSheetIOSOptions, } from 'react-native';
import AppServices from "../services/app-services";
import { Button } from 'react-native-ios-kit';
import styles from "../styles";
import palettes from "../styles.palettes";
import colors from '../styles.colors';
import { themePalette } from '../compound.styles';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';

export interface DevicePropertyProps {
    property: Devices.DeviceProperty,
    key: number
    valueChanged?: ((propKey: string, text: string) => void) | undefined;
}


const getOptions = (options: string[]): ActionSheetIOSOptions => {
    return {
      options: options,
      cancelButtonIndex: 0,
      userInterfaceStyle: themePalette.name == 'dark' ? 'dark' : 'light',
    }
  }


export default function DeviceProperty(props:DevicePropertyProps) {
    const themePalette = AppServices.instance.getAppTheme();

    const [selectedState, setSelectedState] = useState<string | undefined>(props.property.property.value!);
    const [selectedStateName, setSelectedStateName] = useState<string | undefined >( props.property.metaData.stateSet?.value?.states.find(st=>st.key == props.property.property.value!)?.name);

    const iosSelectDeviceProperty = () => {
        ActionSheetIOS.showActionSheetWithOptions(getOptions(props.property.metaData.stateSet.value?.states.map(item => item.name)!),
          buttonIndex => {
            console.log(buttonIndex);
            if (buttonIndex > 0) {
                setSelectedState(props.property.metaData.stateSet.value?.states[buttonIndex].key!)
                setSelectedStateName(props.property.metaData.stateSet.value?.states[buttonIndex].name!)
            }
            else {
                setSelectedState(undefined);
                setSelectedStateName(undefined);
            }
          })
      };
  
      const androidSelectDeviceProperty = (e: string) => {
        setSelectedState(e);
        valueChanged(e);
      }

      const valueChanged = (e: string) => {
        props.property.property.value = e;
        if(props.valueChanged)
            props.valueChanged(props.property.metaData.key, e);
      }
  

    return (
        <View>
                <Text style={[styles.label, { marginBottom: 8, color: themePalette.name === 'dark' ? themePalette.shellTextColor : palettes.gray.v95 , fontWeight: (themePalette.name === 'dark' ? '700' : '400')  }]} >{props.property.metaData.label}</Text>
                {props.property.metaData.fieldType.id === 'state' && 
                    <View>
                        {Platform.OS == 'ios' && selectedState && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => iosSelectDeviceProperty()} >{selectedStateName}</Button>}
                        {Platform.OS == 'ios' && !selectedState && <Button style={{ color: themePalette.shellTextColor, margin: 20 }} inline onPress={() => iosSelectDeviceProperty()} >-select-</Button>}
                        {Platform.OS != 'ios' &&
                            <Picker selectedValue={selectedState} onValueChange={e => androidSelectDeviceProperty(e)} itemStyle={{ color: themePalette.shellTextColor }} style={{ backgroundColor: themePalette.background, color: themePalette.shellTextColor }} >
                                {props.property.metaData.stateSet.value?.states.map(itm =>
                                <Picker.Item key={itm.key} label={itm.name} value={itm.key} style={{ color: themePalette.shellTextColor, backgroundColor: themePalette.background }} />
                                )}
                            </Picker>
              }                        
                    </View>
                }
                {props.property.metaData.fieldType.id === 'integer' && 
                    <View>
                        <TextInput autoCapitalize="none" placeholderTextColor={themePalette.placeHolderText} value={props.property.property.value} keyboardType='numeric' onChangeText={text => valueChanged(text)}
                          style={{ textAlign:'right', color: themePalette.shellTextColor, fontSize:16, backgroundColor: themePalette.inputBackgroundColor, height:55, paddingEnd:16, marginRight:5, marginBottom:16,  borderRadius: 8, borderStyle: 'solid',  borderWidth: 1,borderColor: colors.borderLightColor }} />
                    </View>
                }
                {props.property.metaData.fieldType.id === 'decimal' && 
                    <View>
                        <TextInput autoCapitalize="none"  placeholderTextColor={themePalette.placeHolderText} value={props.property.property.value} keyboardType='numeric' onChangeText={text => valueChanged(text)}
                          style={{ textAlign:'right', color: themePalette.shellTextColor, fontSize:16, backgroundColor: themePalette.inputBackgroundColor, height:55, paddingEnd:16, marginRight:5, marginBottom:16,  borderRadius: 8, borderStyle: 'solid',  borderWidth: 1,borderColor: colors.borderLightColor }} />
                    </View>
                }
                {props.property.metaData.fieldType.id === 'true-false' && 
                    <View>
                    </View>
                }   
                {props.property.metaData.fieldType.id === 'string' && 
                    <View>
                        <TextInput autoCapitalize="none"  placeholderTextColor={themePalette.placeHolderText} value={props.property.property.value}
                          style={{ color: themePalette.shellTextColor, fontSize:16, backgroundColor: themePalette.inputBackgroundColor, height:55, paddingStart:16, marginRight:5, marginBottom:16,  borderRadius: 8, borderStyle: 'solid',  borderWidth: 1,borderColor: colors.borderLightColor }} />
                    </View>
                }   
                {props.property.metaData.fieldType.id === 'dateTime' && 
                    <View>
                    </View>
                }   
                {props.property.metaData.fieldType.id === 'valueWithUnit' && 
                    <View>
                    </View>
                }   
        </View>
    )};