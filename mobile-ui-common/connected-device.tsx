import { ble, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { PermissionsHelper } from "../services/ble-permissions";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export class ConnectedDevice {
    static peripheralId: string | undefined;
    static connectionState: number = IDLE;
    static lastUpdated: Date | undefined;
    static errorMessage: string | undefined;
    static onDisconnected: (() => void) | undefined;
    static onConnected: (() => void) | undefined;
    static didNotConnect: (() => void) | undefined;
    static onReceived: ((value: any) => void) | undefined;

    private static _subscriptions: string[] | undefined;

    static disconnectHandler(id: string) {
        console.log(`[Console__disconnectHandler] disconnected; // deviceid=${id}`)
        ConnectedDevice.connectionState = DISCONNECTED;
        ble.removeAllListeners();
        if (ConnectedDevice.onDisconnected) ConnectedDevice.onDisconnected();
    }

    static charHandler = (value: any) => {
        if (ConnectedDevice.onReceived) {
            ConnectedDevice.onReceived(value);
        }
    }

    static async connect(retryCount: number = 5): Promise<boolean> {
        if (await PermissionsHelper.hasBLEPermissions()) {
            ConnectedDevice.connectionState = CONNECTING;

            console.log(`[ConnectedDevice__connect] Retry Count ${retryCount}`);
            let promise = ble.connectById(ConnectedDevice.peripheralId!, undefined, retryCount);
            try {
                let result = await promise;

                if (result) {
                    console.log(`[ConnectedDevice__connect] Connected`)
                    ble.addListener('receive', (char) => ConnectedDevice.charHandler(char));
                    ble.addListener('disconnected', ConnectedDevice.disconnectHandler);
                    ConnectedDevice.connectionState = CONNECTED;

                    for (let charId of ConnectedDevice._subscriptions!) {
                        let success = await ble.listenForNotifications(ConnectedDevice.peripheralId!, SVC_UUID_NUVIOT, charId);
                        if (!success) {
                            ConnectedDevice.errorMessage = 'Could not listen for notifications.';
                            console.warn(`[ConnectedDevice__connect_could-not-subscribed] char-id=${charId};`)
                        }
                        else
                            console.log(`[ConnectedDevice__connect_subscribed] char-id=${charId};`)
                    }

                    if (ConnectedDevice.onConnected) {
                        ConnectedDevice.onConnected();
                    }

                    return true;
                }
                else {
                    if (ConnectedDevice.didNotConnect) ConnectedDevice.didNotConnect();
                    return false;
                }
            }
            catch (e) {
                return false;
            }
        }

        return false;
    }

    static async writeCharacteristic(peripheralId: string, serviceId: string, charId: string, value: string) {
        return await ble.writeCharacteristic(peripheralId, serviceId, charId, value);
    }

    static async connectAndSubscribe(peripheralId: string, subscriptions: string[], retryCount: number = 5): Promise<boolean> {
        if(!peripheralId)
            throw 'peripheralId is a required field.';
        
        ConnectedDevice.disconnect();
        this._subscriptions = subscriptions;
        this.peripheralId = peripheralId;
        return await this.connect(retryCount);
    }

    static async disconnect() {
        if ((ConnectedDevice.peripheralId)) {
            if (ConnectedDevice._subscriptions) {
                for (let charId of ConnectedDevice._subscriptions!)
                    await ble.stopListeningForNotifications(ConnectedDevice.peripheralId!, SVC_UUID_NUVIOT, charId);
            }

            ble.removeAllListeners();
            if ((ConnectedDevice.peripheralId))
                await ble.disconnectById(ConnectedDevice.peripheralId!);            
        }
    }
}
