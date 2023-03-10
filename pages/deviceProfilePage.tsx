import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import colors from "../styles.colors";
import styles from '../styles';
import Page from "../mobile-ui-common/page";

export const DeviceProfilePage = ({ props, navigation, route }: IReactPageServices) => {
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  
    const [isBusy, setIsBusy] = useState<boolean>(true);
    
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
    
    const repoId = route.params.repoId;
    const id = route.params.id;

    const loadDevice = async () => {
        let device = await appServices.deviceServices.getDevice(repoId, id);
        setDeviceDetail(device);
        console.log(device);
    }

    
  useEffect(() => {
    if (initialCall) {
      appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) });
      appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) });

      setThemePalette(AppServices.getAppTheme());
    
      loadDevice();
      setInitialCall(false);
    }
    
    return (() => {
      });
    });


    return <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
    {
      isBusy &&
      <View style={[styles.spinnerView, { backgroundColor: themePalette.background }]}>
        <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>Retrieving Device</Text>
        <ActivityIndicator size="large" color={colors.accentColor} animating={isBusy} />
      </View>
    }
    {
        !isBusy && deviceDetail &&
        <View>
            <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>{deviceDetail.deviceId}</Text>
        </View>
    }
    </Page>;

}