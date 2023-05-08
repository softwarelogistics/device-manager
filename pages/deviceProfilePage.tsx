import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View, Text, TouchableOpacity } from "react-native";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import colors from "../styles.colors";
import styles from '../styles';
import Page from "../mobile-ui-common/page";
import { PermissionsHelper } from "../services/ble-permissions";
import { ble } from '../NuvIoTBLE'
import { BLENuvIoTDevice } from "../models/device/device-local";
import { Peripheral } from "react-native-ble-manager";
import { scanUtils } from "../services/scan-utils";

export const DeviceProfilePage = ({ props, navigation, route }: IReactPageServices) => {
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const [themePalette, setThemePalette] = useState<ThemePalette>({} as ThemePalette);
  
    const [isBusy, setIsBusy] = useState<boolean>(true);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [discoveredPeripherals, setDiscoveredPeripherals] = useState<Peripheral[]>([]);    
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined | any>();
    const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
    const [busyMessage, setIsBusyMessage] = useState<String>('Busy');
    const [deviceInRange, setDeviceInRange] = useState<boolean>(false);
    

    const repoId = route.params.repoId;
    const id = route.params.id;

    const loadDevice = async () => {
        let device = await appServices.deviceServices.getDevice(repoId, id);
        setDeviceDetail(device);
        console.log(device);
        connectToDevice(device);
    }

    const checkPermissions = async () : Promise<boolean> => {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 23) {
          if(!await PermissionsHelper.requestLocationPermissions())
            return false;
        }
  
        return await PermissionsHelper.requestBLEPermission();
      }
      else {
        return true;
      }
    }

    const discovered = async (peripheral: Peripheral) => {
      discoveredPeripherals.push(peripheral);
    }

    const connectToDevice = async (device: Devices.DeviceDetail) => {  
      setDevices([]);

      console.log('attempt to connect to device ' + device.deviceId);
    
      let hasPermissions = await checkPermissions();
      if (hasPermissions) {
        setDiscoveredPeripherals([]);
        if(device!.macAddress){
          if(await ble.connectById(device!.macAddress)) {
            console.log('connected - android');
            await ble.disconnectById(device!.macAddress)
            setDeviceInRange(true);
          }
          else {
            setDeviceInRange(false);
          }
        }
        
        if(device!.iosBLEAddress){
          if(await ble.connectById(device!.iosBLEAddress)) {
            console.log('connected - ios');
            await ble.disconnectById(device!.iosBLEAddress);
            setDeviceInRange(true);
          }
          else {
            setDeviceInRange(false);
          }
        }
        
        ble.addListener('connected', (device) => discovered(device))
        ble.addListener('scanning', (isScanning) => { scanningStatusChanged(isScanning); });
        await ble.startScan();
      }
      else {
        console.log('does not have permissions.');
      }
    }

    const showLiveDevice = () => {
      let peripheralId = Platform.OS == 'ios' ? deviceDetail.iosBLEAddress : deviceDetail.macAddress;
      navigation.replace('liveDevicePage', { id: peripheralId });
    }

    const stopScanning = () => {
      if (isScanning) {
        if (!ble.simulatedBLE()) {
          ble.removeAllListeners('connected');
          ble.removeAllListeners('scanning');
          ble.stopScan();
        }
      }
    }
  

    const scanningStatusChanged = async (isScanning: boolean) => {
      console.log('scanningStatusChanged=>' + isScanning);

      console.log(deviceDetail);
      console.log(deviceDetail?.macAddress);
      console.log(deviceDetail?.iosBLEAddress);
      setIsScanning(isScanning);  
    }
    
    useEffect(() => {
    if (initialCall) {
      appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) });
      appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) });

      setThemePalette(AppServices.getAppTheme());
          
      loadDevice();
      setInitialCall(false);
      ble.peripherals = [];      
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
            <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>{deviceDetail.name}</Text>
            <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>{deviceDetail.deviceId}</Text>
            <Text style={{ color: themePalette.shellTextColor, fontSize: 25 }}>{deviceDetail.lastContact}</Text>
            {
              deviceDetail.properties.map((prop: any, key: string) => {
                return <Text>{prop.value}</Text>
              })
            }
            { deviceInRange && 
              <TouchableOpacity style={[styles.submitButton]} onPress={() => showLiveDevice()}>
                <Text style={[styles.submitButtonText,]}>Connect</Text>
              </TouchableOpacity>
            }
        </View>
    }
    </Page>;

}