// backend/src/services/network/deviceState.ts

export interface DeviceStatus {
  id: string;
  ip: string;
  online: boolean;
  latency: number | string;
  lastSeen: string;
}

export const deviceStatuses = new Map<string, DeviceStatus>();