import { IOValues } from './../models/blemodels/iovalues';
import { RemoteDeviceState } from './../models/blemodels/state';
import { SysConfig } from './../models/blemodels/sysconfig';

export class SimulatedData {
    getSysConfig(deviceId: string = 'device001'): SysConfig {
        return new SysConfig(`${deviceId},,,tmpsns,,,,,,,,,,,,,,`);
    }

    getRemoteDeviceState(deviceId: string = 'device001'): RemoteDeviceState {
        return new RemoteDeviceState(`SIM001,0.1.0,0.2.0,1,3,10.1.1.199,1,4,42.44.23.44,1,3.3,0,,,`);
    }

    getSensorValues() : IOValues {
        return new IOValues(',,1,,1,,,,,,,,,4,3,,');
    }

    getDeviceDetail() : any { 
        return {
        name: 'KDW Device 1',
        deviceRepository: {text:'Repo 1', id: '1234'},
        deviceType: {text: 'My Device Type', id: '1234', 'key': 'foo'},        
        deviceTypeLabel: 'Widget'
      }
    }

}

