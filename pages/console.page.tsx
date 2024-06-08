import { useEffect, useState } from "react";
import { View, Text, TextStyle, ScrollView, Button } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import styles from '../styles';
import ViewStylesHelper from "../utils/viewStylesHelper";
import fontSizes from "../styles.fontSizes";
import { CHAR_UUID_CONSOLE, CHAR_UUID_CAN_MSG } from '../NuvIoTBLE'
import { StatusBar } from "expo-status-bar";
import Moment from 'moment';
import Page from "../mobile-ui-common/page";
import { ConnectedDevice } from "../mobile-ui-common/connected-device";


interface ConsoleOutput {
  timestamp: string;
  message: string;
}

export const ConsolePage = ({ props, navigation, route }: IReactPageServices) => {
  const themePalette = AppServices.getAppTheme();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);

  const contentStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.label, styles.mb_05, { color: themePalette.shellTextColor, fontSize: fontSizes.mediumSmall, fontWeight: (themePalette?.name === 'dark' ? '700' : '400') }]);

  const peripheralId = route.params.peripheralId;

  const charHandler = (value: any) => {
    if (value.characteristic == CHAR_UUID_CONSOLE) {
      var now = new Date();
      var msg = `${now.getHours()}:${now.getMinutes()} ${now.getSeconds()} ${value.value}`;
      console.log(msg);
      consoleOutput.unshift(
        { timestamp: Moment(now).format('hh:mm:ss a'), message: value.value }
      );
      setLastUpdated(now);
    }
    else if (value.characteristic == CHAR_UUID_CAN_MSG) {
      console.log('canmsg', value.value);
    }
  }

  const tryConnect = async () => {
    ConnectedDevice.onReceived = (value) => charHandler(value);
    ConnectedDevice.onConnected = () => setIsDeviceConnected(true);
    ConnectedDevice.onDisconnected = () => setIsDeviceConnected(false);

    await ConnectedDevice.connectAndSubscribe(peripheralId, [CHAR_UUID_CONSOLE]);
  }

  useEffect(() => {
    const focusSubscription = navigation.addListener('focus', async () => {
      await tryConnect();
    });

    const blurSubscription = navigation.addListener('beforeRemove', async () => {
      if (isDeviceConnected)
        await ConnectedDevice.disconnect();

    });

    return (() => {
      focusSubscription();
      blurSubscription();
    });
  }, [isDeviceConnected]);

  return <Page style={[styles.container]}>
    <ScrollView style={styles.scrollContainer}>
      <StatusBar style="auto" />
      {
        <View>
          <View>
            <Text>
              {isDeviceConnected && 
                <Text>
                Connected
                </Text>
              }
              {!isDeviceConnected && 
                <Text>
                Not Connected
                <Button title="Connect" onPress={tryConnect} />
                </Text>
              }
            </Text>
          </View>

          {consoleOutput.map((item, index) =>
            <View key={index}>
              <Text style={contentStyle}>
                {item.timestamp}
              </Text>
              <Text style={contentStyle}>
                {item.message}
              </Text>
            </View>
          )}
        </View>
      }
    </ScrollView>
  </Page>
}