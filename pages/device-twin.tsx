import React, { useEffect, useState } from 'react';
import { IReactPageServices } from '../services/react-page-services';
import Page from '../mobile-ui-common/page';
import styles from '../styles';
import AppServices from '../services/app-services';

import { TouchableOpacity, View, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { primaryButtonStyle, primaryButtonTextStyle } from "../compound.styles";
import DeviceProperty from '../mobile-ui-common/device-property';

export const DeviceTwinPage = ({ props, navigation, route }: IReactPageServices) => {
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [commands, setCommands] = useState<DeviceConfiguration.DeviceCommand[]>([]);
    const [properties, setProperties] = useState<Devices.DeviceProperty[]>([]);
    const [propertyValues, setPropertyValues] = useState<Core.AttributeValue[]>([]);
    const [idx, setIdx] = useState<number>(0);  
    const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();


    const themePalette = AppServices.instance.getAppTheme();
    const deviceId = route.params.deviceId;
    const deviceRepoId = route.params.deviceRepoId;

    const populate = (deviceDetail: Devices.DeviceDetail) => {
        let propertyList: Devices.DeviceProperty[] = [];
        let propertyValues: Core.AttributeValue[] = [];

        for (const prop of deviceDetail.propertiesMetaData) {
            console.log(prop);
            const propValue = deviceDetail.properties!.find(pr => pr.key === prop.key);
            if (propValue) {
                propertyList.push({
                    metaData: prop,
                    property: propValue
                });
            } else {
                const newPropValue: Core.AttributeValue = {
                    name: prop.name,
                    attributeType: prop.fieldType,
                    key: prop.key,
                    isAlarm: false
                };

                switch (newPropValue.attributeType.id) {
                    case 'integer':
                    case 'decimal':
                    case 'true-false':
                    case 'string':
                    case 'dateTime':
                    case 'valueWithUnit':
                        newPropValue.value = prop.defaultValue;
                        break;
                    case 'state':
                        if (prop.stateSet!.value!.states) {
                            const defaultState = prop.stateSet.value!.states.find(frs => frs.isInitialState);
                            if (newPropValue) {
                                newPropValue.value = defaultState!.key;
                            }
                        }
                        break;
                }

                console.log(newPropValue);
                propertyValues.push(newPropValue);
                propertyList.push(
                    {
                        metaData: prop,
                        property: newPropValue
                    });
            }
        }

        setPropertyValues(propertyValues);
        setProperties(propertyList);
    }

    const loadCommands = async () => {
        let fullDevice = await AppServices.instance.deviceServices.getDevice(deviceRepoId, deviceId);
        setDeviceDetail(fullDevice);
        let config = await AppServices.instance.deviceServices.getDeviceConfiguration(fullDevice!.deviceConfiguration.id);
        setCommands(config!.model.commands);
        populate(fullDevice!);
    }

    const sendCommand = async (command: DeviceConfiguration.DeviceCommand) => {
        let result = await AppServices.instance.deviceServices.sendDeviceCommand(deviceRepoId, deviceId, command.id, []);
        console.log(result);
    }

    useEffect(() => {
        if (initialCall) {
            loadCommands();
            setInitialCall(false);
        }
    }, []);

    const valueChanged = (key: string, value: string) => {
        console.log(key, value);
        let prop = properties.find(prop => prop.metaData.key === key)!
        console.log(prop);
        prop.property.value = value;
        setProperties(properties);
        setIdx(idx + 1);
    }

    const updateProperties = async () => {
        console.log('should update these on the server..')
        for(let prop of properties) {
            console.log(prop.property.value);
        }

        for(let prop of deviceDetail.properties) {
            let newValue = properties.find(p => p.metaData.key === prop.key);
            console.log(prop.key, prop.value, newValue?.property.value);
        }

        await AppServices.instance.deviceServices.updateDevice(deviceDetail);
    }

    return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
        <KeyboardAwareScrollView>
            <View style={[styles.stdPadding]}>
                {properties && properties.length > 0 && 
                         properties.map((prop, index) => {return <DeviceProperty valueChanged={valueChanged} property={prop} key={index}></DeviceProperty>})                         
                }                

                {properties && properties.length > 0 && 
                    <TouchableOpacity style={[primaryButtonStyle]} onPress={() => updateProperties()}>
                        <Text style={primaryButtonTextStyle}> Update Properties </Text>
                    </TouchableOpacity>
                }

                {commands && commands.map((prop, index) => {
                    return <View key={index}>
                        <TouchableOpacity style={[primaryButtonStyle, { marginTop: 30, }]} onPress={() => sendCommand(prop)}>
                            <Text style={primaryButtonTextStyle}> {prop.name} </Text>
                        </TouchableOpacity>
                    </View>
                })
                }

            </View>
        </KeyboardAwareScrollView>
    </Page>;
}