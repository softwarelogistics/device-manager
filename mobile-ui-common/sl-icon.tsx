import * as FileSystem from 'expo-file-system';
import { Text, PermissionsAndroid, Platform, View, Image, TextInput, TouchableOpacity, TextStyle, ViewStyle, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { resolveIcon } from './icon-resolver';

export interface SLIconProperties {
    icon: string;
    width?: number;
    height?: number;
}


export default function SLIcon(props: SLIconProperties) {
    let height = 30;
    if (props.height)
        height = props.height;

    let width = 30; 
    if (props.width)
        width = props.width;

    console.log(height, width);

    return (
        <Image style={[{ height: height, width: width }]} source={resolveIcon(props.icon)} />
    )
}

