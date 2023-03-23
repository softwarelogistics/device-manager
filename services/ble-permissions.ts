import { PermissionsAndroid, Platform } from 'react-native';

export class PermissionsHelper {
    public static async requestBLEPermission(): Promise<boolean> {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
                title: 'Location permission for bluetooth scanning',
                message: 'To scan for NuvIoT devices, the application must have permissions to access course location.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
            );

            let btGranted = PermissionsAndroid.RESULTS.GRANTED;
            let btcGranted = PermissionsAndroid.RESULTS.GRANTED;

            let OsVer = Platform.Version;//.constants["Release"] as number;

            console.log('react native version' + OsVer)

            // android revision 30 is android release 11, 31 is 12.
            if (OsVer > 30) {
                console.log('OS Version is greater then 30, need to request additional BT permissions.');

                btGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
                    title: 'Bluetooth Scanning Permission',
                    message: 'To scan for NuvIoT devices, the application must have permissions to scan for bluetooth devices.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });

                console.log('Scan permissions granted?', btGranted);

                btcGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
                    title: 'Bluetooth Connect Permissions',
                    message: 'To connect to NuvIoT devices, the application must have permissions to connect to bluetooth devices.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });

                console.log('Connect permissions granted?', btGranted);
            }
            else {
                console.log('OS Version less or equal to 30, do not need to request additional BT permissions.');
            }

            console.log('Permissions Granted', granted, btGranted, btcGranted);

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                if (btGranted === PermissionsAndroid.RESULTS.GRANTED) {
                    if (btcGranted === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('Location permission for bluetooth scanning granted');
                        return true;
                    }
                    else {
                        console.log('Blue tooth connect permission => ' + btcGranted);
                        return false;
                    }
                }
                else {
                    console.log('Blue tooth scan permission revoked -=> ' + btGranted);
                    return false;
                }
            } else {
                console.log('Location permission for bluetooth scanning revoked -=> ' + granted);
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    public static async requestLocationPermissions(): Promise<boolean> {
        let hasFineLocationPermissions = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if(hasFineLocationPermissions) {
            console.log("Already has fine location permissions");

            return true;
        }

        let grantedFineLocationPermissions = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if(grantedFineLocationPermissions) {
            console.log("User accept");
            return true;
        }


        console.log("User refuse");
        return false;
    }

}