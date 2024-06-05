import { Peripheral } from "react-native-ble-manager";
import { SysConfig } from "../models/blemodels/sysconfig";
import { BLENuvIoTDevice } from "../models/device/device-local";
import { ble, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { NuvIoTEventEmitter } from "../utils/NuvIoTEventEmitter";

export class BLEScanUtils {

    public static isScanningSubscription: NuvIoTEventEmitter = new  NuvIoTEventEmitter();
    public static isBusyMessageSubscription: NuvIoTEventEmitter = new  NuvIoTEventEmitter();

    public async getNuvIoTDevices(discoveredPeripherals: Peripheral[], currentDeviceCount: number) : Promise<BLENuvIoTDevice[]> 
    {
        let newDevices: BLENuvIoTDevice[] = [];
    
        for (let peripheral of discoveredPeripherals) {
          try
          {
            if (await ble.connectById(peripheral.id, CHAR_UUID_SYS_CONFIG)) {
              let sysConfigStr = await ble.getCharacteristic(peripheral.id, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
              if (sysConfigStr) {
                console.log(sysConfigStr);
      
                let sysConfig = new SysConfig(sysConfigStr);
      
                let name = sysConfig.deviceId;
                if (!name || name == '')
                  name = peripheral.name!;
      
                  currentDeviceCount++;

                let device: BLENuvIoTDevice = {
                  peripheralId: peripheral.id,
                  name: name,
                  deviceType: sysConfig.deviceModelId,
                  provisioned: false,
                  orgId: sysConfig.orgId,
                  repoId: sysConfig.repoId,
                  deviceUniqueId: sysConfig.id,
                  id: currentDeviceCount
                }
      
                if (sysConfig.id && sysConfig.id.length > 0)
                  device.provisioned = true;
      
                newDevices.push(device);
              }
      
              await ble.disconnectById(peripheral.id);
            }
          }
          catch(e) {
           console.log('could not connect, giving up....') 
          }
        }

        return newDevices;    
    }
}

export let scanUtils = new BLEScanUtils();
