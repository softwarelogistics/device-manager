import React, { useEffect, useState } from 'react';
import { IReactPageServices } from '../services/react-page-services';
import Page from '../mobile-ui-common/page';
import styles from '../styles';
import * as Updates from 'expo-updates';
import AppServices from '../services/app-services';
import IconButton from '../mobile-ui-common/icon-button';
import { StaticContent } from '../services/content';
import Paragraph from '../mobile-ui-common/paragraph';
import WebLink from '../mobile-ui-common/web-link';
import { TouchableOpacity, View, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { primaryButtonStyle, primaryButtonTextStyle } from "../compound.styles";

export const DeviceTwinPage = ({ props, navigation, route }: IReactPageServices) => {
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [commands, setCommands] = useState<DeviceConfiguration.DeviceCommand[]>([]);
    const [properties, setProperties] = useState<Devices.DeviceProperty[]>([]);
    const [propertyValues, setPropertyValues] = useState<Core.AttributeValue[]>([]);
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
    });

    return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
        <KeyboardAwareScrollView>
            <View style={[styles.stdPadding]}>
                {properties && properties.map((prop, index) => {
                    return <View key={index}>
                        <Paragraph content={prop.property.name} />
                    </View>
                })
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