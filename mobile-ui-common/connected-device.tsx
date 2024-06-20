import { ble, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { PermissionsHelper } from "../services/ble-permissions";
import { LogWriter } from './logger';

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

    static async disconnectHandler(id: string) {
        await LogWriter.log(`[Console__disconnectHandler]`,`disconnected; // deviceid=${id}`)
        ConnectedDevice.connectionState = DISCONNECTED;
        ble.removeAllListeners();
        if (ConnectedDevice.onDisconnected) ConnectedDevice.onDisconnected();
        this.peripheralId = undefined;
    }

    static charHandler = (value: any) => {
        if (ConnectedDevice.onReceived) {
            ConnectedDevice.onReceived(value);
        }
    }

    static async connect(peripheralId: string | undefined = undefined, retryCount: number = 5): Promise<boolean> {
        if (await PermissionsHelper.hasBLEPermissions()) {
            ConnectedDevice.connectionState = CONNECTING;

            if(this.peripheralId && peripheralId) {
                // if we already had a peripheralId, that means we were already connected.
                await this.disconnect();
            }

            ConnectedDevice.peripheralId = peripheralId;

            await LogWriter.log('[ConnectedDevice__connect]',`BEGIN - Retry Count ${retryCount}`);
            let promise = ble.connectById(ConnectedDevice.peripheralId!, undefined, retryCount);
            try {
                let result = await promise;

                if (result) {
                    await LogWriter.log('[ConnectedDevice__connect]',`Connected`);
                    ble.addListener('receive', (char) => ConnectedDevice.charHandler(char));
                    ble.addListener('disconnected', ConnectedDevice.disconnectHandler);
                    ConnectedDevice.connectionState = CONNECTED;

                    for (let charId of ConnectedDevice._subscriptions!) {
                        let success = await ble.listenForNotifications(ConnectedDevice.peripheralId!, SVC_UUID_NUVIOT, charId);
                        if (!success) {
                            ConnectedDevice.errorMessage = 'Could not listen for notifications.';
                            await LogWriter.warn(`[ConnectedDevice__connect_could-not-subscribed]`,`char-id=${charId};`)
                        }
                        else
                            await LogWriter.warn(`[ConnectedDevice__connect_could-not-subscribed]`,`char-id=${charId};`)                            
                    }

                    if (ConnectedDevice.onConnected) {
                        ConnectedDevice.onConnected();
                    }

                    await LogWriter.log('[ConnectedDevice__connect]',`END - Success, did not connect.`);
                    return true;
                }
                else {
                    if (ConnectedDevice.didNotConnect) 
                        ConnectedDevice.didNotConnect();

                    ConnectedDevice.peripheralId = undefined;
                    await LogWriter.log('[ConnectedDevice__connect]',`END - Failed, did not connect.`);                    
                    return false;
                }
            }
            catch (e) {
                ConnectedDevice.peripheralId = undefined;
                await LogWriter.log('[ConnectedDevice__connect]',`END - Failed ${e}.`);
                return false;
            }
        }

        return false;
    }

    static async connectAndWrite(peripheralId: string, serviceId: string, charId: string, value: string, retryCount: number = 5): Promise<boolean> {
        if (await this.connect(peripheralId, retryCount)) {
            let result = await this.writeCharacteristic(peripheralId, serviceId, charId, value);
            await this.disconnect();
            return result;
        }
        return false;
    }

    static async writeCharacteristic(peripheralId: string, serviceId: string, charId: string, value: string) {
        return await ble.writeCharacteristic(peripheralId, serviceId, charId, value);
    }

    static async getCharacteristic(peripheralId: string, serviceId: string, charId: string) : Promise<string | null> {
        return await ble.getCharacteristic(peripheralId, serviceId, charId);
    }

    static async writeNoResponseCharacteristic(peripheralId: string, serviceId: string, charId: string, value: string) {
        return await ble.writeNoResponseCharacteristic(peripheralId, serviceId, charId, value);
    }

    static async connectAndSubscribe(peripheralId: string, subscriptions: string[] = [], retryCount: number = 5): Promise<boolean> {
        if(!peripheralId)
            throw 'peripheralId is a required field.';
        
        this._subscriptions = subscriptions;
        return await this.connect(peripheralId, retryCount);
    }

    static async disconnect() {
        if ((ConnectedDevice.peripheralId)) {
            await LogWriter.log(`[ConnectedDevice__disconnect]`,`Has peripheral id, disconnecting; // deviceid=${ConnectedDevice.peripheralId}`);
            if (ConnectedDevice._subscriptions) {
                for (let charId of ConnectedDevice._subscriptions!)
                    await ble.stopListeningForNotifications(ConnectedDevice.peripheralId!, SVC_UUID_NUVIOT, charId);
            }

            ble.removeAllListeners();
            if ((ConnectedDevice.peripheralId))
                await ble.disconnectById(ConnectedDevice.peripheralId!);            

            ConnectedDevice.peripheralId = undefined;
        }
        else 
            await LogWriter.log(`[ConnectedDevice__disconnect]`,`No existing connection;`);
    }
}
