export interface BLENuvIoTDevice {
    name: string;
    deviceFirmwareSku: string;
    peripheralId: string;
    provisioned: boolean;
    
    orgId?: string;
    repoId?: string;
    deviceUniqueId?: string;
    id: number;
}