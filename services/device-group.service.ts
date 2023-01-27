
import { NuviotClientService } from './nuviot-client.service';


export class DeviceGroupService {

    constructor(private client: NuviotClientService) { }

    getDeviceGroups(devicerepoid: string): Promise<Core.ListResponse<Devices.DeviceGroupSummary>> {
        return this.client.getListResponse<Devices.DeviceGroupSummary>(`api/repo/${devicerepoid}/groups`);
    }

    createDeviceGroup(devicerepoid: string): Promise<Core.FormResult<Devices.DeviceGroup, Devices.DeviceGroupView>> {
        return this.client.getFormResponse<Devices.DeviceGroup, Devices.DeviceGroupView>(`api/repo/${devicerepoid}/group/factory`);
    }

    getDeviceGroup(deviceRepoId: string, deviceGroupId: string): Promise<Core.FormResult<Devices.DeviceGroup, Devices.DeviceGroupView>> {
        return this.client.getFormResponse<Devices.DeviceGroup, Devices.DeviceGroupView>(`api/repo/${deviceRepoId}/group/${deviceGroupId}`);
    }

    getSummaryDataForDeviceGroup(deviceRepoId: string, deviceGroupId: string): Promise<Core.ListResponse<Devices.DeviceSummaryData>> {
        return this.client.getListResponse<Devices.DeviceSummaryData>(`/api/repo/${deviceRepoId}/group/${deviceGroupId}/devices/summarydata`);
    }

    insertDeviceGroup(group: Devices.DeviceGroup, devicerepoid: string): Promise<Core.InvokeResult> {
        return this.client.insert(`/api/repo/${devicerepoid}/group`, group);
    }

    updateDeviceGroup(group: Devices.DeviceGroup, devicerepoid: string): Promise<Core.InvokeResult> {
        return this.client.update(`/api/repo/${devicerepoid}/group`, group);
    }

    deleteDeviceGroup(devicerepoid: string, deviceGroupId: string): Promise<Core.InvokeResult> {
        return this.client.delete(`/api/repo/${devicerepoid}/group/${deviceGroupId}`);
    }

    /**
     * @param deviceRepoId Add a Device to a Device Group
     * @param groupId
     * @param deviceId
     */
    addDeviceToGroup(deviceRepoId: string, groupId: string, deviceId: string): Promise<Core.InvokeResultEx<Devices.DeviceGroupEntry>> {
        return this.client.requestForInvokeResultEx<Devices.DeviceGroupEntry>(`/api/repo/${deviceRepoId}/group/${groupId}/add/${deviceId}`);
    }

    removeDeviceFromGroup(deviceRepoId: string, groupId: string, deviceId: string): Promise<Core.InvokeResult> {
        return this.client.get(`/api/repo/${deviceRepoId}/group/${groupId}/remove/${deviceId}`);
    }
}
