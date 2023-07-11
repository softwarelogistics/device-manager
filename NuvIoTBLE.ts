import { Platform, NativeEventEmitter, NativeModules } from "react-native";

import { NuvIoTEventEmitter } from './utils/NuvIoTEventEmitter'

import { Peripheral } from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;

let simulateBLE = (BleManagerModule == null);
const bleManagerEmitter =  simulateBLE ? null : new NativeEventEmitter(BleManagerModule);

console.log('Application Startup, BLE is forced to simulated => ', simulateBLE);

import BleManager, { requestMTU } from './services/BleManager'
var Buffer = require('buffer/').Buffer

export const SVC_UUID_NUVIOT = "d804b639-6ce7-4e80-9f8a-ce0f699085eb"
export const CHAR_UUID_STATE = "d804b639-6ce7-5e81-9f8a-ce0f699085eb"
/* 
 * State characteristic will encompass 
 * Read/Write and Will Notify
 *
 * xxxx => F/W SKU
 * xxx.xxx.xxx, F/W Version =>
 * xxx.xxx.xxx, H/W Version =>
 
 * (1/0) => Commissioned
 * (1/0) => BT Connectivity
 * (1/0) => WiFi Connectivity
 * (XX) => WiFiRSSI Connectivity
 * (1/0) => Cell Connectivity
 * (1/0) => CellRSSI
 * (1/0) => GPS Connectivity
 * (1/0) => GPS Satelites
 * (1/0) => Server Connectivity
 * xxx => OTA State
 * xxx => OTA Param
 */

export const SYS_STATE_DEFAULT = "BLE - GATT Example,1.0.0,*,0,0,0,0,0,0,0,0";

export const CHAR_UUID_SYS_CONFIG = "d804b639-6ce7-5e82-9f8a-ce0f699085eb"
/* 
  * Sys Config characteristic
  * Read/Write
  * xxxxx, Device Id <= =>
  * xxxxx, B64 Device Key (128 characters) =>
  * (0/1) Cell Enable <= =>
  * (0/1) WiFi Enable <= =>
  * xxxxxx WiFi SSID <= =>
  * xxxxxx WiFi Password =>
  * xxxx Ping Rate (sec)
  * xxxx Send Rate (sec)
  * (0/1) GPS Enable
  * xxxx GPS Rate (sec),
  */

export const SYS_CONFIG_DEFAULT = "?,MISC,,0,0,,,120,120,1,5";


export const CHAR_UUID_IOCONFIG = "d804b639-6ce7-5e83-9f8a-ce0f699085eb"
/* IO Config
   * 
   * 8 Slots
   * 3 Params per slot
   * x = Configuration
   * xxx = scale
   * xxx = zero
   *
   */

export const CHAR_UUID_IO_VALUE = "d804b639-6ce7-5e85-9f8a-ce0f699085eb"
/* IO Config
   * 
   * 8 Slots
   * 3 Params per slot
   * x = Configuration
   * xxx = scale
   * xxx = zero
   *
   */

export const CHAR_UUID_RELAY = "d804b639-6ce7-5e87-9f87-ce0f699085eb"
/* RELAY Config
   * 
   * 16 slots
   * (1,0) <= => Relay State
   *
   */

const CHAR_UUID_CONSOLE = "d804b639-6ce7-5e88-9f88-ce0f699085eb"
/* Console Messages
   * 
   * 16 slots
   * (1,0) <= => Relay State
   *
   */

export class NuvIoTBLE {
  isScanning = false;

  startupTimeStamp: Date = new Date();

  peripherals: Peripheral[] = [];

  public emitter: NativeEventEmitter | undefined;
  public btEmitter: NuvIoTEventEmitter | undefined;

  constructor() {
    // NOTE: A user-stored value now exists in native storage, 'simulateDevices'. 
    //       See /user.service.ts/getSimulateDevices() [on or about line 328] for more detail.

    if (!this.simulatedBLE()) {
      this.emitter = new NativeEventEmitter(BleManagerModule);
      this.btEmitter = new NuvIoTEventEmitter();
    }
    else {
      //this.emitter = new NativeEventEmitter();    
      //this.btEmitter = new NuvIoTEventEmitter();
    }

    console.log("BLEManager__Constructor");
    console.log("OS " + Platform.OS);

    if (Platform.OS !== 'web') {
      BleManager.start({ showAlert: true })
        .then(() => {
          console.log('BLEManager__Startup: Success');
        })
        .catch((err: any) => {
          console.log('BLEManager__Startup: Error: ', err);
        });
    }
  }

  addListener(name: string, callback: (event: any) => void) {
    if (!this.simulatedBLE()) {
      this.btEmitter?.addListener(name, callback);
    }
  }

  removeAllListeners(name: string) {
    if (!this.simulatedBLE()) {
      this.btEmitter?.removeAllListeners(name);
    }
  }

  subscribe(ble: NuvIoTBLE) {
    if (ble == null) {
      throw 'BLE is null, requires instance of BLE manager for subscription.'
    }

    if (!this.simulatedBLE() && bleManagerEmitter) {
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      bleManagerEmitter.removeAllListeners('BleManagerStopScan');
      bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
      bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');

      bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral: Peripheral) => this.handleDiscoverPeripheral(ble, peripheral));
      bleManagerEmitter.addListener('BleManagerStopScan', () => this.handleStopScan(ble));
      bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', (peripheral: Peripheral) => this.handleDisconnectedPeripheral(ble, peripheral));
      bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({ value, peripheral, characteristic, service }) => {

        // Convert bytes array to string
        const buffer = Buffer.from(value);
        const decodedValue = buffer.toString();
        ble.btEmitter?.emit('receive', { characteristic: characteristic, value: decodedValue });
      });
    }

    console.log('BLEManager__subscribe - subscribed to native events: DiscoverPeripheral, StopScan, DisconnectPeripheral, DidUpdateValueForCharacteristic');
  }

  unsubscribe() {
    if (!this.simulatedBLE() && bleManagerEmitter) {
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      bleManagerEmitter.removeAllListeners('BleManagerStopScan');
      bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
      bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
    }
    console.log('BLEManager__unsubscribe - subscribed to native events: DiscoverPeripheral, StopScan, DisconnectPeripheral, DidUpdateValueForCharacteristic');
  }

  setIsScanning(value: boolean) {
    this.isScanning = value;
    console.log('BLEManager__setIsScanning: ' + value);
    if (!this.simulatedBLE()) {
      this.btEmitter?.emit('scanning', value);
    }
  }

  enableSimulator():void {
    simulateBLE = true;
  }

  disableSimulator(): void {
    if(BleManagerModule)
       simulateBLE = false;
  }

  hasBLE(): boolean {
    return BleManagerModule;
  }

  simulatedBLE(): boolean {
    return Platform.OS === 'web' || simulateBLE;
  }

  async listenForNotifications(deviceId: string, serviceId: string, characteristicId: string): Promise<boolean> {
    console.log('BLEManager__listenForNotifications, char=' + characteristicId);
    try {
      await BleManager.startNotification(deviceId, serviceId, characteristicId);
      console.log('BLEManager__listenForNotifications started, char=' + characteristicId);
      return true;
    }
    catch (e) {
      console.log('BLEManager__listenForNotifications could not start, char=' + characteristicId + ", err=" + e);
      return false;
    }
  }

  async stopListeningForNotifications(deviceId: string, serviceId: string, characteristicId: string): Promise<boolean> {
    console.log('BLEManager_stopListeningForNotifications, char=' + characteristicId);
    try {
      await BleManager.stopNotification(deviceId, serviceId, characteristicId);
      console.log('BLEManager__stopListeningForNotifications started, char=' + characteristicId);
      return true;
    }
    catch (e) {
      console.log('BLEManager__stopListeningForNotifications could not stop listening, char=' + characteristicId + ", err=" + e);
      return false;
    }
  }

  async startScan() {
    if (this.simulatedBLE()) {
      this.setIsScanning(true);
      let timer = window.setInterval(() => {
        let id = `${this.peripherals.length}-${new Date().getMilliseconds()}`;

        let peripheral: Peripheral = {
          id: id,
          name: `Perip - ${id}`,
          rssi: (new Date()).getSeconds(),
          advertising: {}
        }

        ble.peripherals.push(peripheral);
        console.log('[NuvIoTBLE__startScan] Add Temp Device: ' + peripheral.name + ' ' + peripheral.id);
      }, 1000)

      window.setTimeout(() => {
        this.setIsScanning(false);
        window.clearInterval(timer);
      }, 5000);
    }
    else {
      if (!this.isScanning) {
        await BleManager.isBLEEnabled();
        
        console.log('We are starting to scan');
        BleManager.scan([SVC_UUID_NUVIOT], 5, false)
          .then((res) => {
            console.log('scanning started.');
            this.setIsScanning(true);
          })
          .catch((err) => {
            console.log('error');
            console.log(err);
          });
      }
      else {
        console.log('already scanning.');
      }
    }
  }

  stopScan() {
    BleManager.stopScan();
  }

  handleUpdateValueForCharacteristic(data: any) {
    console.log('response');
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  handleStopScan(ble: NuvIoTBLE) {
    if (ble == null) {
      console.log('stop can ble is null');
      return;
    }

    ble.setIsScanning(false);
  }

  handleDisconnectedPeripheral(ble: NuvIoTBLE, data: any) {
    let peripheral = this.peripherals.find(prf => prf.id === data.peripheral.id);
    if (peripheral) {
      //peripheral.connected = false;
      //peripherals.set(peripheral.id, peripheral);
      //setList(Array.from(peripherals.values()));
    }
    this.emitter?.emit('disconnected', data.peripheral.id)
    console.log('Disconnected from ' + data.peripheral);
  }

  async isConnected(id: string): Promise<boolean> {
    return await BleManager.isPeripheralConnected(id)
  }

  async connect(peripheral: Peripheral) {
    if (this.simulatedBLE()) {

    }
    else {
      let result = await BleManager.isPeripheralConnected(peripheral.id)
      console.log('Attempt to connect ' + peripheral.id);
      if (result) {
        console.log('already connected.');
      }
      else {
        console.log('Attempt to connect ' + peripheral.id);
        try {
          await BleManager.connect(peripheral.id)
          console.log('connected');
        }
        catch (e) {
          console.log(e);
        }
      }
    }
  }

  bin2String(array: []) {
    var result = "";
    for (const char of array) {
      result += String.fromCharCode(char);
    }
    return result;
  }

  async getServices(id: string): Promise<boolean> {
    try {
      await this.connectById(id);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  string2Bin(str: string): number[] {
    const bytes = [];
    for (let ii = 0; ii < str.length; ii++) {
      const code = str.charCodeAt(ii); // x00-xFFFF
      bytes.push(code & 255); // low, high
    }
    return bytes;
  }

  async getCharacteristic(id: string, serviceId: string, characteristicId: string): Promise<string | null> {
    if (this.simulatedBLE()) {
      return "";
    }
    else {
      try {
        let result = await BleManager.read(id, serviceId, characteristicId);
        let responseStr = this.bin2String(result);
        console.log("BLEManager__readCharacteristic: success, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
        return responseStr
      }
      catch (e) {
        console.log("BLEManager__readCharacteristic: failure, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
        return null;
      }
    }
  }

  async writeCharacteristic(id: string, serviceId: string, characteristicId: string, value: string): Promise<boolean> {
    try {
      let buffer = this.string2Bin(value);
      await BleManager.write(id, serviceId, characteristicId, buffer, 255);
      console.log("BLEManager__writeCharacteristic: success, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId + ", value=" + value);
      return true;
    }
    catch (e) {
      console.log("BLEManager__writeCharacteristic: failure, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
      return false;
    }
  }

  async writeNoResponseCharacteristic(id: string, serviceId: string, characteristicId: string, value: string): Promise<boolean> {
    try {
      let buffer = this.string2Bin(value);
      await BleManager.writeWithoutResponse(id, serviceId, characteristicId, buffer, 255);
      console.log("BLEManager__writeNoResponseCharacteristic: success, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
      return true;
    }
    catch (e) {
      console.log("BLEManager__writeNoResponseCharacteristic: failure, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
      return false;
    }
  }

  _cancelConnect: boolean = false;

  cancelConnect() {
    this._cancelConnect = true;
  }

  async connectById(id: string, characteristicId: string | undefined = undefined): Promise<boolean> {
    let retryCount = 5;

    ble.btEmitter?.emit('connecting', `Connecting to ${id}`);
    while (!this._cancelConnect) {
      if (this.simulatedBLE()) {
        return true;
      }
      else {
        let result = await BleManager.isPeripheralConnected(id)
        if (result) {
          console.log('BLEManager__connectById: already connected, id=' + id);
          return true;
        }
        else {
          try {
            console.log('BLEManager__connectById: Connect, id=' + id);
            await BleManager.connect(id);

            let services = await BleManager.retrieveServices(id);
            if (Platform.OS == "android") {
              await BleManager.requestMTU(id, 512);
            }

            if (characteristicId) {
              console.log('BLEManager__connectById: Connected, id=' + id);
              for (let chr of services.characteristics) {

                if (chr.characteristic.toLocaleLowerCase() == characteristicId.toLocaleLowerCase()) {
                  console.log('BLEManager__connectById: Connected to NuvIoT Device, id=' + id);
                  return true;
                }

                console.log(chr.characteristic, characteristicId);
              }

              console.log('BLEManager__connectById: Not NuvIoT Device, id=' + id);
              await this.disconnectById(id);
              return false;
            }

            console.log('BLEManager__connectById: Connected, not checking for service, id=' + id);
            return true;
          }
          catch (e) {
            console.log('BLEManager__connectById: Error - ' + e + ' id=' + id + ' retry count ' + retryCount);
            
            if (retryCount-- == 0)
              return false;

              ble.btEmitter?.emit('connecting', `Connecting to ${id} - Attempt ${5 - retryCount}`);
          }
        }
      }
    }

    console.log('BLEManager__connectById: Connection Attempt Cancelled');

    this._cancelConnect = false;

    return false;
  }

  async disconnectById(id: string): Promise<boolean> {
    if (this.simulatedBLE()) {
      return true;
    }
    else {
      let result = await BleManager.isPeripheralConnected(id)
      if (!result) {
        console.log("BLEManager__disconnectById: not connected.");
        return true;
      }
      else {
        try {
          await BleManager.disconnect(id, true);
          console.log("BLEManager__disconnectById;");

          let start = new Date();
          let delta = 0;
          while (await BleManager.isPeripheralConnected(id) && delta < 5000) {
            delta = (Date.now() - +(start));
          }

          if (await BleManager.isPeripheralConnected(id)) {
            console.log("BLEManager__disconnectById: false, id = " + id + "; timeout waiting for disconnect.");
            return false;
          }

          console.log("BLEManager__disconnectById: success, id = " + id);
          return true;
        }
        catch (e) {
          console.log("BLEManager__disconnectById: error, id = " + id + "," + e);
          return false;
        }
      }
    }
  }

  handleDiscoverPeripheral(ble: NuvIoTBLE, peripheral: Peripheral) {
    if (ble == null) {
      console.log('discover ble is null');
      return;
    }

    if (peripheral.name) {
      if (!ble.peripherals.find(flt => flt.id === (peripheral.id))) {
        ble.peripherals.push(peripheral);
        console.log('added -> ' + peripheral.name + ' - ' + peripheral.id);
        ble.btEmitter?.emit('connected', peripheral);
      }
    }
  }
}

export let ble = new NuvIoTBLE();
ble.subscribe(ble);
