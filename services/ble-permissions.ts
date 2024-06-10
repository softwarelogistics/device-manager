import { PermissionsAndroid, Platform } from 'react-native';

export class PermissionsHelper {
    public static verbose = false;

    public static async requestBLEPermission(): Promise<boolean> {
        try {

            let crsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

            if (crsGranted) {
                if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Already Has Course Location');
            }
            else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
                    title: 'Location permission for bluetooth scanning',
                    message: 'To scan for NuvIoT devices, the application must have permissions to access course location.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }),

                    crsGranted = granted == PermissionsAndroid.RESULTS.GRANTED;
                if (!crsGranted) {
                    alert('To Use Bluetooth, you must grant location permissions.');
                    if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Course Location Not Granted - will not continue.');
                    return false;
                }

                if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Course Location Granted Will Continue.');
            }

            let OsVer = Platform.Version as number;
            if (crsGranted && OsVer < 31) {
                if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - OS Version < 31 and has course location');
                return true;
            }
            else 
                if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - OS Version > 30 will need to check for bluetooth permissions.');

            let btsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
            if (!btsGranted) {
                btsGranted = (await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN/*, {
                    title: 'Bluetooth Scanning Permission',
                    message: 'To scan for NuvIoT devices, the application must have permissions to scan for bluetooth devices.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }*/)) == PermissionsAndroid.RESULTS.GRANTED;

                if (!btsGranted) {
                    alert('To Use Bluetooth, you must grant bluetooth scanning permissions.');
                    console.log('[PermissionsHelper__requestBLEPermission] - Bluetooth Scanning Not Granted - will not continue.');
                    return false;
                }

                if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Bluetooth Scanning Granted Will Continue.');
            }
            else
            if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Bluetooth Scanning Already Granted Will Continue.');


            let btcGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
            if (!btcGranted) {
                btcGranted = (await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
                    title: 'Bluetooth Connect Permission',
                    message: 'To Connect to NuvIoT devices, the application must have permissions to connect for bluetooth devices.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                })) == PermissionsAndroid.RESULTS.GRANTED;

                if (!btcGranted) {
                    alert('To Use Bluetooth, you must grant bluetooth connect permissions.');
                    if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Bluetooth Connect Not Granted - will not continue.');
                    return false;
                }

                if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Bluetooth Connect Granted Will Continue.');
            }
            else
                if(PermissionsHelper.verbose) console.log('[PermissionsHelper__requestBLEPermission] - Bluetooth Connect Already Granted Will Continue.');

            return true;

        } catch (err) {
            console.log('[PermissionsHelper__requestBLEPermission] - Error')
            console.log(err)
            return false;
        }
    }

    public static async requestLocationPermissions(): Promise<boolean> {
        let hasFineLocationPermissions = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (hasFineLocationPermissions) {
            if(PermissionsHelper.verbose) console.log("[PermissionsHelper__requestBLEPermission] - Already has fine location permissions");
            return true;
        }

        let grantedFineLocationPermissions = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (grantedFineLocationPermissions) {
            if(PermissionsHelper.verbose) console.log("'[PermissionsHelper__requestBLEPermission] - User Accepted has fine location permissions");
            return true;
        }

        alert('To Use Bluetooth, you must grant bluetooth fine location permissions.');
        if(PermissionsHelper.verbose) console.log("'[PermissionsHelper__requestBLEPermission] - User did not accept fine location permissions");

        return false;
    }

    public static async hasBLEPermissions() : Promise<boolean> {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 23) {
              if (!await PermissionsHelper.requestLocationPermissions())
                return false;
            }
      
            return await PermissionsHelper.requestBLEPermission();
          }
          else {
            return true;
          }      
    }
}