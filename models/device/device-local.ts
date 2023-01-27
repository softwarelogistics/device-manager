export interface BLENuvIoTDevice {
    name: string;
    deviceType: string;
    peripheralId: string;
    provisioned: boolean;
    
    orgId?: string;
    repoId?: string;
    deviceUniqueId?: string;
    id: number;
}